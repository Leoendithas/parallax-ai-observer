import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,isSolid,findPath} from '../dist/levels.js';
import {createPuzzle,turnIsland,sealAlignment,bindSeal,puzzleMap,sameTile} from '../dist/puzzles.js';
import * as THREE from '../dist/vendor/three.module.js';
import {createMechanismView} from '../dist/mechanisms.js';

const level=id=>LEVELS.find(l=>l.id===id);
const start=p=>p.tiles.find(t=>t.type==='S');
function move(p,from,to,mode){assert.ok(findPath(p.tiles,from,to,mode),`No route ${JSON.stringify(from)} -> ${JSON.stringify(to)} in mode ${mode}`);return {...to};}

test('only the agreed prototypes extend the original six chambers',()=>{
 assert.deepEqual(LEVELS.map(l=>l.id),[1,2,3,4,5,6,7,13,19]);
 for(const l of LEVELS){assert.ok(l.map.every(row=>row.length===l.map[0].length));assert.equal(l.map.join('').split('S').length-1,1);assert.equal(l.map.join('').split('E').length-1,1);}
});

test('chamber 7 requires the marked viewpoint, first person, and alignment before its bridge opens',()=>{
 const p=createPuzzle(level(7)),seal=p.seals[0];let pos={...start(p)};
 assert.equal(bindSeal(p,seal.id,pos,1,0,0),false);
 pos=move(p,pos,seal.anchor,0);
 assert.equal(bindSeal(p,seal.id,pos,0,0,0),false);
 assert.equal(bindSeal(p,seal.id,pos,1,.3,0),false);
 assert.equal(bindSeal(p,seal.id,pos,1,0,-.4),false);
 assert.equal(findPath(p.tiles,pos,{x:4,z:1},1),null);
 assert.equal(bindSeal(p,seal.id,pos,1,0,0),true);
 assert.equal(bindSeal(p,seal.id,pos,1,0,0),false);
 pos=move(p,pos,{x:5,z:1},1);move(p,pos,{x:6,z:1},1);
 const fresh=createPuzzle(level(7));assert.equal(fresh.seals[0].unlocked,false);assert.equal(fresh.tiles.find(t=>t.gateId).mask,0);
});

test('chamber 13 physically rotates only its amber arm, preserves anchors, and opens a route',()=>{
 const p=createPuzzle(level(13)),island=p.islands[0],initial=puzzleMap(level(13),p),anchors=p.tiles.filter(t=>t.mask===3).map(t=>({x:t.x,z:t.z}));
 assert.equal(turnIsland(p,island.id,start(p),0).ok,false);
 assert.equal(turnIsland(p,island.id,island.pivot,1).ok,false);
 let pos=move(p,start(p),island.pivot,0);
 assert.equal(findPath(p.tiles,pos,{x:4,z:1},0),null);
 assert.equal(turnIsland(p,island.id,pos,0).ok,true);
 pos=move(p,pos,{x:4,z:1},0);pos=move(p,pos,{x:5,z:1},1);move(p,pos,{x:6,z:1},1);
 for(let i=0;i<3;i++){
  assert.equal(turnIsland(p,island.id,island.pivot,0).ok,true);
  assert.equal(new Set(p.tiles.map(t=>`${t.x},${t.z}`)).size,p.tiles.length);
  assert.deepEqual(p.tiles.filter(t=>t.mask===3).map(t=>({x:t.x,z:t.z})),anchors);
 }
 assert.deepEqual(puzzleMap(level(13),p),initial);
});

test('chamber 19 uses a seal trip, return trip, second rotation, and latched gate',()=>{
 const p=createPuzzle(level(19)),island=p.islands[0],seal=p.seals[0];let pos=move(p,start(p),island.pivot,0);
 turnIsland(p,island.id,pos,0);
 pos=move(p,pos,{x:4,z:1},0);pos=move(p,pos,seal.anchor,1);
 assert.equal(findPath(p.tiles,{x:7,z:4},{x:7,z:7},1),null);
 assert.equal(bindSeal(p,seal.id,pos,1,-Math.PI,0),true);
 pos=move(p,pos,{x:4,z:1},1);pos=move(p,pos,island.pivot,0);
 turnIsland(p,island.id,pos,0);
 pos=move(p,pos,{x:7,z:4},0);pos=move(p,pos,{x:7,z:6},1);move(p,pos,{x:7,z:7},1);
 assert.equal(p.seals[0].unlocked,true);assert.equal(p.islands[0].turns,2);
 assert.equal(createPuzzle(level(19)).islands[0].quarter,0);
});

test('all island orientations are reversible, collision free, and leave the white hub safe',()=>{
 for(const id of [13,19]){
  const p=createPuzzle(level(id)),island=p.islands[0];
  for(let q=0;q<4;q++){
   assert.ok(isSolid(p.tiles.find(t=>sameTile(t,island.pivot)),0));assert.ok(isSolid(p.tiles.find(t=>sameTile(t,island.pivot)),1));
   const snapshot=puzzleMap(level(id),p);
   assert.ok(turnIsland(p,island.id,island.pivot,0,1).ok);assert.ok(turnIsland(p,island.id,island.pivot,0,-1).ok);
   assert.deepEqual(puzzleMap(level(id),p),snapshot);turnIsland(p,island.id,island.pivot,0,1);
  }
 }
});

test('ring halves have matching apparent centers and sizes from the intended viewpoint',()=>{
 for(const id of [7,19]){
  const l=level(id),p=createPuzzle(l),world=new THREE.Group();
  const worldPos=t=>new THREE.Vector3((t.x-(l.map[0].length-1)/2)*1.15,.235,(t.z-(l.map.length-1)/2)*1.15);
  const view=createMechanismView(p,world,worldPos),seal=p.seals[0],eye=worldPos(seal.anchor);eye.y+=.82;
  world.updateMatrixWorld(true);
  const halves=[];world.traverse(o=>{if(o.geometry?.type==='TorusGeometry'&&o.geometry.parameters.arc===Math.PI)halves.push(o);});
  assert.equal(halves.length,2);
  for(const aspect of [16/9,390/820]){
   const camera=new THREE.PerspectiveCamera(aspect>1?72:86,aspect,.035,200);camera.position.copy(eye);camera.rotation.set(0,seal.yaw,0,'YXZ');camera.updateMatrixWorld(true);
   const centers=halves.map(o=>o.getWorldPosition(new THREE.Vector3()).project(camera));
   assert.ok(Math.abs(centers[0].x)<1e-8&&Math.abs(centers[0].y)<1e-8);
   assert.ok(Math.hypot(centers[0].x-centers[1].x,centers[0].y-centers[1].y)<1e-8);
   assert.ok(Math.abs(halves[0].geometry.parameters.radius/eye.distanceTo(halves[0].position)-halves[1].geometry.parameters.radius/eye.distanceTo(halves[1].position))<1e-8);
  }
  assert.equal(sealAlignment(seal,seal.anchor,1,seal.yaw,.1).aligned,true);
  assert.equal(sealAlignment(seal,seal.anchor,1,seal.yaw,.2).aligned,false);
  view.dispose();assert.equal(world.children.length,0);
 }
});
