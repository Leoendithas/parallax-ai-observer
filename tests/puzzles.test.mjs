import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../dist/levels.js';
import {solveChamber} from './helpers/solve-chamber.mjs';

test('public campaign contains only the six released chambers',()=>{
  assert.deepEqual(LEVELS.map(l=>l.id),[1,2,3,4,5,6]);
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
