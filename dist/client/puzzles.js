import {parseLevel,isSolid} from './levels.js';

export const sameTile=(a,b)=>a.x===b.x&&a.z===b.z;
export const TILE_SPACING=1.15;
export const OVERVIEW_RISE=12.65/14;
const pointKey=point=>`${point.x},${point.z}`;
const validPoint=point=>point&&Number.isInteger(point.x)&&Number.isInteger(point.z);
const normalizedAngle=angle=>Math.atan2(Math.sin(angle),Math.cos(angle));
export function canWalkBetween(from,to,mode){
 return !!from&&isSolid(to,mode)&&Math.abs(to.x-from.x)+Math.abs(to.z-from.z)===1&&Math.abs((to.height||0)-(from.height||0))<=.01;
}
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
 const echoPads=(level.echoPads||[]).map(config=>({...config,anchor:{...config.anchor},gates:config.gates.map(point=>({...point}))}));
 const perspectiveBridges=(level.perspectiveBridges||[]).map(config=>({...config,from:{...config.from},to:{...config.to}}));
 if(!level.map.length||!level.map.every(row=>row.length===level.map[0].length))throw new Error('A chamber must have a rectangular map.');
 if(new Set(islands.map(i=>i.id)).size!==islands.length)throw new Error('Island IDs must be unique within a chamber.');
 if(new Set(seals.map(s=>s.id)).size!==seals.length)throw new Error('Seal IDs must be unique within a chamber.');
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
  const anchor=tiles.find(t=>sameTile(t,seal.anchor));
  if(!anchor||anchor.mask!==3||islands.some(island=>sameTile(island.pivot,seal.anchor))||!Number.isFinite(seal.yaw))throw new Error('A seal needs a fixed white anchor and a sightline.');
  if(!seal.gates.length)throw new Error('A seal needs a blue bridge.');
  for(const point of seal.gates){
   const tile=tiles.find(t=>sameTile(t,point));
   if(!tile||tile.type!=='B'||tile.gateId)throw new Error('A seal gate must be an unclaimed blue tile.');
   Object.assign(tile,{gateId:seal.id,baseMask:tile.mask,mask:0});
  }
 }
 for(const tile of tiles)tile.height=0;
 const elevated=new Set();
 for(const elevation of level.elevations||[]){
  const tile=validPoint(elevation)&&tiles.find(t=>sameTile(t,elevation));
  if(!tile||!Number.isFinite(elevation.height)||elevated.has(pointKey(elevation)))throw new Error('Elevations need a unique existing tile and a finite world height.');
  tile.height=elevation.height;elevated.add(pointKey(elevation));
 }
 if(echoPads.some(pad=>typeof pad.id!=='string'||!pad.id.length)||new Set(echoPads.map(pad=>pad.id)).size!==echoPads.length)throw new Error('Echo pad IDs must be unique within a chamber.');
 if(new Set(echoPads.map(pad=>pointKey(pad.anchor))).size!==echoPads.length)throw new Error('Echo pads need separate anchors.');
 for(const pad of echoPads){
  const anchor=validPoint(pad.anchor)&&tiles.find(tile=>sameTile(tile,pad.anchor));
  if(!anchor||anchor.mask!==3||anchor.islandId||![0,1].includes(pad.mode))throw new Error('An echo pad needs a fixed white anchor and a source perspective.');
  if(!pad.gates.length)throw new Error('An echo pad needs an opposite-perspective gate.');
  for(const point of pad.gates){
   const tile=validPoint(point)&&tiles.find(tile=>sameTile(tile,point));
   if(!tile||tile.type!==(pad.mode===0?'B':'A')||tile.gateId||tile.islandId||tile.echoGateIds?.includes(pad.id))throw new Error('An echo gate must be a fixed tile of the opposite perspective, without a seal or duplicate pad.');
   if(tile.echoGateIds)tile.echoGateIds.push(pad.id);
   else Object.assign(tile,{echoGateId:pad.id,echoGateIds:[pad.id],baseMask:tile.mask,mask:0});
  }
 }
 if(perspectiveBridges.some(bridge=>typeof bridge.id!=='string'||!bridge.id.length)||new Set(perspectiveBridges.map(bridge=>bridge.id)).size!==perspectiveBridges.length)throw new Error('Perspective bridge IDs must be unique within a chamber.');
 const endpointPairs=new Set();
 for(const bridge of perspectiveBridges){
  const from=validPoint(bridge.from)&&tiles.find(tile=>sameTile(tile,bridge.from));
  const to=validPoint(bridge.to)&&tiles.find(tile=>sameTile(tile,bridge.to));
  if(!from||!to||from.mask!==3||to.mask!==3||from.islandId||to.islandId||sameTile(from,to))throw new Error('A perspective bridge needs two distinct fixed white endpoints.');
  const pair=[pointKey(from),pointKey(to)].sort().join('|');
  if(endpointPairs.has(pair))throw new Error('Perspective bridges must have distinct endpoint pairs.');
  endpointPairs.add(pair);
  const rise=TILE_SPACING*Math.hypot(to.x-from.x,to.z-from.z)*OVERVIEW_RISE;
  if(Math.abs(Math.abs(to.height-from.height)-rise)>.001)throw new Error('Perspective bridge heights must make its endpoints overlap in overview.');
 }
 return {tiles,islands,seals,echoPads,echo:null,perspectiveBridges,width:level.map[0].length,height:level.map.length};
}

