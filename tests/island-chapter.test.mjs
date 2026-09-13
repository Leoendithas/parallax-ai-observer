import assert from 'node:assert/strict';
import test from 'node:test';
import {LEVELS} from '../dist/client/levels.js';
import {analyze} from './helpers/analyze-chamber.mjs';

export {analyze} from './helpers/analyze-chamber.mjs';

for(const level of LEVELS.filter(level=>level.id>=7&&level.id<=20))test(`mechanism chamber ${level.id} is solvable and recoverable, and needs every mechanism`,()=>{
 const withFalls=analyze(level),noFalls=analyze(level,{allowFalls:false});
 assert.ok(withFalls.solvable,`Chamber ${level.id} must be solvable`);
 assert.equal(withFalls.stuck,0,`Chamber ${level.id} has an unrecoverable state: ${JSON.stringify(withFalls.stuckExample)}`);
 assert.equal(withFalls.actions,noFalls.actions,`Falls should not shorten chamber ${level.id}`);
 for(const island of level.islands||[])assert.equal(analyze(level,{blockedIsland:island.id}).solvable,false,`Island ${island.id} can be bypassed in chamber ${level.id}`);
 // Ignore the completion requirement here: every sealed bridge must itself be
 // necessary to collect the fragments and reach the arch.
 for(const seal of level.seals||[])assert.equal(analyze(level,{blockedSeal:seal.id,requireAllSeals:false}).solvable,false,`Seal ${seal.id} can be bypassed in chamber ${level.id}`);
});
