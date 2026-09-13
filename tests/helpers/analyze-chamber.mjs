import {isSolid} from '../../dist/client/levels.js';
import {bindSeal,createPuzzle,turnIsland} from '../../dist/client/puzzles.js';

const stateKey=s=>[s.x,s.z,s.cx,s.cz,s.mode,...s.q,s.seals,s.shards].join(',');

// Enumerate every reachable game state, including persistent mechanisms and the
// most recent shared checkpoint, then find which states can reach a completed run.
export function analyze(level,{allowFalls=true,blockedIsland=null,blockedSeal=null,requireAllSeals=true}={}){
 const pristine=createPuzzle(level),spawn=pristine.tiles.find(t=>t.type==='S');
 const fullShards=(1<<level.shards.length)-1,fullSeals=(1<<pristine.seals.length)-1,cache=new Map();
 function puzzle(q,seals){
  const key=q.join(',')+';'+seals;
  if(cache.has(key))return cache.get(key);
  const p=createPuzzle(level);
  p.islands.forEach((island,j)=>{
   for(let i=0;i<q[j];i++){
    const result=turnIsland(p,island.id,island.pivot,0);
    if(!result.ok)throw Error('Unexpected build rotation failure '+result.reason);
   }
  });
  p.seals.forEach((seal,j)=>{
   if((seals&(1<<j))&&!bindSeal(p,seal.id,seal.anchor,1,seal.yaw,0))throw Error('Unexpected seal binding failure');
  });
  const tiles=new Map(p.tiles.map(tile=>[`${tile.x},${tile.z}`,tile]));
  const result={...p,at:(x,z)=>tiles.get(`${x},${z}`)};
  cache.set(key,result);return result;
 }
 function collect(s){
  const next={...s};
  level.shards.forEach((shard,i)=>{if(shard.x===s.x&&shard.z===s.z&&(shard.mode===undefined||shard.mode===s.mode))next.shards|=1<<i;});
  return next;
 }
 const initial={x:spawn.x,z:spawn.z,cx:spawn.x,cz:spawn.z,mode:0,q:pristine.islands.map(()=>0),seals:0,shards:0};
 const states=[initial],index=new Map([[stateKey(initial),0]]),parents=new Map(),reverse=[[]],won=[];
 for(let i=0;i<states.length;i++){
  const s=states[i],p=puzzle(s.q,s.seals),here=p.at(s.x,s.z);
  if(p.at(s.cx,s.cz)?.mask!==3)throw Error('Checkpoint must remain a fixed shared tile');
  if(here.type==='E'&&s.shards===fullShards&&(!requireAllSeals||s.seals===fullSeals)){won.push(i);continue;}
  const choices=[];
  for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){
   const x=s.x+dx,z=s.z+dz,tile=p.at(x,z);
   if(isSolid(tile,s.mode)){
    const next={...s,x,z};
    if(tile.mask===3){next.cx=x;next.cz=z;}
    choices.push([collect(next),`walk ${x},${z}`]);
   }else if(allowFalls)choices.push([{...s,x:s.cx,z:s.cz},`fall -> ${s.cx},${s.cz}`]);
  }
  const mode=1-s.mode,label=`shift ${mode?'blue':'amber'}`;
  if(isSolid(here,mode))choices.push([collect({...s,mode}),label]);
  else if(allowFalls)choices.push([{...s,mode,x:s.cx,z:s.cz},`${label} / fall -> ${s.cx},${s.cz}`]);
  p.islands.forEach((island,j)=>{
   if(island.id===blockedIsland||s.x!==island.pivot.x||s.z!==island.pivot.z||s.mode!==0)return;
   const result=turnIsland(structuredClone({tiles:p.tiles,islands:p.islands,seals:p.seals,width:p.width,height:p.height}),island.id,island.pivot,0);
   if(!result.ok)throw Error(`Blocked clockwise turn ${level.id} ${island.id} ${s.q}: ${result.reason}`);
   const q=[...s.q];q[j]=(q[j]+1)%4;
   choices.push([{...s,q},`turn ${island.id} q${q[j]}`]);
  });
  p.seals.forEach((seal,j)=>{
   if(seal.id===blockedSeal||seal.unlocked||s.mode!==1||s.x!==seal.anchor.x||s.z!==seal.anchor.z)return;
   choices.push([{...s,seals:s.seals|(1<<j)},`bind ${seal.id}`]);
  });
  for(const [next,action]of choices){
   const key=stateKey(next);let j=index.get(key);
   if(j===undefined){j=states.length;index.set(key,j);states.push(next);reverse.push([]);parents.set(j,{i,action});}
   reverse[j].push(i);
  }
 }
 const good=new Set(won),queue=[...won];
 for(let i=0;i<queue.length;i++)for(const previous of reverse[queue[i]])if(!good.has(previous)){good.add(previous);queue.push(previous);}
 const path=[];let j=won[0];
 while(j!==undefined&&j!==0){const previous=parents.get(j);path.push(previous.action);j=previous.i;}
 path.reverse();
 return {states:states.length,wins:won.length,stuck:states.length-good.size,solvable:!!won.length,actions:path.length,steps:path.filter(x=>x.startsWith('walk')).length,shifts:path.filter(x=>x.startsWith('shift')).length,turns:path.filter(x=>x.startsWith('turn')).length,bindings:path.filter(x=>x.startsWith('bind')).length,path,stuckExample:states.find((_,i)=>!good.has(i))};
}
