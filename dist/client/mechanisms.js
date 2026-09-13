import * as THREE from './vendor/three.module.js';
import {bridgeAlignment} from './puzzles.js';

// The ring halves stay fixed in the world. Perspective, not billboarding, joins them.
export function createMechanismView(puzzle,world,worldPos){
 const group=new THREE.Group();world.add(group);
 const sealViews=[],gateViews=[],echoViews=[],bridgeViews=[];
 const mat=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.DoubleSide});
 function floorRing(point,radius,color){
  const ring=new THREE.Mesh(new THREE.RingGeometry(radius-.025,radius,48),mat(color));
  ring.rotation.x=-Math.PI/2;ring.position.copy(worldPos(point));ring.position.y+=.018;group.add(ring);return ring;
 }
 for(const island of puzzle.islands){
  floorRing(island.pivot,.43,'#ffd198');floorRing(island.pivot,.34,'#9a744a');
  const disk=new THREE.Mesh(new THREE.CylinderGeometry(.51,.51,.12,48),new THREE.MeshStandardMaterial({color:'#66584a',metalness:.45,roughness:.5}));
  disk.position.copy(worldPos(island.pivot));disk.position.y-=.555;group.add(disk);
  for(let i=0;i<4;i++){
   const notch=new THREE.Mesh(new THREE.BoxGeometry(.09,.025,.15),mat('#ffd198',.9));
   const a=i*Math.PI/2;notch.position.copy(worldPos(island.pivot));notch.position.x+=Math.sin(a)*.4;notch.position.z+=Math.cos(a)*.4;notch.position.y+=.028;notch.rotation.y=a;group.add(notch);
  }
 }
 for(const seal of puzzle.seals){
  const marker=floorRing(seal.anchor,.35,'#99efe1');
  floorRing(seal.anchor,.27,'#99efe1');
  const eye=worldPos(seal.anchor);eye.y+=.82;
  const direction=new THREE.Vector3(-Math.sin(seal.yaw),0,-Math.cos(seal.yaw));
  const parts=[];
  for(let i=0;i<2;i++){
   const distance=i?3.6:1.8,radius=i?.56:.28;
   const half=new THREE.Mesh(new THREE.TorusGeometry(radius,radius*.095,10,60,Math.PI),mat(i?'#ffe2ae':'#9ef5e3'));
   half.position.copy(eye).addScaledVector(direction,distance);
   half.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction.clone().negate());
   if(i)half.rotateZ(Math.PI);
   group.add(half);parts.push(half);
   // A thin stem reveals the two distinct depths when seen from above.
   const stem=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.57,6),mat(i?'#b89d74':'#6dbbab',.5));
   stem.position.copy(half.position);stem.position.y-=.7;group.add(stem);
  }
  sealViews.push({seal,parts,marker});
  for(const point of seal.gates){
   const gate=new THREE.Group();gate.position.copy(worldPos(point));gate.position.y+=.015;
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.018,8,36),mat('#9ef5e3',.8));ring.rotation.x=-Math.PI/2;gate.add(ring);
   for(const dx of [-.32,.32]){const bar=new THREE.Mesh(new THREE.BoxGeometry(.025,.62,.025),mat('#9ef5e3',.65));bar.position.set(dx,.31,0);gate.add(bar);}
   group.add(gate);gateViews.push({seal,gate});
  }
 }
 for(const pad of puzzle.echoPads){
  const color=pad.mode===0?'#e4b58a':'#9ddbe9';
  const marker=floorRing(pad.anchor,.38,'#b8a1e4');
  const inner=floorRing(pad.anchor,.22,color);
  const ghost=new THREE.Group();ghost.position.copy(worldPos(pad.anchor));
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.24,5,10),mat('#c3aff1',.5));body.position.y=.35;ghost.add(body);
  const face=new THREE.Mesh(new THREE.BoxGeometry(.24,.06,.17),mat(color,.65));face.position.set(0,.47,.1);ghost.add(face);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.23,.012,6,36),mat('#ddd0ff',.6));halo.rotation.x=-Math.PI/2;halo.position.y=.04;ghost.add(halo);group.add(ghost);
  // Paired engraved dots distinguish an Echo pad from island hubs and seal rings.
  for(const dx of [-.1,.1]){const dot=new THREE.Mesh(new THREE.CircleGeometry(.035,16),mat('#dac7ff'));dot.rotation.x=-Math.PI/2;dot.position.copy(worldPos(pad.anchor));dot.position.x+=dx;dot.position.y+=.024;group.add(dot);}
  echoViews.push({pad,marker,inner,ghost,body});
 }
 for(const bridge of puzzle.perspectiveBridges){
  const markers=[];
  for(const [i,point]of [bridge.from,bridge.to].entries()){
   const marker=new THREE.Mesh(new THREE.RingGeometry(.28,.32,4),mat(i?'#9670d1':'#499b9a',.9));marker.rotation.x=-Math.PI/2;marker.rotation.z=Math.PI/4;marker.position.copy(worldPos(point));marker.position.y+=.028;marker.material.depthTest=false;marker.material.depthWrite=false;marker.material.toneMapped=false;marker.renderOrder=10;group.add(marker);markers.push(marker);
  }
  const ends=[worldPos(bridge.from),worldPos(bridge.to)].map(p=>p.add(new THREE.Vector3(0,.04,0)));
  const thread=new THREE.Line(new THREE.BufferGeometry().setFromPoints(ends),new THREE.LineDashedMaterial({color:'#b3c8ee',transparent:true,opacity:.16,dashSize:.09,gapSize:.12}));thread.computeLineDistances();group.add(thread);
  bridgeViews.push({bridge,markers,thread});
 }
 return {
  update(now,focusedId,aligned,context={}){
   for(const {seal,parts,marker}of sealViews){
    for(const part of parts){part.material.opacity=seal.unlocked?.3:1;part.material.color.set(seal.unlocked?'#a8eedc':focusedId===seal.id&&aligned?'#d8fff0':part===parts[0]?'#9ef5e3':'#ffe2ae');}
    marker.material.opacity=seal.unlocked?.4:.75+Math.sin(now*.002)*.2;
   }
   for(const {seal,gate}of gateViews)gate.visible=!seal.unlocked;
   for(const {pad,marker,inner,ghost,body}of echoViews){const active=puzzle.echo?.padId===pad.id;ghost.visible=active;marker.material.opacity=active?.95:.5;inner.material.opacity=active?.9:.4;if(active)body.material.opacity=.42+Math.sin(now*.002)*.08;}
   for(const {bridge,markers,thread}of bridgeViews){
    const aligned=context.mode===0&&bridgeAlignment(bridge,bridge.from,0,context.angle||0,puzzle).aligned;
    markers.forEach((marker,i)=>{marker.material.color.set(aligned?'#287f81':i?'#9670d1':'#499b9a');marker.material.opacity=aligned?.95:.65;});
    thread.material.opacity=context.mode===0?(aligned?.3:.12):.08;
   }
  },
  dispose(){group.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});world.remove(group);}
 };
}
