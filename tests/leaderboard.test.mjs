import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../dist/client/levels.js';
import {solveChamber} from './helpers/solve-chamber.mjs';
import {validateReplay,validateName} from '../server/validation.js';
import worker from '../server/index.js';
import {localDatabase} from '../server/local-db.mjs';
const eventsFor=level=>solveChamber(level).map(s=>s.type==='walk'?['w',s.x,s.z]:['s',s.mode]);
for(const level of LEVELS)test(`server validates the complete route for chamber ${level.id}`,()=>{
 const events=eventsFor(level);assert.equal(validateReplay(level.id,events,60000).falls,0);
 assert.throws(()=>validateReplay(level.id,events.slice(0,-1),60000));
 assert.throws(()=>validateReplay(level.id,events,1));
});
test('nicknames and impossible paths are rejected',()=>{
 assert.equal(validateName('  Moon walker  '),'Moon walker');
 for(const name of ['x','<script>','a\u200bb',null,'a'.repeat(25)])assert.throws(()=>validateName(name));
 assert.throws(()=>validateReplay(1,[['w',6,1]],10000));
});
test('shared API separates chambers, saves best attempts, and retries idempotently',async()=>{
 const DB=await localDatabase(':memory:'),env={DB};let now=1700000000000;const originalNow=Date.now;Date.now=()=>now;
 const call=async(path,data)=>{const response=await worker.fetch(new Request('https://game.example'+path,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined}),env);return {status:response.status,data:await response.json(),headers:response.headers};};
 const player='a'.repeat(64);
 try{
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
  assert.equal((await call('/api/leaderboard?chamber=7')).status,400);
  assert.equal(board.headers.get('Access-Control-Allow-Origin'),'*');
 }finally{Date.now=originalNow;DB.close();}
});
