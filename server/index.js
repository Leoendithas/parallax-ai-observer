import {database} from './database.js';
import {VERSION,validateName,validateReplay} from './validation.js';
import {LEVELS} from '../dist/client/levels.js';
const chamberIds=new Set(LEVELS.map(level=>level.id));
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
async function body(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Error('Send JSON.');
 const reader=request.body?.getReader();if(!reader)throw new Error('Missing request.');
 let size=0,text='';const decoder=new TextDecoder();
 try{while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>65536)throw new Error('Attempt is too long.');text+=decoder.decode(chunk.value,{stream:true});}text+=decoder.decode();const data=JSON.parse(text);if(!data||Array.isArray(data)||typeof data!=='object')throw new Error('Invalid request.');return data;}finally{await reader.cancel().catch(()=>{});}
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 try{
  const db=database(env);
  if(url.pathname==='/api/leaderboard'&&request.method==='GET'){
   const chamber=Number(url.searchParams.get('chamber'));if(!Number.isInteger(chamber)||!chamberIds.has(chamber))return json({error:'Choose an available chamber.'},400);
   const entries=await db.all(`SELECT name,elapsed_ms AS elapsedMs,falls FROM (
    SELECT name,elapsed_ms,falls,started_at,ROW_NUMBER() OVER(PARTITION BY player ORDER BY elapsed_ms,falls,started_at) AS best
    FROM runs WHERE version=? AND chamber=? AND elapsed_ms IS NOT NULL
   ) WHERE best=1 ORDER BY elapsed_ms,falls,started_at LIMIT 20`,VERSION,chamber);
   return json({chamber,entries});
  }
  if(url.pathname==='/api/runs'&&request.method==='POST'){
   const data=await body(request),name=validateName(data.name),chamber=data.chamber;
   if(!Number.isInteger(chamber)||!chamberIds.has(chamber)||!(/^[a-f0-9]{64}$/).test(data.player))return json({error:'Choose a valid chamber and player.'},400);
   const now=Date.now(),ip=request.headers.get('cf-connecting-ip')||'local';
   const ipHash=hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip))));
   const count=await db.first('SELECT COUNT(*) AS count FROM runs WHERE ip_hash=? AND started_at>?',ipHash,now-3600000);
   if(count.count>=100)return json({error:'Too many new attempts. Try practice and come back later.'},429);
   const token=hex(crypto.getRandomValues(new Uint8Array(32)));
   await db.run('INSERT INTO runs(token,chamber,player,name,ip_hash,started_at,version) VALUES(?,?,?,?,?,?,?)',token,chamber,data.player,name,ipHash,now,VERSION);
   return json({token,startedAt:now,name,chamber},201);
  }
  if(url.pathname==='/api/runs/finish'&&request.method==='POST'){
   const data=await body(request);if(!(/^[a-f0-9]{64}$/).test(data.token))return json({error:'This attempt is unavailable.'},400);
   const run=await db.first('SELECT * FROM runs WHERE token=?',data.token);
   if(!run||run.version!==VERSION)return json({error:'This attempt expired. Start a new attempt.'},404);
   if(run.elapsed_ms!==null)return json({elapsedMs:run.elapsed_ms,falls:run.falls,saved:true});
   const elapsed=data.durationMs;
   if(!Number.isInteger(elapsed)||elapsed<0||elapsed>Date.now()-run.started_at+1000)return json({error:'This attempt’s timing could not be verified.'},400);
   const {falls}=validateReplay(run.chamber,data.events,elapsed);
   await db.run('UPDATE runs SET elapsed_ms=?,falls=? WHERE token=? AND elapsed_ms IS NULL',elapsed,falls,data.token);
   const saved=await db.first('SELECT elapsed_ms AS elapsedMs,falls FROM runs WHERE token=?',data.token);
   return json({...saved,saved:true});
  }
  return json({error:'Not found.'},404);
 }catch(error){
  if(error instanceof SyntaxError||/nickname|JSON|request|attempt|Attempt|movement|chamber|sequence/i.test(error.message))return json({error:error.message},400);
  console.error('Leaderboard request failed',error.message);return json({error:'The leaderboard is temporarily unavailable. Please try again.'},503);
 }
}};
