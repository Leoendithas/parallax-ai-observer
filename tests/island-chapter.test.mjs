
import assert from 'node:assert/strict';
import test from 'node:test';
import {LEVELS,isSolid} from '../dist/client/levels.js';
import {createPuzzle,turnIsland} from '../dist/client/puzzles.js';
const levels=LEVELS.filter(level=>level.id>=7&&level.id<=12);
const key=s=>[s.x,s.z,s.cx,s.cz,s.mode,...s.q,s.shards].join(',');
export function analyze(level,{allowFalls=true,blockedIsland=null}={}){
 const pristine=createPuzzle(level),spawn=pristine.tiles.find(t=>t.type==='S'),fullShards=(1<<level.shards.length)-1,cache=new Map();
 function puzzle(q){const k=q.join(',');if(cache.has(k))return cache.get(k);const p=createPuzzle(level);p.islands.forEach((a,j)=>{for(let i=0;i<q[j];i++){const r=turnIsland(p,a.id,a.pivot,0);if(!r.ok)throw Error('Unexpected build rotation failure '+r.reason);}});cache.set(k,p);return p;}
 function collect(s){const t={...s};level.shards.forEach((a,i)=>{if(a.x===s.x&&a.z===s.z&&(a.mode===undefined||a.mode===s.mode))t.shards|=1<<i;});return t;}
 const initial={x:spawn.x,z:spawn.z,cx:spawn.x,cz:spawn.z,mode:0,q:pristine.islands.map(()=>0),shards:0};
 const states=[initial],index=new Map([[key(initial),0]]),parents=new Map(),reverse=[[]],won=[];
 for(let i=0;i<states.length;i++){
  const s=states[i],p=puzzle(s.q),at=(x,z)=>p.tiles.find(t=>t.x===x&&t.z===z),here=at(s.x,s.z);
  if(here.type==='E'&&s.shards===fullShards){won.push(i);continue;}
  const choices=[];
  for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=s.x+dx,z=s.z+dz,t=at(x,z);if(isSolid(t,s.mode)){let n={...s,x,z};if(t.mask===3){n.cx=x;n.cz=z;}choices.push([collect(n),'walk '+x+','+z]);}else if(allowFalls)choices.push([{...s,x:s.cx,z:s.cz},'fall -> '+s.cx+','+s.cz]);}
  const newMode=1-s.mode;if(isSolid(here,newMode))choices.push([collect({...s,mode:newMode}),'shift '+(newMode?'blue':'amber')]);else if(allowFalls)choices.push([{...s,mode:newMode,x:s.cx,z:s.cz},'shift '+(newMode?'blue':'amber')+' / fall -> '+s.cx+','+s.cz]);
  p.islands.forEach((a,j)=>{if(a.id===blockedIsland||s.x!==a.pivot.x||s.z!==a.pivot.z||s.mode!==0)return;const test=createPuzzle(level);test.islands.forEach((b,k)=>{for(let z=0;z<s.q[k];z++)turnIsland(test,b.id,b.pivot,0);});const turn=turnIsland(test,a.id,a.pivot,0);if(!turn.ok)throw Error('Blocked clockwise turn '+level.id+' '+a.id+' '+s.q+' '+turn.reason);let q=[...s.q];q[j]=(q[j]+1)%4;choices.push([{...s,q},'turn '+a.id+' q'+q[j]]);});
  for(const [n,action]of choices){const k=key(n);let j=index.get(k);if(j===undefined){j=states.length;index.set(k,j);states.push(n);reverse.push([]);parents.set(j,{i,action});}reverse[j].push(i);}
 }
 const good=new Set(won),queue=[...won];for(let i=0;i<queue.length;i++)for(const p of reverse[queue[i]])if(!good.has(p)){good.add(p);queue.push(p);}
 const path=[];let j=won[0];while(j!==undefined&&j!==0){const a=parents.get(j);path.push(a.action);j=a.i;}path.reverse();
 return {states:states.length,wins:won.length,stuck:states.length-good.size,solvable:!!won.length,actions:path.length,steps:path.filter(x=>x.startsWith('walk')).length,shifts:path.filter(x=>x.startsWith('shift')).length,turns:path.filter(x=>x.startsWith('turn')).length,path,stuckExample:states.find((_,i)=>!good.has(i))};
}
for(const level of levels)test(`island chamber ${level.id} is solvable and recoverable, and needs every island`,()=>{
 const withFalls=analyze(level),noFalls=analyze(level,{allowFalls:false});
 assert.ok(withFalls.solvable, 'Chamber '+level.id+' must be solvable');
 assert.equal(withFalls.stuck,0,'Chamber '+level.id+' has an unrecoverable state');
 assert.equal(withFalls.actions,noFalls.actions,'Falls should not shorten chamber '+level.id);
 for(const island of level.islands)assert.equal(analyze(level,{blockedIsland:island.id}).solvable,false,'Island '+island.id+' can be bypassed in chamber '+level.id);
});
