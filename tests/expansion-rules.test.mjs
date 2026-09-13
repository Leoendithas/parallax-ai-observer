import test from 'node:test';
import assert from 'node:assert/strict';
import {OrthographicCamera,Vector3} from '../dist/client/vendor/three.module.js';
import {LEVELS,isSolid} from '../dist/client/levels.js';
import {createPuzzle,shiftEcho,puzzleMap,bridgeAlignment,crossPerspectiveBridge,canWalkBetween,TILE_SPACING,OVERVIEW_RISE} from '../dist/client/puzzles.js';
import {validateReplay,VERSION} from '../server/validation.js';

const echoLevel=()=>({
 id:9001,map:['SOBOAOBE'],shards:[{x:2,z:0,mode:1},{x:4,z:0,mode:0}],
 echoPads:[
  {id:'amber',name:'Amber echo',anchor:{x:1,z:0},mode:0,gates:[{x:2,z:0}]},
  {id:'blue',name:'Blue echo',anchor:{x:3,z:0},mode:1,gates:[{x:4,z:0}]}
 ]
});
const bridgeLevel=()=>({
 id:9002,map:['SO...OBE'],shards:[{x:6,z:0,mode:1}],
 elevations:[5,6,7].map(x=>({x,z:0,height:4*TILE_SPACING*OVERVIEW_RISE})),
 perspectiveBridges:[{id:'rise',name:'Rising passage',from:{x:1,z:0},to:{x:5,z:0}}]
});
const echoEvents=[['w',1,0],['s',1],['w',2,0],['w',3,0],['s',0],['w',4,0],['w',5,0],['s',1],['w',6,0],['w',7,0]];
const bridgeEvents=[['w',1,0],['p','rise',Math.PI/2],['s',1],['w',6,0],['w',7,0]];
const minimumTime=events=>events.reduce((total,event)=>total+({w:150,s:50,p:230}[event[0]]||0),0);
function withLevel(level,run){LEVELS.push(level);try{return run(level);}finally{LEVELS.splice(LEVELS.indexOf(level),1);}}
const tileAt=(puzzle,x,z=0)=>puzzle.tiles.find(tile=>tile.x===x&&tile.z===z);

test('Echo pads leave a trace in either departed mode and reopen only its opposite-color gates',()=>{
 const level=echoLevel(),puzzle=createPuzzle(level),amber=puzzle.echoPads[0],blue=puzzle.echoPads[1];
 assert.equal(puzzle.echo,null);
 for(const x of [2,4]){
  assert.equal(tileAt(puzzle,x).mask,0);
  assert.equal(puzzleMap(level,puzzle)[0][x],'G');
 }
 assert.deepEqual(shiftEcho(puzzle,amber.anchor,0,1),{padId:'amber',mode:0});
 assert.equal(isSolid(tileAt(puzzle,2),1),true);
 assert.equal(isSolid(tileAt(puzzle,2),0),false);
 assert.equal(tileAt(puzzle,4).mask,0);
 assert.equal(puzzleMap(level,puzzle)[0][2],'B');
 assert.deepEqual(shiftEcho(puzzle,blue.anchor,1,0),{padId:'blue',mode:1});
 assert.equal(tileAt(puzzle,2).mask,0,'Replacing a trace closes its former gate');
 assert.equal(isSolid(tileAt(puzzle,4),0),true);
 assert.equal(isSolid(tileAt(puzzle,4),1),false);
 assert.equal(shiftEcho(puzzle,{x:5,z:0},0,1),null);
 assert.equal(tileAt(puzzle,4).mask,0,'Returning perspectives away from a pad clears the trace');
 shiftEcho(puzzle,amber.anchor,0,1);
 assert.equal(shiftEcho(puzzle,amber.anchor,1,0),null,'Returning at the same pad does not recreate the wrong source mode');
});

