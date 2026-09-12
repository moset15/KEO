import { RequestSchema } from '../src/lib/schemas';
import { GatewayProvider,gatewayReady,type GatewayConfig } from '../src/lib/gateway';
import { investigateClaim } from '../src/lib/investigate';
export interface Env extends GatewayConfig {ASSETS:{fetch:(request:Request)=>Promise<Response>};RATE_LIMITER?:{limit:(input:{key:string})=>Promise<{success:boolean}>};}
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function readBounded(request:Request,max=4200000):Promise<string>{
 if(Number(request.headers.get('content-length'))>max)throw new Error('Too large');
 const reader=request.body?.getReader();if(!reader)throw new Error('Empty body');
 const decoder=new TextDecoder();let bytes=0;let text='';
 try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>max)throw new Error('Too large');text+=decoder.decode(value,{stream:true});}return text+decoder.decode();}finally{await reader.cancel();}
}
export async function handle(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);
 if(url.pathname==='/api/status')return json({live:gatewayReady(env)&&!!env.RATE_LIMITER,provider:'Cloudflare AI Gateway'});
 if(url.pathname!=='/api/investigate')return url.pathname.startsWith('/api/')?json({error:'Not found'},404):env.ASSETS.fetch(request);
 if(request.method!=='POST')return json({error:'Use POST'},405);
 if(request.headers.get('origin')!==url.origin)return json({error:'Same-origin requests only'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required'},415);
 let input;
 try{input=RequestSchema.parse(JSON.parse(await readBounded(request)));}catch{return json({error:'Enter 5–2,000 characters. The request must be valid JSON within the size limit.'},400);}
 if(input.mode==='verify'||input.image)return json({error:'Image verification is not available in this slice. Paste the visible claim instead.'},503);
 const live=gatewayReady(env)&&!!env.RATE_LIMITER;
 if(live){
  const allowed=await env.RATE_LIMITER!.limit({key:request.headers.get('cf-connecting-ip')??'local'});
  if(!allowed.success)return json({error:'Request limit reached. Please wait a minute before trying again.'},429);
 }
 const stream=new ReadableStream({async start(controller){
  const encoder=new TextEncoder();
  const emit=(value:unknown)=>controller.enqueue(encoder.encode(JSON.stringify(value)+'\n'));
  try{const result=await investigateClaim(input.query,live?new GatewayProvider(env):undefined,message=>emit({type:'step',message}));emit({type:'result',result});}
  catch{emit({type:'error',message:'The investigation could not be completed. Please try again.'});}
  finally{controller.close();}
 }});
 return new Response(stream,{headers:{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export default {fetch:handle};
