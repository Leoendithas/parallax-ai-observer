import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../dist/client/levels.js';
import {loadProgress,saveProgress,PROGRESS_KEY} from '../dist/client/progress.js';

const keys=LEVELS.map(l=>l.progressKey);
function storage(entries={}){
 const data=new Map(Object.entries(entries));
 return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
}
test('prototype completions follow their rooms when reordered and new rooms stay incomplete',()=>{
 const saved=storage({'parallax-finished':'[0,5,6,7,8]'});
 const migrated=loadProgress(saved,keys);
 assert.deepEqual(LEVELS.filter(l=>migrated.includes(l.progressKey)).map(l=>l.id),[1,6,7]);
 const newRoom=LEVELS.find(l=>l.id===8).progressKey;
 saveProgress(saved,[...migrated,newRoom,newRoom]);
 assert.deepEqual(loadProgress(saved,[...keys].reverse()),[...migrated,newRoom]);
 assert.equal(saved.getItem('parallax-finished'),'[0,5,6,7,8]');
 assert.equal(new Set(keys).size,LEVELS.length);
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
