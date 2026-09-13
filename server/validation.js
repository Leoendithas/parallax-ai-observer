import {LEVELS,parseLevel,isSolid} from '../dist/client/levels.js';
export const VERSION='six-chambers-v1';
export function validateName(value){
 if(typeof value!=='string')throw new Error('Enter a nickname.');
 const name=value.normalize('NFKC').trim().replace(/\s+/gu,' ');
 if([...name].length<2||[...name].length>24||/[\p{Cc}\p{Cf}<>]/u.test(name))throw new Error('Use a nickname of 2–24 characters, without symbols < or >.');
 return name;
}
export function validateReplay(chamber,events,elapsed){
 const level=LEVELS.find(l=>l.id===chamber);
 if(!level||!Array.isArray(events)||!events.length||events.length>3000)throw new Error('This attempt could not be verified.');
 const tiles=parseLevel(level),at=(x,z)=>tiles.find(t=>t.x===x&&t.z===z),start=tiles.find(t=>t.type==='S');
 let pos=start,checkpoint=start,mode=0,falls=0,minimum=0,solved=false;const found=new Set();
 for(const e of events){
  let landed=true;
  if(solved||!Array.isArray(e))throw new Error('Invalid attempt sequence.');
  if(e[0]==='w'&&e.length===3&&Number.isInteger(e[1])&&Number.isInteger(e[2])&&Math.abs(e[1]-pos.x)+Math.abs(e[2]-pos.z)===1){
   minimum+=150;const tile=at(e[1],e[2]);
   if(!isSolid(tile,mode)){pos=checkpoint;falls++;landed=false;}else{pos=tile;if(tile.mask===3)checkpoint=tile;}
  }else if(e[0]==='s'&&e.length===2&&(e[1]===0||e[1]===1)&&e[1]!==mode){
   mode=e[1];minimum+=50;if(!isSolid(pos,mode)){pos=checkpoint;falls++;landed=false;}
  }else throw new Error('Invalid movement in this attempt.');
  if(landed)level.shards.forEach((s,i)=>{if(s.x===pos.x&&s.z===pos.z&&(s.mode===undefined||s.mode===mode))found.add(i);});
  solved=pos.type==='E'&&found.size===level.shards.length;
 }
 if(!solved||elapsed<minimum||elapsed>21600000)throw new Error('Complete this chamber from its start to record a time.');
 return {falls};
}
