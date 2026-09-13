import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,isSolid} from '../dist/client/levels.js';
import {bindSeal,createPuzzle,puzzleMap,sealAlignment} from '../dist/client/puzzles.js';
import {solveChamber} from './helpers/solve-chamber.mjs';

test('public campaign contains thirty-five released chambers',()=>{
  assert.deepEqual(LEVELS.map(l=>l.id),Array.from({length:35},(_,i)=>i+1));
  for(const level of LEVELS){
    assert.ok(!level.prototype);
    assert.ok(level.map.every(row=>row.length===level.map[0].length));
    assert.equal(level.map.join('').split('S').length-1,1);
    assert.equal(level.map.join('').split('E').length-1,1);
  }
});

for(const level of LEVELS)test(`chamber ${level.id}: all fragments and the exit are reachable without falling`,()=>{
  const solution=solveChamber(level);
  assert.ok(solution?.length,`No complete route for chamber ${level.id}`);
  assert.ok(solution.some(step=>step.type==='shift'));
});

test('seals align within eight degrees and unlock only their own blue bridges',()=>{
  const level=LEVELS.find(level=>level.id===15),puzzle=createPuzzle(level),seal=puzzle.seals[0];
  for(const tile of puzzle.tiles.filter(tile=>tile.gateId)){
    assert.equal(isSolid(tile,0),false);assert.equal(isSolid(tile,1),false);
    assert.equal(puzzleMap(level,puzzle)[tile.z][tile.x],'G');
  }
  const tolerance=Math.PI/22.5;
  assert.equal(sealAlignment(seal,seal.anchor,1,seal.yaw+tolerance-.000001,0).aligned,true);
  assert.equal(sealAlignment(seal,seal.anchor,1,seal.yaw+tolerance+.000001,0).aligned,false);
  assert.equal(sealAlignment(seal,seal.anchor,1,seal.yaw,tolerance+.000001).aligned,false);
  assert.equal(bindSeal(puzzle,seal.id,seal.anchor,0,seal.yaw,0),false);
  assert.equal(bindSeal(puzzle,seal.id,{x:seal.anchor.x+1,z:seal.anchor.z},1,seal.yaw,0),false);
  assert.equal(puzzle.seals.some(seal=>seal.unlocked),false);
  assert.equal(bindSeal(puzzle,seal.id,seal.anchor,1,seal.yaw+Math.PI*2,0),true);
  for(const tile of puzzle.tiles.filter(tile=>tile.gateId)){
    assert.equal(isSolid(tile,0),false);
    assert.equal(isSolid(tile,1),tile.gateId===seal.id);
    assert.equal(puzzleMap(level,puzzle)[tile.z][tile.x],tile.gateId===seal.id?'B':'G');
  }
  assert.equal(bindSeal(puzzle,seal.id,seal.anchor,1,seal.yaw,0),false);
  assert.equal(createPuzzle(level).seals.some(seal=>seal.unlocked),false,'Starting again resets bindings');
});

test('seal definitions require unique IDs, shared anchors, and independent blue gates',()=>{
  const level=LEVELS.find(level=>level.id===15);
  for(const invalidate of [
    puzzle=>{puzzle.seals[1].id=puzzle.seals[0].id;},
    puzzle=>{puzzle.seals[0].anchor={...puzzle.seals[0].gates[0]};},
    puzzle=>{puzzle.seals[0].yaw=Infinity;},
    puzzle=>{puzzle.seals[0].gates=[];},
    puzzle=>{puzzle.seals[1].gates=[{...puzzle.seals[0].gates[0]}];},
    puzzle=>{puzzle.seals[0].gates=[{...puzzle.seals[0].anchor}];}
  ]){
    const invalid=structuredClone(level);invalidate(invalid);
    assert.throws(()=>createPuzzle(invalid));
  }
  const combined=structuredClone(LEVELS.find(level=>level.id===19));
  combined.seals[0].anchor={...combined.islands[0].pivot};
  assert.throws(()=>createPuzzle(combined),/fixed white anchor/);
});