test('An Echo requires an actual valid shift and restart clears all traces',()=>{
 const level=echoLevel(),puzzle=createPuzzle(level),pad=puzzle.echoPads[0];
 assert.equal(shiftEcho(puzzle,pad.anchor,0,0),null);
 assert.equal(shiftEcho(puzzle,pad.anchor,1,0),null);
 assert.equal(shiftEcho(puzzle,{x:0,z:0},0,1),null);
 shiftEcho(puzzle,pad.anchor,0,1);
 for(const [from,to] of [[1,1],[2,0],[0,-1]])assert.deepEqual(shiftEcho(puzzle,pad.anchor,from,to),{padId:'amber',mode:0});
 const restarted=createPuzzle(level);
 assert.equal(restarted.echo,null);
 assert.equal(tileAt(restarted,2).mask,0);
 assert.equal(tileAt(restarted,4).mask,0);
 assert.equal(level.echoPads[0].unlocked,undefined,'Authored configuration remains independent of runtime state');
});

test('Two same-mode Echo pads can restore the same gate from either landing',()=>{
 const level={map:['SOBOE'],shards:[],echoPads:[
  {id:'near',anchor:{x:1,z:0},mode:0,gates:[{x:2,z:0}]},
  {id:'far',anchor:{x:3,z:0},mode:0,gates:[{x:2,z:0}]}
 ]};
 const puzzle=createPuzzle(level),gate=tileAt(puzzle,2);
 assert.deepEqual(gate.echoGateIds,['near','far']);
 shiftEcho(puzzle,{x:1,z:0},0,1);assert.equal(gate.mask,2);
 shiftEcho(puzzle,{x:3,z:0},1,0);assert.equal(gate.mask,0);
 shiftEcho(puzzle,{x:3,z:0},0,1);assert.equal(gate.mask,2);
 assert.deepEqual(puzzle.echo,{padId:'far',mode:0});
});

test('Echo definitions reject wrong colors, modes, anchors, duplicate ownership and seal conflicts',()=>{
 for(const mutate of [
  level=>{level.echoPads[1].id='amber';},
  level=>{level.echoPads[1].anchor={...level.echoPads[0].anchor};},
  level=>{level.echoPads[0].mode=2;},
  level=>{level.echoPads[0].mode=1;},
  level=>{level.echoPads[0].anchor={x:2,z:0};},
  level=>{level.echoPads[0].anchor={x:1.5,z:0};},
  level=>{level.echoPads[0].gates=[];},
  level=>{level.echoPads[0].gates.push({x:2,z:0});},
  level=>{level.echoPads[0].gates=[{x:8,z:0}];},
  level=>{level.seals=[{id:'seal',anchor:{x:5,z:0},yaw:0,gates:[{x:2,z:0}]}];},
  level=>{level.islands=[{id:'island',pivot:{x:3,z:0},arm:[{x:4,z:0}]}];}
 ]){
  const level=echoLevel();mutate(level);assert.throws(()=>createPuzzle(level));
 }
});

