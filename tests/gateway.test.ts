import { describe, expect, it, vi } from 'vitest';
import {
  extractSearchEvidence,
  GatewayProvider,
  gatewayReady,
  outputText,
  sourceForUrl,
  type GatewayConfig,
  type GatewayResponse,
} from '../src/lib/gateway';
import { evidence as curatedEvidence } from '../src/lib/repository';
import { type Analysis } from '../src/lib/schemas';

const config: GatewayConfig = {
  AI_GATEWAY_ACCOUNT_ID: 'a'.repeat(32),
  AI_GATEWAY_ID: 'keo-tests',
  AI_GATEWAY_TOKEN: 'test-gateway-token',
  AI_MODEL: 'test-enabled-model',
};

function message(text: string): GatewayResponse {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text }] }],
  };
}

function searchResponse(urls: string[] = []): GatewayResponse {
  return {
    status: 'completed',
    output: [
      { type: 'web_search_call', status: 'completed' },
      {
        type: 'message',
        content: [{
          type: 'output_text',
          text: 'The retrieved source provides public evidence relevant to the claim.',
          annotations: urls.map((url) => ({ type: 'url_citation', url, title: 'Retrieved evidence' })),
        }],
      },
    ],
  };
}

function analysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    claim: 'What does Article 101 say?',
    status: 'supported',
    confidence: 'high',
    summary: 'The cited constitutional article explains the regular election schedule.',
    observations: ['The record is legal background.'],
    evidence_ids: [curatedEvidence[0].id],
    contradictions: [],
    information_gaps: ['This is not confirmation of a current administrative notice.'],
    recommended_next_checks: ['Check the latest official notice.'],
    ...overrides,
  };
}

function mockedProvider(search: GatewayResponse, result: GatewayResponse) {
  const fetcher = vi.fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json(search))
    .mockResolvedValueOnce(Response.json(result));
  return { fetcher, provider: new GatewayProvider(config, fetcher) };
}

describe('Cloudflare AI Gateway requests', () => {
  it('requires every gateway setting before enabling live investigations', () => {
    expect(gatewayReady(config)).toBe(true);
    for (const key of Object.keys(config) as (keyof GatewayConfig)[]) {
      expect(gatewayReady({ ...config, [key]: undefined })).toBe(false);
    }
  });

  it('uses the configured gateway and model without storing, logging or caching claims', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(message('Complete')));
    await new GatewayProvider(config, fetcher).response({ input: 'Public question' });
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe(`https://gateway.ai.cloudflare.com/v1/${config.AI_GATEWAY_ACCOUNT_ID}/keo-tests/openai/responses`);
    expect(init?.method).toBe('POST');
    const headers = new Headers(init?.headers);
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('cf-aig-authorization')).toBe('Bearer test-gateway-token');
    expect(headers.get('cf-aig-collect-log')).toBe('false');
    expect(headers.get('cf-aig-skip-cache')).toBe('true');
    expect(JSON.parse(String(init?.body))).toMatchObject({
      model: 'test-enabled-model', store: false, input: 'Public question',
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([
    { ...config, AI_GATEWAY_ACCOUNT_ID: 'invalid-account' },
    { ...config, AI_GATEWAY_ID: '../another-gateway' },
    { ...config, AI_GATEWAY_TOKEN: undefined },
  ])('rejects incomplete or unsafe configuration before fetching', async (invalid) => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(new GatewayProvider(invalid, fetcher).response({})).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects upstream HTTP errors and malformed response envelopes', async () => {
    const failed = vi.fn<typeof fetch>().mockResolvedValue(new Response('Internal provider detail', { status: 502 }));
    await expect(new GatewayProvider(config, failed).response({})).rejects.toThrow('Gateway request failed (502)');
    const malformed = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ output: 'invalid' }));
    await expect(new GatewayProvider(config, malformed).response({})).rejects.toThrow();
  });

  it('requires web search and requests a strict JSON schema before accepting cited results', async () => {
    const { provider, fetcher } = mockedProvider(searchResponse(), message(JSON.stringify(analysis())));
    const step = vi.fn<(message: string) => void>();
    const result = await provider.investigate('What does Article 101 say?', curatedEvidence, step);
    const search = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(search.tool_choice).toBe('required');
    expect(search.tools[0]).toMatchObject({ type: 'web_search' });
    expect(search.tools[0].filters.allowed_domains).toContain('www.iebc.or.ke');
    expect(search.tools[0].filters.allowed_domains).not.toContain('www.geoboundaries.org');
    const request = JSON.parse(String(fetcher.mock.calls[1][1]?.body));
    expect(request.text.format).toMatchObject({ type: 'json_schema', name: 'investigation', strict: true });
    expect(request.text.format.schema.additionalProperties).toBe(false);
    expect(request.text.format.schema.required).toContain('evidence_ids');
    expect(request.text.format.schema).not.toHaveProperty('$schema');
    expect(JSON.parse(request.input).evidence[0].id).toBe(curatedEvidence[0].id);
    expect(result.evidence).toEqual(curatedEvidence);
    expect(result.analysis.confidence).toBe('high');
    expect(step).toHaveBeenCalledTimes(2);
  });

  it.each([
    'not JSON',
    JSON.stringify({ summary: 'Missing required fields' }),
    JSON.stringify(analysis({ status: 'invented-status' as Analysis['status'] })),
    JSON.stringify(analysis({ evidence_ids: ['invented-evidence-id'] })),
  ])('rejects malformed analysis or invented references', async (text) => {
    const { provider } = mockedProvider(searchResponse(), message(text));
    await expect(provider.investigate('What does Article 101 say?', curatedEvidence, () => {})).rejects.toThrow();
  });

  it('rejects a search that has not completed before asking for a verdict', async () => {
    const { provider, fetcher } = mockedProvider(message('Unretrieved claim'), message(JSON.stringify(analysis())));
    await expect(provider.investigate('What does Article 101 say?', curatedEvidence, () => {})).rejects.toThrow('Search did not complete');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('downgrades an uncited confident answer to insufficient evidence', async () => {
    const { provider } = mockedProvider(searchResponse(), message(JSON.stringify(analysis({ evidence_ids: [] }))));
    const result = await provider.investigate('Is this notice real?', [], () => {});
    expect(result.analysis).toMatchObject({ status: 'insufficient_evidence', confidence: 'unknown' });
    expect(result.evidence).toEqual([]);
  });

  it('does not accept high confidence from one non-primary source', async () => {
    const { provider } = mockedProvider(
      searchResponse(['https://africacheck.org/fact-checks/example']),
      message(JSON.stringify(analysis({ evidence_ids: ['live-0'] }))),
    );
    const result = await provider.investigate('Is this notice real?', [], () => {});
    expect(result.analysis.confidence).toBe('low');
    expect(result.evidence[0].source_id).toBe('africa-check');
  });
});

