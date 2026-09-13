export const LEVELS = [
 {name:'A different <br>light.',menu:'A different light',description:'See the world from above. <br>Then step inside it.',map:['.......','....BBE','....O..','..AAO..','..O....','SAA....','.......'],shards:[{x:4,z:1,mode:1}],hint:'Follow the amber path to the white stone. Enter first person, then walk the blue path to the arch.'},
 {name:'A little <br>detour.',menu:'A little detour',description:'Not every path leads forward. <br>Some lead to what you need.',map:['.......','..A....','..A....','SAOBOAE','....B..','....B..','.......'],shards:[{x:2,z:1,mode:0},{x:4,z:5,mode:1}],hint:'Explore each branch, then return to its white anchor. The first fragment is above the amber path; the second is below the blue path.'},
 {name:'The space <br>between.',menu:'The space between',description:'Separate paths. <br>A shared point of view.',map:['.........','.SAAOBBE.','.A..B..A.','.OAAOAAO.','.B..A..B.','.OBBOAAO.','.........'],shards:[{x:2,z:5,mode:1},{x:4,z:2,mode:1},{x:6,z:3,mode:0}],hint:'The central white stone joins both galleries. Try approaching it from below, and remember to look at it from both perspectives.'},
 {name:'The long <br>way home.',menu:'The long way home',description:'A familiar place. <br>An unfamiliar way back.',map:['.........','.SAAOBBO.','.B..A..B.','.O..OAAE.','.A..B....','.OBBOBB..','.........'],shards:[{x:1,z:4,mode:0},{x:6,z:5,mode:1},{x:6,z:1,mode:1}],hint:'Try shifting at the start. The far blue branch is a dead end: collect its fragment, then return to the anchor behind you.'},
 {name:'A circle, <br>broken.',menu:'A circle, broken',description:'What falls out of sight <br>can still be part of the way.',map:['.........','.OAAOBBO.','.B.....A.','.O..E..O.','.A..B..B.','.SBBOAAO.','.........'],shards:[{x:3,z:1,mode:0},{x:7,z:4,mode:1},{x:3,z:5,mode:1}],hint:'Travel around the outer ring, switching at white stone. The final blue path to the arch begins at the lower middle anchor.'},
 {name:'All things <br>converge.',menu:'All things converge',description:'The world was never <br>only one thing.',map:['.........','.OBBEAAO.','.A..A..B.','.OAASBBO.','.B..B..A.','.OBBOAAO.','.........'],shards:[{x:1,z:5,mode:0},{x:7,z:1,mode:1},{x:5,z:5,mode:0}],hint:'One amber fragment rests on white stone reached by a blue path. Shift there to collect it, then shift again to leave.'}
];
LEVELS.forEach((level,index)=>{level.id=index+1;level.progressKey=`original-${index+1}`;level.chapter="Perspective switching";});