// A shift leaves one trace in the perspective being departed. A later shift replaces it.
export function shiftEcho(puzzle,position,fromMode,toMode){
 if(![0,1].includes(fromMode)||![0,1].includes(toMode)||fromMode===toMode)return puzzle.echo;
 const pad=puzzle.echoPads.find(pad=>pad.mode===fromMode&&sameTile(pad.anchor,position));
 puzzle.echo=pad?{padId:pad.id,mode:fromMode}:null;
 for(const tile of puzzle.tiles)if(tile.echoGateIds)tile.mask=tile.echoGateIds.includes(puzzle.echo?.padId)?tile.baseMask:0;
 return puzzle.echo;
}

export function bridgeAlignment(bridge,position,mode,angle,puzzle){
 const atFrom=sameTile(position,bridge.from),atTo=sameTile(position,bridge.to),atEndpoint=atFrom||atTo;
 const from=puzzle.tiles.find(tile=>sameTile(tile,bridge.from)),to=puzzle.tiles.find(tile=>sameTile(tile,bridge.to));
 const dx=bridge.to.x-bridge.from.x,dz=bridge.to.z-bridge.from.z,heightDiff=(to?.height||0)-(from?.height||0);
 // A camera rotation is shared by both endpoints, including on the return crossing.
 const desired=normalizedAngle(Math.atan2(dx,dz)+(heightDiff<0?Math.PI:0));
 const scale=Math.sqrt(1+OVERVIEW_RISE**2);
 const screenX=TILE_SPACING*(dx*Math.cos(angle)-dz*Math.sin(angle));
 const screenY=(heightDiff-TILE_SPACING*(dx*Math.sin(angle)+dz*Math.cos(angle))*OVERVIEW_RISE)/scale;
 const error=Number.isFinite(angle)?Math.hypot(screenX,screenY):Infinity;
 const angleError=Number.isFinite(angle)?Math.abs(normalizedAngle(angle-desired)):Infinity;
 return {atEndpoint,aligned:atEndpoint&&mode===0&&error<=.14&&angleError<=Math.PI/30,error,target:atFrom?{...bridge.to}:atTo?{...bridge.from}:null,angle:desired};
}

export function crossPerspectiveBridge(puzzle,id,position,mode,angle){
 const bridge=puzzle.perspectiveBridges.find(bridge=>bridge.id===id);
 if(!bridge)return null;
 const alignment=bridgeAlignment(bridge,position,mode,angle,puzzle);
 return alignment.aligned?alignment.target:null;
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
 for(const tile of puzzle.tiles){if(map[tile.z]?.[tile.x]!==undefined)map[tile.z][tile.x]=(tile.gateId||tile.echoGateId)&&!tile.mask?'G':tile.type;}
 return map.map(row=>row.join(''));
}
