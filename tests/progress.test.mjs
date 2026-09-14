import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../dist/client/levels.js';
import {loadProgress,saveProgress,loadLastChamber,saveLastChamber,resolveStartChamber,PROGRESS_KEY,LAST_CHAMBER_KEY} from '../dist/client/progress.js';

const keys=LEVELS.map(l=>l.progressKey);
function storage(entries={}){
 const data=new Map(Object.entries(entries));
 return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
}
test('prototype completions follow their rooms when reordered and new rooms stay incomplete',()=>{
 const saved=storage({'parallax-finished':'[0,5,6,7,8]'});
 const migrated=loadProgress(saved,keys);
 assert.deepEqual(LEVELS.filter(l=>migrated.includes(l.progressKey)).map(l=>l.id),[1,6,7,13,19]);
 const newRoom=LEVELS.find(l=>l.id===8).progressKey;
 saveProgress(saved,[...migrated,newRoom,newRoom]);
 assert.deepEqual(loadProgress(saved,[...keys].reverse()),[...migrated,newRoom]);
 assert.equal(saved.getItem('parallax-finished'),'[0,5,6,7,8]');
 assert.equal(new Set(keys).size,LEVELS.length);
 assert.equal(LEVELS.find(l=>l.id===13).progressKey,'seal-intro');
 assert.equal(LEVELS.find(l=>l.id===19).progressKey,'combined-prototype');
 assert.deepEqual(LEVELS.filter(l=>l.id>=13&&!migrated.includes(l.progressKey)).map(l=>l.id),[14,15,16,17,18,20]);
});
test('invalid, unknown and unavailable saves do not prevent play',()=>{
 for(const value of ['no json','null','{}','[null,-1,500,"7"]'])assert.deepEqual(loadProgress(storage({'parallax-finished':value}),keys),[]);
 assert.deepEqual(loadProgress(storage({[PROGRESS_KEY]:'["unknown", "island-intro", "island-intro"]'}),keys),['island-intro']);
 const denied={getItem(){throw new Error('Denied');},setItem(){throw new Error('Denied');}};
 assert.deepEqual(loadProgress(denied,keys),[]);
 assert.doesNotThrow(()=>saveProgress(denied,keys));
});

test('completions from the six-chamber release and island preview are combined',()=>{
 const saved=storage({[PROGRESS_KEY]:'["original-1","island-intro"]','parallax-finished':'[0,1,2,3,4,5]'});
 const completed=loadProgress(saved,keys);
 assert.deepEqual(LEVELS.filter(l=>completed.includes(l.progressKey)).map(l=>l.id),[1,2,3,4,5,6,7]);
 assert.deepEqual(loadProgress(storage({[PROGRESS_KEY]:'invalid','parallax-finished':'[5]'}),keys),['original-6']);
 assert.deepEqual(loadProgress(storage({[PROGRESS_KEY]:'["island-return"]','parallax-finished':'invalid'}),keys),['island-return']);
});

test('a return visit reopens the room the player left',()=>{
 const saved=storage();
 saveLastChamber(saved,'island-relay');
 assert.equal(loadLastChamber(saved,keys),'island-relay');
 assert.equal(saved.getItem(LAST_CHAMBER_KEY),'island-relay');
 // A room retired in a later release must not strand the traveller.
 assert.equal(loadLastChamber(storage({[LAST_CHAMBER_KEY]:'retired-chamber'}),keys),null);
 assert.equal(loadLastChamber(storage(),keys),null);
 const denied={getItem(){throw new Error('Denied');},setItem(){throw new Error('Denied');}};
 assert.equal(loadLastChamber(denied,keys),null);
 assert.doesNotThrow(()=>saveLastChamber(denied,'island-relay'));
});

test('resuming steps past solved rooms without ever going backwards',()=>{
 const cleared=['original-1','original-2','original-3'];
 assert.equal(resolveStartChamber(keys,'island-relay',cleared),keys.indexOf('island-relay'));
 // Leaving on the completion screen saves a solved room; open the next one.
 assert.equal(resolveStartChamber(keys,'original-1',cleared),keys.indexOf('original-4'));
 assert.equal(resolveStartChamber(keys,null,cleared),0);
 assert.equal(resolveStartChamber(keys,'retired-chamber',cleared),0);
 assert.equal(resolveStartChamber(keys,'original-2',[]),keys.indexOf('original-2'));
 // Every room solved: stay where they were rather than jumping to the finale.
 assert.equal(resolveStartChamber(keys,'original-2',keys),keys.indexOf('original-2'));
});
