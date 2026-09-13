import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../dist/client/levels.js';
import {bindSeal,canWalkBetween,createPuzzle,crossPerspectiveBridge,shiftEcho,turnIsland} from '../dist/client/puzzles.js';
import {solveChamber} from './helpers/solve-chamber.mjs';
import {VERSION,validateReplay,validateName} from '../server/validation.js';
import worker from '../server/index.js';
import {localDatabase} from '../server/local-db.mjs';
const eventsFor=level=>{
 const route=solveChamber(level);assert.ok(route,`Chamber ${level.id} needs a complete route`);
 return route.map(s=>s.type==='walk'?['w',s.x,s.z]:s.type==='turn'?['t',s.islandId]:s.type==='bind'?['b',s.sealId,s.yaw,s.pitch]:s.type==='bridge'?['p',s.bridgeId,s.angle]:['s',s.mode]);
};
const minimumTime=events=>events.reduce((time,event)=>time+(event[0]==='w'?150:event[0]==='s'?50:event[0]==='p'?230:0),0);
for(const level of LEVELS)test(`server validates the complete route for chamber ${level.id}`,()=>{
 const events=eventsFor(level);assert.equal(validateReplay(level.id,events,60000).falls,0);
 assert.throws(()=>validateReplay(level.id,events.slice(0,-1),60000));
 assert.equal(validateReplay(level.id,events,minimumTime(events)).falls,0);
 assert.throws(()=>validateReplay(level.id,events,minimumTime(events)-1));
 for(const island of level.islands||[]){
  assert.ok(events.some(event=>event[0]==='t'&&event[1]===island.id),`Chamber ${level.id} needs island ${island.id}`);
  assert.throws(()=>validateReplay(level.id,events.filter(event=>event[0]!=='t'||event[1]!==island.id),60000));
 }
 for(const seal of level.seals||[]){
  assert.ok(events.some(event=>event[0]==='b'&&event[1]===seal.id),`Chamber ${level.id} needs seal ${seal.id}`);
  assert.throws(()=>validateReplay(level.id,events.filter(event=>event[0]!=='b'||event[1]!==seal.id),60000));
 }
 for(const bridge of level.perspectiveBridges||[]){
  assert.ok(events.some(event=>event[0]==='p'&&event[1]===bridge.id),`Chamber ${level.id} needs bridge ${bridge.id}`);
  assert.throws(()=>validateReplay(level.id,events.filter(event=>event[0]!=='p'||event[1]!==bridge.id),60000));
 }
});
test('nicknames and impossible paths are rejected',()=>{
 assert.equal(validateName('  Moon walker  '),'Moon walker');
 for(const name of ['x','<script>','a\u200bb',null,'a'.repeat(25)])assert.throws(()=>validateName(name));
 assert.throws(()=>validateReplay(1,[['w',6,1]],10000));
 for(const id of [0,36,99,1.5])assert.throws(()=>validateReplay(id,[['s',1]],10000));
});
test('turn replays require the correct white hub, overview, and one clockwise turn',()=>{
 const level=LEVELS.find(level=>level.id===7),events=eventsFor(level),turn=events.findIndex(event=>event[0]==='t');
 for(const invalid of [['t','missing'],['t',null],['t','turntable',-1],['t','turntable',1]]){
  assert.throws(()=>validateReplay(level.id,[...events.slice(0,turn),invalid,...events.slice(turn+1)],60000),/Invalid movement/);
 }
 assert.throws(()=>validateReplay(level.id,[events[turn],...events],60000),/Invalid movement/);
 assert.throws(()=>validateReplay(level.id,[...events.slice(0,turn),['s',1],...events.slice(turn)],60000),/Invalid movement/);
 assert.throws(()=>validateReplay(1,[['t','turntable'],...eventsFor(LEVELS[0])],60000),/Invalid movement/);
});
test('turning moves the arm away and a fall returns to its fixed hub',()=>{
 const level=LEVELS.find(level=>level.id===7),events=eventsFor(level),turn=events.findIndex(event=>event[0]==='t');
 // After west turns north, the former west arm is empty and the hub is still the checkpoint.
 const withFall=[...events.slice(0,turn+1),['w',3,4],...events.slice(turn+1)];
 assert.equal(validateReplay(level.id,withFall,minimumTime(withFall)).falls,1);
});
test('seal replays require a known seal, its anchor, first person, and finite aligned angles',()=>{
 const level=LEVELS.find(level=>level.id===13),events=eventsFor(level),index=events.findIndex(event=>event[0]==='b');
 assert.ok(index>=0);
 const event=events[index],prefix=events.slice(0,index),suffix=events.slice(index+1);
 for(const invalid of [
  ['b','missing',event[2],0],['b',null,event[2],0],['b',event[1]],['b',event[1],event[2]],
  [...event,0],['b',event[1],null,0],['b',event[1],String(event[2]),0],['b',event[1],event[2],null],
  ['b',event[1],NaN,0],['b',event[1],Infinity,0],['b',event[1],-Infinity,0],
  ['b',event[1],event[2],NaN],['b',event[1],event[2],Infinity],
  ['b',event[1],event[2]+Math.PI/2,0],['b',event[1],event[2],Math.PI/2]
 ])assert.throws(()=>validateReplay(level.id,[...prefix,invalid,...suffix],60000),/Invalid movement/);
 assert.throws(()=>validateReplay(level.id,[['s',1],event,...events],60000),/Invalid movement/,'Binding at the start must not open a remote seal');
 assert.throws(()=>validateReplay(level.id,[...prefix,['s',0],event,...suffix],60000),/Invalid movement/);
 assert.throws(()=>validateReplay(level.id,[...prefix,event,event,...suffix],60000),/Invalid movement/);
 assert.throws(()=>validateReplay(1,[event,...eventsFor(LEVELS[0])],60000),/Invalid movement/);
});
for(const level of LEVELS.filter(level=>level.seals?.length))test(`chamber ${level.id} keeps seal bindings after a fall to the anchor`,()=>{
 const events=eventsFor(level),puzzle=createPuzzle(level),index=events.findIndex(event=>event[0]==='b');
 assert.ok(index>=0);
 let position=puzzle.tiles.find(tile=>tile.type==='S'),mode=0;
 for(const event of events.slice(0,index+1)){
  if(event[0]==='t'){
   const island=puzzle.islands.find(island=>island.id===event[1]);
   assert.ok(turnIsland(puzzle,island.id,island.pivot,0).ok);
  }else if(event[0]==='b'){
   const seal=puzzle.seals.find(seal=>seal.id===event[1]);
   assert.ok(bindSeal(puzzle,seal.id,seal.anchor,1,event[2],event[3]));
  }else if(event[0]==='s'){
   shiftEcho(puzzle,position,mode,event[1]);mode=event[1];
  }else if(event[0]==='w'){
   position=puzzle.tiles.find(tile=>tile.x===event[1]&&tile.z===event[2]);
  }else if(event[0]==='p'){
   position=crossPerspectiveBridge(puzzle,event[1],position,mode,event[2]);
   assert.ok(position);
  }
 }
 const anchor=puzzle.seals.find(seal=>seal.id===events[index][1]).anchor;
 const anchorTile=puzzle.tiles.find(tile=>tile.x===anchor.x&&tile.z===anchor.z);
 const gap=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dz])=>({x:anchor.x+dx,z:anchor.z+dz})).find(p=>!canWalkBetween(anchorTile,puzzle.tiles.find(t=>t.x===p.x&&t.z===p.z),1));
 assert.ok(gap,'A seal anchor needs an adjacent fall for this checkpoint check');
 const withFall=[...events.slice(0,index+1),['w',gap.x,gap.z],...events.slice(index+1)];
 assert.equal(validateReplay(level.id,withFall,minimumTime(withFall)).falls,1);
});
test('separate islands keep independent orientations and require their own hubs',()=>{
 const level=LEVELS.find(level=>level.id===11),events=eventsFor(level),far=events.findIndex(event=>event[0]==='t'&&event[1]==='far');
 assert.ok(far>=0);assert.ok(events.some(event=>event[0]==='t'&&event[1]==='home'));
 // This route returns over the home island after turning the far island several times.
 assert.equal(validateReplay(level.id,events,minimumTime(events)).falls,0);
 assert.throws(()=>validateReplay(level.id,[...events.slice(0,far),['t','home'],...events.slice(far+1)],60000),/Invalid movement/);
});
test('shared API separates chambers, saves best attempts, and retries idempotently',async()=>{
 const DB=await localDatabase(':memory:'),env={DB};let now=1700000000000;const originalNow=Date.now;Date.now=()=>now;
 const call=async(path,data)=>{const response=await worker.fetch(new Request('https://game.example'+path,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined}),env);return {status:response.status,data:await response.json(),headers:response.headers};};
 const player='a'.repeat(64);
 try{
  assert.equal(VERSION,'six-chambers-v1','Adding chambers must preserve original leaderboard records');
  const start=await call('/api/runs',{name:'Moonwalker',chamber:1,player});assert.equal(start.status,201);
  now+=30000;
  assert.equal((await call('/api/runs/finish',{token:start.data.token,events:[['w',6,1]],durationMs:10000})).status,400);
  const payload={token:start.data.token,events:eventsFor(LEVELS[0]),durationMs:10000};
  assert.equal((await call('/api/runs/finish',payload)).data.elapsedMs,10000);
  now+=100000;assert.equal((await call('/api/runs/finish',payload)).data.elapsedMs,10000);
  const second=await call('/api/runs',{name:'Moonwalker',chamber:1,player});now+=30000;
  await call('/api/runs/finish',{token:second.data.token,events:eventsFor(LEVELS[0]),durationMs:9000});
  const board=await call('/api/leaderboard?chamber=1');assert.equal(board.data.entries.length,1);assert.equal(board.data.entries[0].elapsedMs,9000);
  assert.deepEqual(Object.keys(board.data.entries[0]).sort(),['elapsedMs','falls','name']);
  assert.equal((await call('/api/leaderboard?chamber=2')).data.entries.length,0);
  for(const chamber of LEVELS.filter(level=>level.id>=7).map(level=>level.id)){
   const empty=await call(`/api/leaderboard?chamber=${chamber}`);assert.equal(empty.status,200);assert.equal(empty.data.entries.length,0);
   const attempt=await call('/api/runs',{name:'Islandwalker',chamber,player});assert.equal(attempt.status,201);
   now+=60000;
   const completed=await call('/api/runs/finish',{token:attempt.data.token,events:eventsFor(LEVELS.find(level=>level.id===chamber)),durationMs:30000});
   assert.equal(completed.status,200);assert.equal(completed.data.falls,0);assert.equal(completed.data.saved,true);
   const islandBoard=await call(`/api/leaderboard?chamber=${chamber}`);assert.equal(islandBoard.status,200);
   assert.deepEqual(islandBoard.data.entries,[{name:'Islandwalker',elapsedMs:30000,falls:0}]);
  }
  assert.equal((await call('/api/leaderboard?chamber=1')).data.entries[0].elapsedMs,9000);
  for(const chamber of [0,36,99,1.5]){
   assert.equal((await call(`/api/leaderboard?chamber=${chamber}`)).status,400);
   assert.equal((await call('/api/runs',{name:'Moonwalker',chamber,player})).status,400);
  }
  assert.equal(board.headers.get('Access-Control-Allow-Origin'),'*');
 }finally{Date.now=originalNow;DB.close();}
});
