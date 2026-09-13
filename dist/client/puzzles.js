import {parseLevel} from './levels.js';

export const sameTile=(a,b)=>a.x===b.x&&a.z===b.z;
export const armDirections=['west','north','east','south'];
export function islandDirections(puzzle,island){
 const directions=new Set();
 for(const tile of puzzle.tiles.filter(t=>t.islandId===island.id)){
  const dx=tile.x-island.pivot.x,dz=tile.z-island.pivot.z;
  if(dx<0)directions.add('west');if(dz<0)directions.add('north');
  if(dx>0)directions.add('east');if(dz>0)directions.add('south');
 }
 return armDirections.filter(direction=>directions.has(direction));
}

export function createPuzzle(level){
 const tiles=parseLevel(level);
 const islands=(level.islands||[]).map(config=>({...config,pivot:{...config.pivot},quarter:0,turns:0}));
 const seals=(level.seals||[]).map(config=>({...config,unlocked:false}));
 if(!level.map.length||!level.map.every(row=>row.length===level.map[0].length))throw new Error('A chamber must have a rectangular map.');
 if(new Set(islands.map(i=>i.id)).size!==islands.length)throw new Error('Island IDs must be unique within a chamber.');
 for(const island of islands){
  const hub=tiles.find(t=>sameTile(t,island.pivot));
  if(!hub||hub.mask!==3||island.arm.some(p=>sameTile(p,island.pivot)))throw new Error('An island needs a fixed white hub.');
  if(!island.arm.length)throw new Error('An island needs an amber arm.');
  for(const point of island.arm){
   const tile=tiles.find(t=>sameTile(t,point));
   if(!tile||tile.type!=='A')throw new Error('A rotating arm must contain only amber tiles.');
   if(tile.islandId)throw new Error('Rotating arms must not share tiles.');
   if(level.shards.some(shard=>sameTile(shard,point)))throw new Error('Fragments need a fixed landing.');
   Object.assign(tile,{islandId:island.id,baseX:tile.x,baseZ:tile.z});
  }
 }
 for(const seal of seals){
  for(const point of seal.gates){
   const tile=tiles.find(t=>sameTile(t,point));
   if(!tile||tile.type!=='B')throw new Error('A seal gate must be a blue tile.');
   Object.assign(tile,{gateId:seal.id,baseMask:tile.mask,mask:0});
  }
 }
 return {tiles,islands,seals,width:level.map[0].length,height:level.map.length};
}

// Clockwise as seen from above: west -> north -> east -> south.
export function rotatedPoint(point,pivot,quarter){
 let x=point.x-pivot.x,z=point.z-pivot.z;
 for(let i=0;i<((quarter%4)+4)%4;i++)[x,z]=[-z,x];
 return {x:pivot.x+x,z:pivot.z+z};
}

export function turnIsland(puzzle,id,position,mode,direction=1){
 const island=puzzle.islands.find(i=>i.id===id);
 if(!island||!sameTile(position,island.pivot))return {ok:false,reason:'Stand on the white circular hub to turn the island.'};
 if(mode!==0)return {ok:false,reason:'Return to overview to turn the island.'};
 if(![1,-1].includes(direction))return {ok:false,reason:'Choose clockwise or counterclockwise.'};
 const quarter=(island.quarter+direction+4)%4;
 const moving=puzzle.tiles.filter(t=>t.islandId===id);
 const targets=moving.map(t=>rotatedPoint({x:t.baseX,z:t.baseZ},island.pivot,quarter));
 if(targets.some(p=>p.x<0||p.z<0||p.x>=puzzle.width||p.z>=puzzle.height))return {ok:false,reason:'That turn would leave the chamber.'};
 if(targets.some(p=>puzzle.tiles.some(t=>t.islandId!==id&&sameTile(t,p))))return {ok:false,reason:'That turn would meet another platform.'};
 const before=moving.map(t=>({tile:t,x:t.x,z:t.z}));
 moving.forEach((tile,i)=>Object.assign(tile,targets[i]));
 island.quarter=quarter;island.turns++;
 return {ok:true,island,before,direction};
}

export function sealAlignment(seal,position,mode,yaw,pitch){
 const atAnchor=sameTile(position,seal.anchor);
 // Both physical arcs are centered on this horizontal ray from the engraved stone.
 const cosine=Math.max(-1,Math.min(1,Math.cos(pitch)*Math.cos(yaw-seal.yaw)));
 const error=Math.acos(cosine);
 return {atAnchor,error,aligned:!seal.unlocked&&atAnchor&&mode===1&&error<=Math.PI/22.5};
}

export function bindSeal(puzzle,id,position,mode,yaw,pitch){
 const seal=puzzle.seals.find(s=>s.id===id);
 if(!seal||seal.unlocked)return false;
 if(!sealAlignment(seal,position,mode,yaw,pitch).aligned)return false;
 seal.unlocked=true;
 for(const tile of puzzle.tiles)if(tile.gateId===id)tile.mask=tile.baseMask;
 return true;
}

export function puzzleMap(level,puzzle){
 const map=level.map.map(row=>Array(row.length).fill('.'));
 for(const tile of puzzle.tiles){if(map[tile.z]?.[tile.x]!==undefined)map[tile.z][tile.x]=tile.gateId&&!tile.mask?'G':tile.type;}
 return map.map(row=>row.join(''));
}
