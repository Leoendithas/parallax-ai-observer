import {LEVELS} from './levels.js';
const API=location.hostname==='127.0.0.1'||location.hostname==='localhost'?'':'https://parallax-observers-path.lancetyw.chatgpt.site';
const $=id=>document.getElementById(id);
export const formatRaceTime=ms=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(Math.floor(ms%1000/10)).padStart(2,'0')}`;
async function request(path,data){
 const response=await fetch(API+path,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:undefined,body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(12000),credentials:'omit'});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Please try again.');return result;
}
function read(key,fallback){try{return localStorage.getItem(key)||fallback;}catch{return fallback;}}
function write(key,value){try{localStorage.setItem(key,value);}catch{}}
export function createLeaderboard({restart,practice,qa=false}){
 $('board-chamber').replaceChildren(...LEVELS.map(level=>{const option=document.createElement('option');option.value=String(level.id);option.textContent=`Chamber ${String(level.id).padStart(2,'0')} · ${level.menu}`;return option;}));
 let ranked=false,wantTimed=false,nextTimed=false,preparing=false,run=null,chamber=1,generation=0,loadGeneration=0;
 let player=read('parallax-player','');if(!/^[a-f0-9]{64}$/.test(player)){player=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');write('parallax-player',player);}
 let pending=[];try{const saved=JSON.parse(read('parallax-pending-score','[]'));if(Array.isArray(saved))pending=saved;}catch{}
 $('player-name').value=read('parallax-nickname','');
 const showStatus=text=>{$('run-status').textContent=text;};
 const showWelcome=(timed=false)=>{wantTimed=timed;$('welcome-error').textContent='';$('player-name').required=timed;$('welcome-title').textContent=timed?'Your timed attempt.':'A new perspective.';$('begin-run').innerHTML=timed?'Begin timed attempt <span>↗</span>':'Let’s explore <span>↗</span>';$('welcome-chamber').textContent=`CHAMBER ${String(chamber).padStart(2,'0')}`;$('welcome-dialog').showModal();};
 const retryVisibility=()=>{$('score-retry').hidden=!pending.length;};
 async function save(attempt){
  const payload={token:attempt.token,events:attempt.events,durationMs:attempt.durationMs};
  if(!pending.some(p=>p.token===payload.token))pending.push(payload);
  write('parallax-pending-score',JSON.stringify(pending));retryVisibility();
  try{
   const result=await request('/api/runs/finish',payload);
   pending=pending.filter(p=>p.token!==payload.token);write('parallax-pending-score',JSON.stringify(pending));retryVisibility();
   if(run?.token===payload.token){run.result=result;$('race-result').textContent=`Recorded · ${formatRaceTime(result.elapsedMs)} · ${result.falls} ${result.falls===1?'fall':'falls'}`;showStatus(`CHAMBER ${chamber} · ${formatRaceTime(result.elapsedMs)} · RECORDED`);}
   return result;
  }catch(error){if(run?.token===payload.token)$('race-result').textContent='Your time is waiting to save. Use Retry save on the leaderboard.';throw error;}
 }
 async function load(id){
  ranked=nextTimed;nextTimed=false;chamber=id;$('race-result').textContent='';$('view-score').hidden=true;const ticket=++generation;run=null;
  if(!ranked){preparing=false;showStatus('PRACTICE · Take your time');return;}
  preparing=true;showStatus('CONNECTING · Preparing your timed attempt');$('chambers-button').disabled=true;
  try{
   const name=$('player-name').value.trim();const started=await request('/api/runs',{name,chamber,player});
   if(ticket!==generation)return;
   run={...started,events:[],clock:performance.now(),done:false};preparing=false;write('parallax-nickname',started.name);
   $('welcome-dialog').close();$('begin-run').disabled=false;$('world').focus({preventScroll:true});$('chambers-button').disabled=false;
  }catch(error){
   if(ticket!==generation)return;preparing=false;ranked=false;$('begin-run').disabled=false;$('chambers-button').disabled=false;showStatus('PRACTICE · Timed attempt unavailable');$('welcome-error').textContent=error.message||'Unable to connect. Please try again.';
   if(!$('welcome-dialog').open)showStatus('Couldn’t start the timer · Try “Timed attempt” again');
  }
 }
 async function showBoard(){
  $('leaderboard-dialog').showModal();$('board-chamber').value=String(chamber);await refresh();
 }
 async function refresh(){
  const ticket=++loadGeneration,id=Number($('board-chamber').value);$('board-message').textContent='Loading times…';$('leaderboard-rows').replaceChildren();retryVisibility();
  try{
   const {entries}=await request(`/api/leaderboard?chamber=${id}`);if(ticket!==loadGeneration)return;
   $('board-message').textContent=entries.length?'Best time per player · fastest first, then fewer falls.':'No times yet. Be the first to finish this chamber.';
   entries.forEach((entry,i)=>{const row=document.createElement('tr');for(const value of [String(i+1),entry.name,formatRaceTime(entry.elapsedMs),String(entry.falls)]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}$('leaderboard-rows').append(row);});
  }catch(error){if(ticket===loadGeneration)$('board-message').textContent=error.message||'Couldn’t load the leaderboard. Try Refresh.';}
 }
 $('welcome-form').addEventListener('submit',e=>{e.preventDefault();if(!$('welcome-form').reportValidity())return;write('parallax-nickname',$('player-name').value.trim());if(wantTimed){nextTimed=true;$('begin-run').disabled=true;$('welcome-error').textContent='Connecting…';restart();}else explore();});
 function explore(){ranked=false;nextTimed=false;preparing=false;run=null;generation++;$('begin-run').disabled=false;$('chambers-button').disabled=false;$('welcome-dialog').close();showStatus('PRACTICE · Take your time');practice();}
 $('practice-run').onclick=explore;$('welcome-dialog').addEventListener('cancel',e=>{e.preventDefault();explore();});
 $('leaderboard-button').onclick=showBoard;$('view-score').onclick=showBoard;$('timed-attempt').onclick=()=>{const name=$('player-name').value.trim();if(name.length>=2&&name.length<=24){nextTimed=true;restart();}else showWelcome(true);};
 $('board-chamber').onchange=refresh;$('board-refresh').onclick=refresh;
 $('score-retry').onclick=async()=>{if(!pending.length)return;$('score-retry').disabled=true;try{for(const attempt of [...pending])await save(attempt);await refresh();}catch(error){$('board-message').textContent=error.message||'Still offline. Your result is waiting to save.';}finally{$('score-retry').disabled=false;}};
 return {
  load,canAct:()=>!preparing,
  record:event=>{if(run&&!run.done)run.events.push(event);},
  finish:()=>{if(!run||run.done)return;run.done=true;run.durationMs=Math.round(performance.now()-run.clock);$('view-score').hidden=false;$('race-result').textContent='Saving your chamber time…';showStatus(`CHAMBER ${chamber} · SAVING`);save(run).catch(()=>{});},
  tick:()=>{if(run&&!run.done)showStatus(`CHAMBER ${chamber} · ${formatRaceTime(performance.now()-run.clock)}`);},
  welcome:()=>{if(!qa)showWelcome();},
 };
}
