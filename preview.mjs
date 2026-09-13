import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import worker from './server/index.js';
import {localDatabase} from './server/local-db.mjs';
const base=resolve('dist/client'),port=Number(process.env.PORT||5174),DB=await localDatabase();
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg'};
const ASSETS={async fetch(request){
 const path=decodeURIComponent(new URL(request.url).pathname),file=resolve(base,'.'+(path==='/'?'/index.html':path));
 if(!file.startsWith(base+sep))return new Response('Not found',{status:404});
 try{return new Response(await readFile(file),{headers:{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}});}catch{return new Response('Not found',{status:404});}
}};
createServer(async(req,res)=>{
 try{
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>65536){res.writeHead(413);res.end('Too large');return;}chunks.push(chunk);}
  const request=new Request(`http://127.0.0.1:${port}${req.url}`,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
  const response=await worker.fetch(request,{DB,ASSETS});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
 }catch(error){console.error(error.message);res.writeHead(500);res.end('Request failed');}
}).listen(port,'127.0.0.1',()=>console.log(`Parallax preview http://127.0.0.1:${port}`));
