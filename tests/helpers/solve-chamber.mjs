import {isSolid} from '../../dist/client/levels.js';
import {bindSeal,bridgeAlignment,canWalkBetween,createPuzzle,crossPerspectiveBridge,shiftEcho,turnIsland} from '../../dist/client/puzzles.js';

// Camera angles are free choices in the discrete puzzle search. A bridge action
// still records its actual aligned angle so the server validates the same route.
export function createPuzzleStates(level){
 const states=[],index=new Map();
 function add(puzzle){
  const key=[puzzle.islands.map(island=>island.quarter).join(','),puzzle.seals.map(seal=>Number(seal.unlocked)).join(','),puzzle.echo?.padId||'',puzzle.echo?.mode??''].join(';');
  if(index.has(key))return index.get(key);
  const id=states.length,tiles=new Map(puzzle.tiles.map(tile=>[`${tile.x},${tile.z}`,tile]));
  states.push({puzzle,at:(x,z)=>tiles.get(`${x},${z}`)});index.set(key,id);return id;
 }
 add(createPuzzle(level));
 return {states,add};
}

export function solveChamber(level) {
 const configurations=createPuzzleStates(level),initial=configurations.states[0].puzzle,start=initial.tiles.find(tile=>tile.type==='S');
 const fullShards=(1<<level.shards.length)-1;
 const collect=s=>({...s,bits:level.shards.reduce((bits,shard,i)=>bits|(shard.x===s.x&&shard.z===s.z&&(shard.mode===undefined||shard.mode===s.mode)?1<<i:0),s.bits)});
 const key=s=>[s.x,s.z,s.mode,s.bits,s.configuration].join(',');
 const first=collect({x:start.x,z:start.z,mode:0,bits:0,configuration:0});
 const states=[first],seen=new Set([key(first)]),parents=[null];
 function enqueue(state,parent,action){
  const stateKey=key(state);if(seen.has(stateKey))return;
  seen.add(stateKey);states.push(state);parents.push({parent,action});
 }
 for(let i=0;i<states.length;i++) {
  const s=states[i],{puzzle,at}=configurations.states[s.configuration],here=at(s.x,s.z);
  if(here.type==='E'&&s.bits===fullShards&&puzzle.seals.every(seal=>seal.unlocked)){
   const path=[];for(let j=i;parents[j];j=parents[j].parent)path.push(parents[j].action);
   return path.reverse();
  }
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
   const x=s.x+dx,z=s.z+dz;
   if(canWalkBetween(here,at(x,z),s.mode))enqueue(collect({...s,x,z}),i,{type:'walk',x,z});
  }
  const mode=1-s.mode;
  let shiftedConfiguration=s.configuration;
  if(puzzle.echoPads.length){
   const shifted=structuredClone(puzzle);shiftEcho(shifted,s,s.mode,mode);
   shiftedConfiguration=configurations.add(shifted);
  }
  if(isSolid(configurations.states[shiftedConfiguration].at(s.x,s.z),mode))enqueue(collect({...s,mode,configuration:shiftedConfiguration}),i,{type:'shift',mode});
  for(const island of puzzle.islands){
   if(s.mode!==0||s.x!==island.pivot.x||s.z!==island.pivot.z)continue;
   const turned=structuredClone(puzzle);
   if(turnIsland(turned,island.id,s,0).ok)enqueue({...s,configuration:configurations.add(turned)},i,{type:'turn',islandId:island.id});
  }
  for(const seal of puzzle.seals){
   if(seal.unlocked||s.mode!==1||s.x!==seal.anchor.x||s.z!==seal.anchor.z)continue;
   const bound=structuredClone(puzzle);
   if(bindSeal(bound,seal.id,s,s.mode,seal.yaw,0))enqueue({...s,configuration:configurations.add(bound)},i,{type:'bind',sealId:seal.id,yaw:seal.yaw,pitch:0});
  }
  for(const bridge of puzzle.perspectiveBridges){
   const {atEndpoint,angle}=bridgeAlignment(bridge,s,s.mode,0,puzzle);if(!atEndpoint||s.mode!==0)continue;
   const target=crossPerspectiveBridge(puzzle,bridge.id,s,s.mode,angle);
   if(target)enqueue(collect({...s,x:target.x,z:target.z}),i,{type:'bridge',bridgeId:bridge.id,angle});
  }
 }
 return null;
}
