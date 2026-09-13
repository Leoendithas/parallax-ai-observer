import {isSolid} from '../../dist/client/levels.js';
import {createPuzzle,turnIsland} from '../../dist/client/puzzles.js';

export function solveChamber(level) {
  const initial=createPuzzle(level),start=initial.tiles.find(t=>t.type==='S');
  const orientation=puzzle=>puzzle.islands.map(island=>island.quarter).join(',');
  const puzzles=new Map([[orientation(initial),initial]]);
  const collect=s=>({...s,bits:level.shards.reduce((bits,shard,i)=>bits|(shard.x===s.x&&shard.z===s.z&&(shard.mode===undefined||shard.mode===s.mode)?1<<i:0),s.bits)});
  const queue=[{...collect({x:start.x,z:start.z,mode:0,bits:0,orientation:orientation(initial)}),path:[]}],seen=new Set();
  for(let i=0;i<queue.length;i++) {
    const s=queue[i],key=[s.x,s.z,s.mode,s.bits,s.orientation].join(',');
    if(seen.has(key))continue;
    seen.add(key);
    const puzzle=puzzles.get(s.orientation),at=(x,z)=>puzzle.tiles.find(t=>t.x===x&&t.z===z);
    if(at(s.x,s.z).type==='E'&&s.bits===(1<<level.shards.length)-1)return s.path;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const x=s.x+dx,z=s.z+dz;
      if(isSolid(at(x,z),s.mode))queue.push({...collect({...s,x,z}),path:[...s.path,{type:'walk',x,z}]});
    }
    if(at(s.x,s.z).mask===3)queue.push({...collect({...s,mode:1-s.mode}),path:[...s.path,{type:'shift',mode:1-s.mode}]});
    for(const island of puzzle.islands){
      if(s.mode!==0||s.x!==island.pivot.x||s.z!==island.pivot.z)continue;
      const turned=structuredClone(puzzle);
      if(!turnIsland(turned,island.id,s,s.mode).ok)continue;
      const next=orientation(turned);
      if(!puzzles.has(next))puzzles.set(next,turned);
      queue.push({...s,orientation:next,path:[...s.path,{type:'turn',islandId:island.id}]});
    }
  }
  return null;
}