describe('retrieved citation integrity', () => {
  it('accepts declared source hosts and real subdomains', () => {
    expect(sourceForUrl('https://www.iebc.or.ke/notices/123')?.source_id).toBe('iebc');
    expect(sourceForUrl('https://notices.iebc.or.ke/123')?.source_id).toBe('iebc');
  });

  it.each([
    'http://www.iebc.or.ke/notices/123',
    'https://www.iebc.or.ke.attacker.example/notice',
    'https://notiebc.or.ke/notice',
    'https://user:password@www.iebc.or.ke/notice',
    'https://unregistered.example/notice',
    'javascript:alert(1)',
    'not a URL',
  ])('rejects untrusted citation URL %s', (url) => {
    expect(sourceForUrl(url)).toBeUndefined();
  });

  it('uses actual citations, filters unsuitable URLs, deduplicates and ranks primary evidence first', () => {
    const response = searchResponse([
      'https://openai.com/global-affairs/report',
      'https://africacheck.org/fact-checks/example',
      'https://www.iebc.or.ke/notices/123',
      'https://www.iebc.or.ke/notices/123?utm_source=duplicate',
      'https://www.iebc.or.ke/',
      'http://www.iebc.or.ke/notices/insecure',
      'https://unregistered.example/notice',
      'https://www.geoboundaries.org/api/current/gbOpen/KEN/ADM1/',
    ]);
    response.output.push({ type: 'web_search_call', action: { sources: [{ url: 'https://pesacheck.org/not-cited' }] } });
    const items = extractSearchEvidence(response, '2026-09-12T12:00:00Z');
    expect(items.map((item) => item.source_type)).toEqual(['primary', 'fact_check', 'research']);
    expect(items.map((item) => item.source_id)).toEqual(['iebc', 'africa-check', 'openai']);
    expect(items.every((item) => item.published_at === null && item.hash === null)).toBe(true);
    expect(items[0].retrieved_at).toBe('2026-09-12T12:00:00Z');
    expect(items[0].notes).toContain('not a direct quotation');
  });

  it('rejects incomplete, refused and empty provider output', () => {
    expect(() => outputText({ ...message('Partial answer'), status: 'incomplete' })).toThrow('Incomplete');
    expect(() => outputText({ output: [{ type: 'message', content: [{ type: 'refusal' }] }] })).toThrow('declined');
    expect(() => outputText({ output: [] })).toThrow('Empty');
  });
});
