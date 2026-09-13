import registry from '../../data/sources/registry.json';
import records from '../../data/evidence.json';
import { SourceSchema, EvidenceSchema, type Evidence } from './schemas';
export const sources=registry.map(s=>SourceSchema.parse(s));
export const evidence=records.map(e=>EvidenceSchema.parse(e));
export function getSource(id:string){return sources.find(s=>s.source_id===id);}
export function deduplicate(items:Evidence[]):Evidence[]{
 const seen=new Set<string>();
 return items.filter(e=>{const u=new URL(e.url);u.hash='';for(const key of [...u.searchParams.keys()])if(key.startsWith('utm_'))u.searchParams.delete(key);const keys=[u.href,e.independence_key];if(keys.some(k=>seen.has(k)))return false;keys.forEach(k=>seen.add(k));return true;});
}
export function rankEvidence(items:Evidence[]):Evidence[]{
 const ranks={primary:0,fact_check:1,secondary:2,media:3,research:4};
 return deduplicate([...items].sort((a,b)=>ranks[a.source_type]-ranks[b.source_type]));
}
export function searchEvidence(query:string):Evidence[]{
 const q=query.toLowerCase();
 if(/date|when|august|constitution|article 101|election calendar|postpon|changed/.test(q))return rankEvidence(evidence);
 return [];
}
export const searchOfficialSources=(query:string)=>searchEvidence(query).filter(e=>e.source_type==='primary');
export const searchFactChecks=(query:string)=>searchEvidence(query).filter(e=>e.source_type==='fact_check');
export const searchThreatReports=(query:string)=>searchEvidence(query).filter(e=>e.source_type==='research');
export function validateReferences(ids:string[],items:Evidence[]):void{
 if(ids.some(id=>!items.some(e=>e.id===id)))throw new Error('Unknown evidence reference');
 for(const e of items)if(!getSource(e.source_id))throw new Error('Unknown source');
}