// The second chapter expands the campaign with six rotating-island chambers.
export const ISLAND_CHAPTER_IDS = [7,8,9,10,11,12];
LEVELS.push(
 {
  id:7,progressKey:'island-intro',chapter:'Rotating islands',name:'A world<br>that turns.',menu:'A world that turns',
  description:'Reach the heart of the island.<br>Turn a new way into reach.',
  map:['.........','....OBE..','.........','.........','.SAAO....','.........','.........'],
  shards:[{x:5,z:1,mode:1}],
  islands:[{id:'turntable',name:'West island',pivot:{x:4,z:4},arm:[{x:2,z:4},{x:3,z:4}]}],
  hint:'Walk to the white circular hub. In overview, turn the island once clockwise to point its amber arm north. Walk to the far white landing, then enter first person and follow blue to the fragment and arch.'
 },
 {
  id:8,progressKey:'island-return',chapter:'Rotating islands',name:'Back to<br>the center.',menu:'Back to the center',
  description:'One path to find the light.<br>Another to carry it home.',
  map:['.........','....OBO..','.........','.........','.SAAO..O.','.......B.','.......B.','.......E.','.........'],
  shards:[{x:6,z:1,mode:1},{x:7,z:6,mode:1}],
  islands:[{id:'return',name:'Center island',pivot:{x:4,z:4},arm:[{x:2,z:4},{x:3,z:4}]}],
  mechanicHint:'The island can reach more than one landing. Bring each fragment back to its white hub.',
  hint:'Turn north and cross the blue balcony for the first fragment. Return along blue to the north landing, shift to overview, and walk back to the hub. Turn east, then follow the blue path to the second fragment and arch.',
  completion:'The center was a place to return to, as well as a way forward.'
 },
 {
  id:9,progressKey:'island-two-ends',chapter:'Rotating islands',name:'Two ends.<br>One turn.',menu:'Two ends. One turn',
  description:'Both arms move together.<br>Look at what each can reach.',
  map:['.........','....OBO..','.........','.........','.SAAOAAO.','.......B.','.......O.','....E....','.........'],
  shards:[{x:7,z:6,mode:1},{x:6,z:1,mode:1}],
  islands:[{id:'axis',name:'Two-ended island',pivot:{x:4,z:4},arm:[{x:2,z:4},{x:3,z:4},{x:5,z:4},{x:6,z:4}]}],
  mechanicHint:'Opposite amber arms turn as one island. Explore the landings at both ends.',
  hint:'Before turning, cross the hub to the east landing and collect the blue fragment below it. Return to the hub in overview and turn once: both arms now run north–south. Collect the north balcony fragment, return to the hub, then take the south arm to the arch.',
  completion:'One turn opened two paths. You found a use for each.'
 },
 {
  id:10,progressKey:'island-relay',chapter:'Rotating islands',name:'A second<br>turn.',menu:'A second turn',
  description:'Two islands.<br>Each with its own possibilities.',
  map:['...........','...........','...OBO.OBE.','...........','.SAO.OAO...','...........','...........'],
  shards:[{x:5,z:2,mode:1},{x:8,z:2,mode:1}],
  islands:[
   {id:'west',name:'West island',pivot:{x:3,z:4},arm:[{x:2,z:4}]},
   {id:'east',name:'East island',pivot:{x:7,z:4},arm:[{x:6,z:4}]}
  ],
  mechanicHint:'Each white hub controls its own amber arm. A shared landing joins the two islands.',
  hint:'Turn the west island north and visit its blue balcony. Return and turn east to cross the middle white landing to the second hub. Turn that island north, then follow blue to the remaining fragment and arch.',
  completion:'Two separate turns made one continuous journey.'
 },
 {
  id:11,progressKey:'island-way-back',chapter:'Rotating islands',name:'Leave a<br>way back.',menu:'Leave a way back',
  description:'The far island holds the light.<br>The first island holds the way home.',
  map:['...........','...........','...OBE.OBO.','...........','.SAOAOAO...','...........','.......OBO.','...........','...........'],
  shards:[{x:9,z:2,mode:1},{x:9,z:6,mode:1}],
  islands:[
   {id:'home',name:'Home island',pivot:{x:3,z:4},arm:[{x:2,z:4},{x:4,z:4}]},
   {id:'far',name:'Far island',pivot:{x:7,z:4},arm:[{x:6,z:4}]}
  ],
  mechanicHint:'The islands keep their positions while you explore. Return to a hub whenever you need another route.',
  hint:'Leave the home island horizontal and cross to the far hub. Turn north to collect its first balcony fragment. Return, turn twice to point south, and collect the other. Back at the far hub, turn west to cross home. Turn the home island north–south and take its northern blue path to the arch.',
  completion:'You found the light far away, and kept a route back to the beginning.'
 },
 {
  id:12,progressKey:'island-roads-between',chapter:'Rotating islands',name:'The roads<br>between.',menu:'The roads between',
  description:'A change of direction.<br>A change of perspective.<br>One journey through them both.',
  map:['...........','...........','...OBBBO.O.','.......A.B.','.SAOAO.O.O.','.......A...','...E...OBO.','...........','...........'],
  shards:[{x:5,z:4,mode:1},{x:9,z:6,mode:1},{x:9,z:2,mode:1}],
  islands:[
   {id:'departure',name:'Departure island',pivot:{x:3,z:4},arm:[{x:2,z:4},{x:4,z:4}]},
   {id:'arrival',name:'Arrival island',pivot:{x:7,z:4},arm:[{x:7,z:3},{x:7,z:5}]}
  ],
  mechanicHint:'White landings let you change perspective. Two-ended islands let you change where those landings lead.',
  hint:'First visit the middle white landing and shift to blue for its fragment. Return to the departure hub, turn north–south, and cross the northern blue gallery to the arrival island. Visit its south balcony, return and turn east–west for the east balcony. Turn north–south again, retrace the blue gallery, and take the departure island’s south arm to the arch.',
  completion:'Six island chambers complete. You can reshape a route, change perspective, and find your way back.'
 }
);
LEVELS.sort((a,b)=>a.id-b.id);

export function parseLevel(level){const tiles=[];level.map.forEach((row,z)=>[...row].forEach((type,x)=>{if(type!=='.')tiles.push({x,z,type,mask:type==='A'?1:type==='B'?2:3});}));return tiles;}
export function isSolid(tile,mode){return !!tile && !!(tile.mask & (1<<mode));}
export function findPath(tiles,start,target,mode){const queue=[[start]],seen=new Set([`${start.x},${start.z}`]);while(queue.length){const path=queue.shift(),p=path.at(-1);if(p.x===target.x&&p.z===target.z)return path.slice(1);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const t=tiles.find(t=>t.x===p.x+dx&&t.z===p.z+dz),k=t&&`${t.x},${t.z}`;if(isSolid(t,mode)&&!seen.has(k)){seen.add(k);queue.push([...path,t]);}}}return null;}
