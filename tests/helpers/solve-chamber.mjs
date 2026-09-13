import {parseLevel,isSolid} from '../../dist/levels.js';

export function solveChamber(level) {
  const tiles=parseLevel(level),start=tiles.find(t=>t.type==='S');
  const at=(x,z)=>tiles.find(t=>t.x===x&&t.z===z);
  const collect=s=>({...s,bits:level.shards.reduce((bits,shard,i)=>bits|(shard.x===s.x&&shard.z===s.z&&(shard.mode===undefined||shard.mode===s.mode)?1<<i:0),s.bits)});
  const queue=[{...collect({x:start.x,z:start.z,mode:0,bits:0}),path:[]}],seen=new Set();
  for(let i=0;i<queue.length;i++) {
    const s=queue[i],key=[s.x,s.z,s.mode,s.bits].join(',');
    if(seen.has(key))continue;
    seen.add(key);
    if(at(s.x,s.z).type==='E'&&s.bits===(1<<level.shards.length)-1)return s.path;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const x=s.x+dx,z=s.z+dz;
      if(isSolid(at(x,z),s.mode))queue.push({...collect({...s,x,z}),path:[...s.path,{type:'walk',x,z}]});
    }
    if(at(s.x,s.z).mask===3)queue.push({...collect({...s,mode:1-s.mode}),path:[...s.path,{type:'shift',mode:1-s.mode}]});
  }
  return null;
}
