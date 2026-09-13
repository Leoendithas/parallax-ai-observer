import {isSolid} from '../../dist/client/levels.js';
import {bindSeal,bridgeAlignment,canWalkBetween,crossPerspectiveBridge,shiftEcho,turnIsland} from '../../dist/client/puzzles.js';
import {createPuzzleStates} from './solve-chamber.mjs';

const stateKey=s=>[s.x,s.z,s.cx,s.cz,s.mode,s.configuration,s.shards].join(',');
const blocked=(value,id)=>Array.isArray(value)?value.includes(id):value===id;

// Enumerate all reachable states, including the last white checkpoint and the
// single transient echo, then walk backwards from wins to detect soft locks.
export function analyze(level,{allowFalls=true,blockedIsland=null,blockedSeal=null,requireAllSeals=true,blockEcho=null,blockBridge=null}={}){
 const configurations=createPuzzleStates(level),pristine=configurations.states[0].puzzle,spawn=pristine.tiles.find(tile=>tile.type==='S');
 const fullShards=(1<<level.shards.length)-1;
 function collect(s){
  const next={...s};
  level.shards.forEach((shard,i)=>{if(shard.x===s.x&&shard.z===s.z&&(shard.mode===undefined||shard.mode===s.mode))next.shards|=1<<i;});
  return next;
 }
 const initial=collect({x:spawn.x,z:spawn.z,cx:spawn.x,cz:spawn.z,mode:0,configuration:0,shards:0});
 const states=[initial],index=new Map([[stateKey(initial),0]]),parents=[null],reverse=[[]],won=[];
 for(let i=0;i<states.length;i++){
  const s=states[i],{puzzle:p,at}=configurations.states[s.configuration],here=at(s.x,s.z);
  if(at(s.cx,s.cz)?.mask!==3)throw Error('Checkpoint must remain a fixed shared tile');
  if(here.type==='E'&&s.shards===fullShards&&(!requireAllSeals||p.seals.every(seal=>seal.unlocked))){won.push(i);continue;}
  const choices=[];
  for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){
   const x=s.x+dx,z=s.z+dz,tile=at(x,z);
   if(canWalkBetween(here,tile,s.mode)){
    const next={...s,x,z};
    if(tile.mask===3){next.cx=x;next.cz=z;}
    choices.push([collect(next),`walk ${x},${z}`]);
   }else if(allowFalls)choices.push([{...s,x:s.cx,z:s.cz},`fall -> ${s.cx},${s.cz}`]);
  }
  const mode=1-s.mode,label=`shift ${mode?'blue':'amber'}`;
  let shiftedConfiguration=s.configuration;
  if(p.echoPads.length){
   const shifted=structuredClone(p),pad=p.echoPads.find(pad=>pad.anchor.x===s.x&&pad.anchor.z===s.z&&pad.mode===s.mode);
   // Blocking a source must still clear an existing echo, as every shift does.
   shiftEcho(shifted,pad&&blocked(blockEcho,pad.id)?{x:-1,z:-1}:s,s.mode,mode);
   shiftedConfiguration=configurations.add(shifted);
  }
  if(isSolid(configurations.states[shiftedConfiguration].at(s.x,s.z),mode))choices.push([collect({...s,mode,configuration:shiftedConfiguration}),label]);
  else if(allowFalls)choices.push([{...s,mode,configuration:shiftedConfiguration,x:s.cx,z:s.cz},`${label} / fall -> ${s.cx},${s.cz}`]);
  for(const island of p.islands){
   if(island.id===blockedIsland||s.x!==island.pivot.x||s.z!==island.pivot.z||s.mode!==0)continue;
   const turned=structuredClone(p);
   if(turnIsland(turned,island.id,s,0).ok)choices.push([{...s,configuration:configurations.add(turned)},`turn ${island.id} q${turned.islands.find(item=>item.id===island.id).quarter}`]);
  }
  for(const seal of p.seals){
   if(seal.id===blockedSeal||seal.unlocked||s.mode!==1||s.x!==seal.anchor.x||s.z!==seal.anchor.z)continue;
   const bound=structuredClone(p);
   if(bindSeal(bound,seal.id,s,1,seal.yaw,0))choices.push([{...s,configuration:configurations.add(bound)},`bind ${seal.id}`]);
  }
  for(const bridge of p.perspectiveBridges){
   if(blocked(blockBridge,bridge.id)||s.mode!==0)continue;
   const {atEndpoint,angle}=bridgeAlignment(bridge,s,s.mode,0,p);if(!atEndpoint)continue;
   const target=crossPerspectiveBridge(p,bridge.id,s,s.mode,angle);
   if(target)choices.push([collect({...s,x:target.x,z:target.z,cx:target.x,cz:target.z}),`bridge ${bridge.id}`]);
  }
  for(const [next,action]of choices){
   const key=stateKey(next);let j=index.get(key);
   if(j===undefined){j=states.length;index.set(key,j);states.push(next);reverse.push([]);parents.push({i,action});}
   reverse[j].push(i);
  }
 }
 const good=new Set(won),queue=[...won];
 for(let i=0;i<queue.length;i++)for(const previous of reverse[queue[i]])if(!good.has(previous)){good.add(previous);queue.push(previous);}
 const path=[];let j=won[0];
 while(j!==undefined&&j!==0){const previous=parents[j];path.push(previous.action);j=previous.i;}
 path.reverse();
 const describe=s=>s&&({...s,islands:configurations.states[s.configuration].puzzle.islands.map(island=>island.quarter),seals:configurations.states[s.configuration].puzzle.seals.filter(seal=>seal.unlocked).map(seal=>seal.id),echo:configurations.states[s.configuration].puzzle.echo});
 return {states:states.length,wins:won.length,stuck:states.length-good.size,solvable:!!won.length,actions:path.length,steps:path.filter(x=>x.startsWith('walk')).length,shifts:path.filter(x=>x.startsWith('shift')).length,turns:path.filter(x=>x.startsWith('turn')).length,bindings:path.filter(x=>x.startsWith('bind')).length,bridges:path.filter(x=>x.startsWith('bridge')).length,path,stuckExample:describe(states.find((_,i)=>!good.has(i)))};
}
