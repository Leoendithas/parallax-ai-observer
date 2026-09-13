import assert from 'node:assert/strict';
import test from 'node:test';
import {LEVELS} from '../dist/client/levels.js';
import {createPuzzle} from '../dist/client/puzzles.js';
import {analyze} from './helpers/analyze-chamber.mjs';
import {solveChamber} from './helpers/solve-chamber.mjs';

const expansion=LEVELS.filter(level=>level.id>=21);

test('the expansion contains fifteen distinct rooms in three mechanic chapters',()=>{
 assert.deepEqual(expansion.map(level=>level.id),Array.from({length:15},(_,i)=>i+21));
 assert.equal(new Set(expansion.map(level=>level.progressKey)).size,15);
 assert.equal(new Set(expansion.map(level=>level.menu)).size,15);
 assert.equal(new Set(expansion.map(level=>level.chapter)).size,3);
 for(const level of expansion){
  const puzzle=createPuzzle(level);
  assert.ok(level.hint?.length,`Chamber ${level.id} needs player guidance`);
  assert.ok(puzzle.echoPads.length||puzzle.perspectiveBridges.length,`Chamber ${level.id} needs an expansion mechanic`);
 }
});

for(const level of expansion)test(`expansion chamber ${level.id} has no soft locks or fall shortcuts and needs its mechanisms`,()=>{
 const withFalls=analyze(level),noFalls=analyze(level,{allowFalls:false});
 assert.ok(withFalls.solvable,`Chamber ${level.id} must be solvable`);
 assert.ok(noFalls.solvable,`Chamber ${level.id} must be solvable without falling`);
 assert.equal(withFalls.stuck,0,`Chamber ${level.id} has an unrecoverable state: ${JSON.stringify(withFalls.stuckExample)}`);
 assert.equal(withFalls.actions,noFalls.actions,`Falls should not shorten chamber ${level.id}`);
 for(const island of level.islands||[])assert.equal(analyze(level,{blockedIsland:island.id}).solvable,false,`Island ${island.id} can be bypassed in chamber ${level.id}`);
 for(const seal of level.seals||[])assert.equal(analyze(level,{blockedSeal:seal.id,requireAllSeals:false}).solvable,false,`Seal ${seal.id} can be bypassed in chamber ${level.id}`);
 for(const bridge of level.perspectiveBridges||[])assert.equal(analyze(level,{blockBridge:bridge.id}).solvable,false,`Bridge ${bridge.id} can be bypassed in chamber ${level.id}`);

 // Some traces intentionally have a return pad that rescues an accidental shift.
 // Block every owner of each gate together, so recovery pads remain permissible
 // while every echo-controlled crossing must be needed for the actual puzzle.
 const gateOwners=new Map();
 for(const pad of level.echoPads||[])for(const gate of pad.gates){
  const key=`${gate.x},${gate.z}`;
  if(!gateOwners.has(key))gateOwners.set(key,[]);
  gateOwners.get(key).push(pad.id);
 }
 const groups=new Map([...gateOwners.values()].map(ids=>[ids.sort().join(','),ids]));
 for(const ids of groups.values())assert.equal(analyze(level,{blockEcho:ids}).solvable,false,`Echo crossing ${ids.join('/')} can be bypassed in chamber ${level.id}`);
 const solution=solveChamber(level);
 assert.equal(solution.length,noFalls.actions,'The fast solver and full state analysis agree on the shortest fall-free route');
});
