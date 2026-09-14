export const PROGRESS_KEY='parallax-completed-v2';
const LEGACY_KEYS=['original-1','original-2','original-3','original-4','original-5','original-6','seal-intro','island-intro','combined-prototype'];

// Earlier releases stored array indexes. Preserve that save and migrate to stable
// puzzle identities, so adding or reordering chapters cannot award other rooms.
export function loadProgress(storage,validKeys){
 const read=key=>{try{const value=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch{return [];}};
 const saved=read(PROGRESS_KEY),legacy=read('parallax-finished').filter(Number.isInteger).map(index=>LEGACY_KEYS[index]);
 // A player may have returned to the six-chamber release after the island preview.
 // Merge both saves so newer completions in either edition remain complete.
 return [...new Set([...saved,...legacy].filter(key=>validKeys.includes(key)))];
}

export function saveProgress(storage,keys){
 try{storage.setItem(PROGRESS_KEY,JSON.stringify([...new Set(keys)]));}catch{}
}

export const LAST_CHAMBER_KEY='parallax-last-chamber';

// The chamber in play lived only in the URL fragment, which a bookmark, a history
// entry, or the brand link drops. Keep it beside the cleared set so returning
// reopens the room the player left instead of the first one.
export function loadLastChamber(storage,validKeys){
 try{const key=storage.getItem(LAST_CHAMBER_KEY);return validKeys.includes(key)?key:null;}catch{return null;}
}

export function saveLastChamber(storage,key){
 try{storage.setItem(LAST_CHAMBER_KEY,key);}catch{}
}

// Leaving on the completion screen saves a room that is already solved. Step
// forward to the first unfinished chamber so a return never replays a finished
// puzzle, and never sends anyone backwards.
export function resolveStartChamber(orderedKeys,savedKey,completedKeys){
 const saved=orderedKeys.indexOf(savedKey);
 if(saved<0)return 0;
 const unfinished=orderedKeys.findIndex((key,index)=>index>=saved&&!completedKeys.includes(key));
 return unfinished<0?saved:unfinished;
}