test('Bridge alignment matches the actual oblique overview projection and works in both directions',()=>{
 const level={map:['SO..','....','...E'],shards:[],
  elevations:[{x:3,z:2,height:TILE_SPACING*Math.hypot(2,2)*OVERVIEW_RISE}],
  perspectiveBridges:[{id:'diagonal',from:{x:1,z:0},to:{x:3,z:2}}]};
 const puzzle=createPuzzle(level),bridge=puzzle.perspectiveBridges[0],desired=Math.PI/4;
 const project=(point,angle)=>{
  const tile=tileAt(puzzle,point.x,point.z),camera=new OrthographicCamera(-10,10,10,-10,.1,100);
  camera.position.set(Math.sin(angle)*14,13,Math.cos(angle)*14);camera.lookAt(0,.35,0);camera.updateMatrixWorld();
  const projected=new Vector3(point.x*TILE_SPACING,tile.height+.235,point.z*TILE_SPACING).project(camera);
  return {x:projected.x*10,y:projected.y*10};
 };
 for(const angle of [desired,desired+.02,desired+.2,desired+Math.PI]){
  const from=project(bridge.from,angle),to=project(bridge.to,angle);
  assert.ok(Math.abs(bridgeAlignment(bridge,bridge.from,0,angle,puzzle).error-Math.hypot(to.x-from.x,to.y-from.y))<1e-12);
 }
 for(const angle of [desired,desired+Math.PI*2,desired-Math.PI*4]){
  assert.deepEqual(crossPerspectiveBridge(puzzle,'diagonal',bridge.from,0,angle),bridge.to);
  assert.deepEqual(crossPerspectiveBridge(puzzle,'diagonal',bridge.to,0,angle),bridge.from);
 }
 assert.ok(bridgeAlignment(bridge,bridge.from,0,desired,puzzle).error<1e-12);
 assert.equal(bridgeAlignment(bridge,bridge.to,0,desired,puzzle).angle,desired);
 // Inverted authoring retains the same physical camera alignment.
 [bridge.from,bridge.to]=[bridge.to,bridge.from];
 assert.deepEqual(crossPerspectiveBridge(puzzle,'diagonal',bridge.from,0,desired),bridge.to);
});

test('A bridge rejects the wrong endpoint, camera mode, unknown ID and non-finite or unaligned angle',()=>{
 const puzzle=createPuzzle(bridgeLevel()),bridge=puzzle.perspectiveBridges[0];
 for(const angle of [0,Math.PI/2+.2,Math.PI*1.5,Infinity,-Infinity,NaN])assert.equal(crossPerspectiveBridge(puzzle,'rise',bridge.from,0,angle),null);
 assert.equal(crossPerspectiveBridge(puzzle,'rise',bridge.from,1,Math.PI/2),null);
 assert.equal(crossPerspectiveBridge(puzzle,'rise',{x:0,z:0},0,Math.PI/2),null);
 assert.equal(crossPerspectiveBridge(puzzle,'missing',bridge.from,0,Math.PI/2),null);
 assert.equal(bridgeAlignment(bridge,{x:0,z:0},0,Math.PI/2,puzzle).target,null);
 const threshold=Math.asin(.14/(4*TILE_SPACING));
 assert.ok(bridgeAlignment(bridge,bridge.from,0,Math.PI/2+threshold-.0001,puzzle).aligned);
 assert.equal(bridgeAlignment(bridge,bridge.from,0,Math.PI/2+threshold+.0001,puzzle).aligned,false);
});

test('Perspective bridge configuration requires finite elevations and geometrically possible fixed endpoints',()=>{
 for(const mutate of [
  level=>{level.elevations[0].height=Infinity;},
  level=>{level.elevations[0].height=NaN;},
  level=>{level.elevations.push({...level.elevations[0]});},
  level=>{level.elevations.push({x:3,z:0,height:1});},
  level=>{level.elevations[0].height+=1;},
  level=>{level.perspectiveBridges[0].to={x:1,z:0};},
  level=>{level.perspectiveBridges[0].to={x:6,z:0};},
  level=>{level.perspectiveBridges[0].from={x:3,z:0};},
  level=>{level.perspectiveBridges.push({...level.perspectiveBridges[0]});},
  level=>{level.perspectiveBridges.push({...level.perspectiveBridges[0],id:'duplicate-pair'});}
 ]){
  const level=bridgeLevel();mutate(level);assert.throws(()=>createPuzzle(level));
 }
 const puzzle=createPuzzle(bridgeLevel());
 assert.equal(tileAt(puzzle,0).height,0);
 assert.equal(tileAt(puzzle,5).height,4*TILE_SPACING*OVERVIEW_RISE);
});

test('Ordinary steps cannot jump gaps or move between different elevation planes',()=>{
 const from={x:0,z:0,height:0,mask:3};
 assert.ok(canWalkBetween(from,{x:1,z:0,height:0,mask:1},0));
 assert.equal(canWalkBetween(from,{x:1,z:0,height:0,mask:1},1),false);
 assert.equal(canWalkBetween(from,{x:1,z:0,height:1,mask:3},0),false);
 assert.equal(canWalkBetween(from,{x:2,z:0,height:0,mask:3},0),false);
 assert.equal(canWalkBetween(from,{x:1,z:1,height:0,mask:3},0),false);
 assert.equal(canWalkBetween(from,undefined,0),false);
});

