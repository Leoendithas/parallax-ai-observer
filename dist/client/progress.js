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
