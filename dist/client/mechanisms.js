import * as THREE from './vendor/three.module.js';

// The ring halves stay fixed in the world. Perspective, not billboarding, joins them.
export function createMechanismView(puzzle,world,worldPos){
 const group=new THREE.Group();world.add(group);
 const sealViews=[],gateViews=[];
 const mat=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.DoubleSide});
 function floorRing(point,radius,color){
  const ring=new THREE.Mesh(new THREE.RingGeometry(radius-.025,radius,48),mat(color));
  ring.rotation.x=-Math.PI/2;ring.position.copy(worldPos(point));ring.position.y=.253;group.add(ring);return ring;
 }
 for(const island of puzzle.islands){
  floorRing(island.pivot,.43,'#ffd198');floorRing(island.pivot,.34,'#9a744a');
  const disk=new THREE.Mesh(new THREE.CylinderGeometry(.51,.51,.12,48),new THREE.MeshStandardMaterial({color:'#66584a',metalness:.45,roughness:.5}));
  disk.position.copy(worldPos(island.pivot));disk.position.y=-.32;group.add(disk);
  for(let i=0;i<4;i++){
   const notch=new THREE.Mesh(new THREE.BoxGeometry(.09,.025,.15),mat('#ffd198',.9));
   const a=i*Math.PI/2;notch.position.copy(worldPos(island.pivot));notch.position.x+=Math.sin(a)*.4;notch.position.z+=Math.cos(a)*.4;notch.position.y=.263;notch.rotation.y=a;group.add(notch);
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
   const gate=new THREE.Group();gate.position.copy(worldPos(point));gate.position.y=.25;
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.018,8,36),mat('#9ef5e3',.8));ring.rotation.x=-Math.PI/2;gate.add(ring);
   for(const dx of [-.32,.32]){const bar=new THREE.Mesh(new THREE.BoxGeometry(.025,.62,.025),mat('#9ef5e3',.65));bar.position.set(dx,.31,0);gate.add(bar);}
   group.add(gate);gateViews.push({seal,gate});
  }
 }
 return {
  update(now,focusedId,aligned){
   for(const {seal,parts,marker}of sealViews){
    for(const part of parts){part.material.opacity=seal.unlocked?.3:1;part.material.color.set(seal.unlocked?'#a8eedc':focusedId===seal.id&&aligned?'#d8fff0':part===parts[0]?'#9ef5e3':'#ffe2ae');}
    marker.material.opacity=seal.unlocked?.4:.75+Math.sin(now*.002)*.2;
   }
   for(const {seal,gate}of gateViews)gate.visible=!seal.unlocked;
  },
  dispose(){group.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});world.remove(group);}
 };
}