test('Echo replay shifts open gates before movement checks and falls preserve the active trace',()=>withLevel(echoLevel(),level=>{
 assert.deepEqual(validateReplay(level.id,echoEvents,minimumTime(echoEvents)),{falls:0});
 assert.throws(()=>validateReplay(level.id,echoEvents,minimumTime(echoEvents)-1));
 const withFall=[...echoEvents.slice(0,2),['w',1,1],...echoEvents.slice(2)];
 assert.deepEqual(validateReplay(level.id,withFall,minimumTime(withFall)),{falls:1});
 assert.throws(()=>validateReplay(level.id,echoEvents.filter((_,i)=>i!==1),60000));
 const cleared=[...echoEvents.slice(0,4),['s',0],['s',1],['w',2,0],['w',1,0],['s',0],['s',1],['w',2,0],['w',3,0],...echoEvents.slice(4)];
 assert.throws(()=>validateReplay(level.id,cleared,60000),'Replaced traces must not leave old gates permanently open');
}));

test('Replay bridge crossings require real alignment, update checkpoints and have a timing minimum',()=>withLevel(bridgeLevel(),level=>{
 assert.deepEqual(validateReplay(level.id,bridgeEvents,minimumTime(bridgeEvents)),{falls:0});
 assert.throws(()=>validateReplay(level.id,bridgeEvents,minimumTime(bridgeEvents)-1));
 const withFall=[...bridgeEvents.slice(0,2),['w',5,1],...bridgeEvents.slice(2)];
 assert.deepEqual(validateReplay(level.id,withFall,minimumTime(withFall)),{falls:1});
 const roundTrip=[...bridgeEvents.slice(0,2),['p','rise',Math.PI/2+Math.PI*2],['p','rise',Math.PI/2],...bridgeEvents.slice(2)];
 assert.deepEqual(validateReplay(level.id,roundTrip,minimumTime(roundTrip)),{falls:0});
 for(const event of [
  ['p','missing',Math.PI/2],['p','rise',0],['p','rise',Math.PI*1.5],['p','rise',NaN],
  ['p','rise',Infinity],['p','rise',null],['p','rise','1.57'],['p','rise'],['p','rise',Math.PI/2,0],['p',null,Math.PI/2],['w',5,0]
 ])assert.throws(()=>validateReplay(level.id,[bridgeEvents[0],event,...bridgeEvents.slice(2)],60000),/Invalid movement/);
 assert.throws(()=>validateReplay(level.id,[bridgeEvents[1],...bridgeEvents],60000),/Invalid movement/);
 assert.throws(()=>validateReplay(level.id,[bridgeEvents[0],['s',1],...bridgeEvents.slice(1)],60000),/Invalid movement/);
 assert.equal(VERSION,'six-chambers-v1','Expansion keeps the existing leaderboard namespace');
}));

test('Replay cannot use an adjacent elevated landing as an ordinary step',()=>{
 const height=TILE_SPACING*OVERVIEW_RISE;
 const level={id:9003,map:['SOOBE'],shards:[{x:3,z:0,mode:1}],
  elevations:[2,3,4].map(x=>({x,z:0,height})),
  perspectiveBridges:[{id:'step',from:{x:1,z:0},to:{x:2,z:0}}]};
 withLevel(level,()=>{
  const events=[['w',1,0],['p','step',Math.PI/2],['s',1],['w',3,0],['w',4,0]];
  assert.deepEqual(validateReplay(level.id,events,minimumTime(events)),{falls:0});
  assert.throws(()=>validateReplay(level.id,[events[0],['w',2,0],...events.slice(2)],60000));
 });
});
