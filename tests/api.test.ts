import { afterEach, describe, expect, it, vi } from 'vitest';
import { handle, readBounded, type Env } from '../worker';

const origin = 'https://keo.example';

function environment(overrides: Partial<Env> = {}): Env {
  return {
    ASSETS: { fetch: vi.fn<Env['ASSETS']['fetch']>().mockResolvedValue(new Response('Static page')) },
    ...overrides,
  };
}

function request(body: unknown = { query: 'When is the next election?', mode: 'ask' }): Request {
  return new Request(origin + '/api/investigate', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const liveConfig = {
  AI_GATEWAY_ACCOUNT_ID: 'b'.repeat(32),
  AI_GATEWAY_ID: 'keo-tests',
  AI_GATEWAY_TOKEN: 'test-gateway-token',
  AI_MODEL: 'test-enabled-model',
};

afterEach(() => vi.unstubAllGlobals());

describe('HTTP API boundary', () => {
  it('serves assets but returns JSON for unknown API routes', async () => {
    const env = environment();
    const page = new Request(origin + '/sources');
    expect(await (await handle(page, env)).text()).toBe('Static page');
    expect(env.ASSETS.fetch).toHaveBeenCalledWith(page);
    const response = await handle(new Request(origin + '/api/missing'), env);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Not found' });
  });

  it('reports live availability only when a gateway and a rate limiter are configured', async () => {
    for (const [env, live] of [
      [environment(), false],
      [environment(liveConfig), false],
      [environment({ ...liveConfig, RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) } }), true],
    ] as const) {
      const response = await handle(new Request(origin + '/api/status'), env);
      expect(await response.json()).toEqual({ live, provider: 'Cloudflare AI Gateway' });
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
  });

  it.each(['GET', 'PUT', 'DELETE'])('rejects %s investigation requests', async (method) => {
    const response = await handle(new Request(origin + '/api/investigate', { method }), environment());
    expect(response.status).toBe(405);
    expect(await response.json()).toEqual({ error: 'Use POST' });
  });

  it.each([null, 'https://attacker.example', 'null'])('rejects missing or foreign origin %s', async (value) => {
    const input = request();
    if (value === null) input.headers.delete('origin');
    else input.headers.set('origin', value);
    const response = await handle(input, environment());
    expect(response.status).toBe(403);
  });

  it('requires JSON content and disables caching of errors', async () => {
    const input = request();
    input.headers.set('content-type', 'text/plain');
    const response = await handle(input, environment());
    expect(response.status).toBe(415);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it.each([
    { query: '    ', mode: 'ask' },
    { query: 'four', mode: 'ask' },
    { query: 'x'.repeat(2001), mode: 'ask' },
    { query: 'A public claim', mode: 'invented-mode' },
    { query: 123456, mode: 'ask' },
    { query: 'A public claim', mode: 'ask', unexpected: true },
    { mode: 'ask' },
    null,
  ])('rejects invalid or unexpected request fields', async (body) => {
    const response = await handle(request(body), environment());
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
  });

  it('rejects malformed JSON, an absent body and an oversized declared body', async () => {
    for (const body of ['{invalid JSON', undefined]) {
      const input = new Request(origin + '/api/investigate', {
        method: 'POST', headers: { origin, 'content-type': 'application/json' }, body,
      });
      expect((await handle(input, environment())).status).toBe(400);
    }
    const large = request();
    large.headers.set('content-length', '4200001');
    expect((await handle(large, environment())).status).toBe(400);
  });

  it('bounds actual body bytes even without a Content-Length header', async () => {
    const input = new Request(origin + '/api/investigate', { method: 'POST', body: 'ééé' });
    expect(input.headers.has('content-length')).toBe(false);
    await expect(readBounded(input, 5)).rejects.toThrow('Too large');
    const accepted = new Request(origin + '/api/investigate', { method: 'POST', body: 'ééé' });
    await expect(readBounded(accepted, 6)).resolves.toBe('ééé');
  });
});

describe('investigation stream and rate limiting', () => {
  it('streams a curated result with a trace and honest uncertainty without network access', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);
    const response = await handle(request(), environment());
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/x-ndjson');
    expect(response.headers.get('cache-control')).toBe('no-store');
    const lines = (await response.text()).trim().split('\n').map((line) => JSON.parse(line));
    expect(lines[0]).toMatchObject({ type: 'step', message: 'Searching the curated evidence library' });
    expect(lines.at(-1)).toMatchObject({
      type: 'result',
      result: { mode: 'curated', status: 'insufficient_evidence', confidence: 'unknown', provider: null },
    });
    const result = lines.at(-1).result;
    expect(result.evidence_ids).toEqual(result.evidence.map((item: { id: string }) => item.id));
    expect(result.evidence).toHaveLength(1);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('limits live requests using the connecting IP before contacting the gateway', async () => {
    const limit = vi.fn<NonNullable<Env['RATE_LIMITER']>['limit']>().mockResolvedValue({ success: false });
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);
    const input = request();
    input.headers.set('cf-connecting-ip', '192.0.2.1');
    const response = await handle(input, environment({ ...liveConfig, RATE_LIMITER: { limit } }));
    expect(response.status).toBe(429);
    expect(limit).toHaveBeenCalledWith({ key: '192.0.2.1' });
    expect(await response.json()).toHaveProperty('error');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('keeps gateway configuration without a rate limiter in curated mode', async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);
    const response = await handle(request(), environment(liveConfig));
    const lines = (await response.text()).trim().split('\n').map((line) => JSON.parse(line));
    expect(lines.at(-1).result.mode).toBe('curated');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('returns an unavailable result when an allowed live request fails upstream', async () => {
    const limit = vi.fn<NonNullable<Env['RATE_LIMITER']>['limit']>().mockResolvedValue({ success: true });
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('Private upstream diagnostic'));
    vi.stubGlobal('fetch', fetcher);
    const response = await handle(request(), environment({ ...liveConfig, RATE_LIMITER: { limit } }));
    const text = await response.text();
    const lines = text.trim().split('\n').map((line) => JSON.parse(line));
    expect(response.status).toBe(200);
    expect(lines.at(-1)).toMatchObject({ type: 'result', result: { mode: 'unavailable', status: 'insufficient_evidence' } });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(text).not.toContain('Private upstream diagnostic');
    expect(text).not.toContain('test-gateway-token');
  });
});
