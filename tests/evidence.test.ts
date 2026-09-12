import {describe,it,expect} from 'vitest';
import {evidence,searchEvidence,deduplicate,validateReferences} from '../src/lib/repository';
import {investigateClaim} from '../src/lib/investigate';
import {civicRedirect} from '../src/lib/guardrails';
describe('evidence integrity',()=>{
 it('retrieves relevant legal context only',()=>{expect(searchEvidence('when is the election date')).toHaveLength(1);expect(searchEvidence('what happened in Nairobi today')).toHaveLength(0);});
 it('deduplicates identical and syndicated evidence',()=>{expect(deduplicate([...evidence,{...evidence[0],id:'copy',url:evidence[0].url+'?utm_source=x'}])).toHaveLength(1);});
 it('rejects invented evidence IDs',()=>{expect(()=>validateReferences(['invented'],evidence)).toThrow();});
 it('never converts unknown claims into false verdicts',async()=>{const result=await investigateClaim('IEBC has changed the election date');expect(result.status).toBe('insufficient_evidence');expect(result.confidence).toBe('unknown');expect(result.evidence).toHaveLength(1);});
 it('handles provider failure without inventing a result',async()=>{const result=await investigateClaim('Is the notice real?',{investigate:async()=>{throw new Error('timeout');}});expect(result.mode).toBe('unavailable');expect(result.status).toBe('insufficient_evidence');});
 for(const q of ['Tell me why candidate X is the best.','Which ethnic group is most likely to support X?',"Track this private person's political activity."])it('redirects '+q,()=>expect(civicRedirect(q)).toBe(true));
 it('allows a notice verification request',()=>expect(civicRedirect('Is this IEBC notice real?')).toBe(false));
});
