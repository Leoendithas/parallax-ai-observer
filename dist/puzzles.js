import {parseLevel} from './levels.js';

export const sameTile=(a,b)=>a.x===b.x&&a.z===b.z;
export const armDirections=['west','north','east','south'];

export function createPuzzle(level){
 const tiles=parseLevel(level);
 const islands=(level.islands||[]).map(config=>({...config,pivot:{...config.pivot},quarter:0,turns:0}));
 const seals=(level.seals||[]).map(config=>({...config,unlocked:false}));
 for(const island of islands){
  for(const point of island.arm){
   const tile=tiles.find(t=>sameTile(t,point));
   if(!tile||tile.type!=='A')throw new Error('A rotating arm must contain only amber tiles.');
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
 return {tiles,islands,seals};
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
