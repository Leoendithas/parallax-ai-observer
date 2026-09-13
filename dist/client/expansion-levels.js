// Authored continuation of the original twenty chambers. Heights use the same
// tile spacing and camera rise as the perspective bridge projection.
const diagonalRise = steps => 1.15 * Math.hypot(steps, steps) * (12.65 / 14);
const H = diagonalRise(4);

// Each line is [column, row, stones, world height]. Separate lines at the same
// height belong to an ordinary platform; bridges join the separated platforms.
function layout(width, height, lines) {
 const map = Array.from({length:height},()=>Array(width).fill('.'));
 const elevations = [];
 for (const [x,z,stones,elevation=0] of lines) {
  [...stones].forEach((stone,offset)=>{
   if(stone==='.')return;
   if(!map[z]||x+offset<0||x+offset>=width||map[z][x+offset]!=='.')throw new Error('Expansion platforms must fit without overlapping.');
   map[z][x+offset]=stone;
   if(elevation)elevations.push({x:x+offset,z,height:elevation});
  });
 }
 return {map:map.map(row=>row.join('')),...(elevations.length?{elevations}:{})};
}

export const ECHO_CHAPTER_IDS = [21,22,23,24,25,26];
export const PERSPECTIVE_CHAPTER_IDS = [27,28,29,30,31,32];
export const EXPANSION_MASTERY_IDS = [33,34,35];

export const EXPANSION_LEVELS = [
 {
  id:21,progressKey:'echo-first-impression',chapter:'Echoes',name:'A trace<br>of you.',menu:'A trace of you',
  description:'A small part of you stays.<br>A new path appears.',
  ...layout(10,7,[[1,4,'SAAOBBE']]),
  shards:[{x:6,z:4,mode:1}],
  echoPads:[{id:'first',name:'First echo',anchor:{x:4,z:4},mode:0,gates:[{x:5,z:4}]}],
  mechanicHint:'At an amber echo pad, shift from overview to first person. Your echo holds the blue crossing open until you shift again.',
  hint:'Follow amber to the white echo pad. Enter first person while standing on it: an echo remains behind and opens the blue crossing. Stay in first person, collect the fragment, and reach the arch.',
  completion:'You moved on. Your echo held the way open.'
 },
 {
  id:22,progressKey:'echo-other-side',chapter:'Echoes',name:'From the<br>other side.',menu:'From the other side',
  description:'The blue world can leave<br>an amber memory, too.',
  ...layout(9,9,[[2,2,'S'],[2,3,'B'],[2,4,'B'],[2,5,'OAA'],[4,6,'A'],[4,7,'E']]),
  shards:[{x:4,z:6,mode:0}],
  echoPads:[{id:'answer',name:'Blue echo',anchor:{x:2,z:5},mode:1,gates:[{x:3,z:5}]}],
  mechanicHint:'A blue echo pad works the other way around: leave first person there to hold an amber crossing open.',
  hint:'Enter first person at the start and follow blue south to the echo pad. Shift to overview on the pad, leaving a blue echo. Follow the opened amber path east, then south, to the fragment and arch.',
  completion:'An echo can hold either world. It begins with the one you leave.'
 },
 {
  id:23,progressKey:'echo-two-quiet-places',chapter:'Echoes',name:'Two quiet<br>places.',menu:'Two quiet places',
  description:'One echo waits.<br>Two paths ask you to stay.',
  ...layout(11,9,[[1,2,'E'],[1,3,'A'],[1,4,'SAAAO'],[5,1,'O'],[5,2,'B'],[5,3,'B'],[6,4,'BBB'],[8,5,'B'],[8,6,'O']]),
  shards:[{x:5,z:1,mode:1},{x:8,z:6,mode:1}],
  echoPads:[
   {id:'patient',name:'Patient echo',anchor:{x:5,z:4},mode:0,gates:[{x:5,z:3},{x:6,z:4}]},
   {id:'north-return',name:'Northern echo',anchor:{x:5,z:1},mode:0,gates:[{x:5,z:3},{x:6,z:4}]},
   {id:'east-return',name:'Eastern echo',anchor:{x:8,z:6},mode:0,gates:[{x:5,z:3},{x:6,z:4}]}
  ],
  mechanicHint:'One echo can hold several crossings. Explore both blue branches before changing perspective.',
  hint:'Reach the central echo pad along amber and enter first person. Follow the northern blue branch for one fragment, then return to the pad without shifting. Take the eastern branch and follow its bend south for the other. Return to the echo pad, shift to overview, and follow amber back to the start and north to the arch.',
  completion:'You gave both paths your attention, while one echo waited.'
 },
 {
  id:24,progressKey:'echo-passing-a-light',chapter:'Echoes',name:'Passing<br>a light.',menu:'Passing a light',
  description:'Let one echo fade.<br>Leave another in its place.',
  ...layout(10,10,[[1,7,'SAOBBO'],[6,6,'A'],[6,5,'A'],[6,4,'A'],[6,3,'A'],[6,2,'E']]),
  shards:[{x:5,z:7,mode:1},{x:6,z:4,mode:0}],
  echoPads:[
   {id:'departure',name:'Departure echo',anchor:{x:3,z:7},mode:0,gates:[{x:4,z:7}]},
   {id:'arrival',name:'Arrival echo',anchor:{x:6,z:7},mode:1,gates:[{x:6,z:6}]}
  ],
  mechanicHint:'Only one echo remains at a time. The next pad can replace the old echo and open the next color.',
  hint:'Leave an amber echo at the first pad and cross blue for the first fragment. At the far pad, return to overview: your blue echo replaces the first and opens the amber path north. Follow it for the second fragment and the arch.',
  completion:'The first echo had done its part. The next carried you onward.'
 },
 {
  id:25,progressKey:'echo-a-place-to-return',chapter:'Echoes',name:'A place<br>to return.',menu:'A place to return',
  description:'Go out in one light.<br>Come home in another.',
  ...layout(10,11,[[4,1,'O'],[4,2,'B'],[1,3,'AAAOBBO'],[1,4,'A..B'],[1,5,'A..B'],[1,6,'A..B'],[1,7,'SAAO'],[1,8,'E']]),
  shards:[{x:4,z:1,mode:1},{x:7,z:3,mode:1},{x:3,z:3,mode:0}],
  echoPads:[
   {id:'outward',name:'Outward echo',anchor:{x:4,z:7},mode:0,gates:[{x:4,z:6}]},
   {id:'north-return',name:'Northern echo',anchor:{x:4,z:1},mode:0,gates:[{x:4,z:6}]},
   {id:'east-return',name:'Eastern echo',anchor:{x:7,z:3},mode:0,gates:[{x:4,z:6}]},
   {id:'homeward',name:'Homeward echo',anchor:{x:4,z:3},mode:1,gates:[{x:3,z:3}]}
  ],
  mechanicHint:'The far pad opens a separate way home. Explore its blue branches before leaving a blue echo.',
  hint:'Follow amber east to the lower echo pad, then enter first person and go north. At the upper pad, stay in blue while you visit the northern and eastern branches for their fragments. Return to the upper pad and shift to overview. The new echo opens amber west, then south: collect the remaining fragment and follow that path home to the arch.',
  completion:'The way home was a different color from the way out.'
 },
 {
  id:26,progressKey:'echo-last-note',chapter:'Echoes',name:'The last<br>note.',menu:'The last note',
  description:'A memory becomes another.<br>Keep the final one a little longer.',
  ...layout(12,12,[[1,9,'A'],[1,10,'S'],[1,8,'AAOBBBBO'],[8,7,'A'],[8,6,'A'],[3,5,'OBBOBO'],[6,4,'B'],[6,3,'B'],[6,2,'E']]),
  shards:[{x:6,z:8,mode:1},{x:8,z:6,mode:0},{x:3,z:5,mode:1},{x:6,z:3,mode:1}],
  echoPads:[
   {id:'first-note',name:'First echo',anchor:{x:3,z:8},mode:0,gates:[{x:4,z:8}]},
   {id:'middle-note',name:'Second echo',anchor:{x:8,z:8},mode:1,gates:[{x:8,z:7}]},
   {id:'last-note',name:'Last echo',anchor:{x:8,z:5},mode:0,gates:[{x:7,z:5}]},
   {id:'return-note',name:'Returning echo',anchor:{x:6,z:5},mode:0,gates:[{x:7,z:5}]}
  ],
  mechanicHint:'Pass through amber, blue, and amber again. The final pair of amber pads can hold the same crossing from either side.',
  hint:'Follow amber north and east to the first pad, leave an echo, and cross blue for a fragment. At the second pad, shift to overview and follow amber north for another. At the third pad, enter first person and cross west to the final white landing. Stay in blue to visit its western branch and its northern path to the arch. If you change perspective at that landing, its matching amber pad can reopen the crossing behind you.',
  completion:'Six echo chambers complete. Ahead, even the distance between stones can change with a new view.'
 },
 {
  id:27,progressKey:'perspective-first-crossing',chapter:'Perspective bridges',name:'Almost<br>together.',menu:'Almost together',
  description:'Two distant stones.<br>One shared place in your view.',
  ...layout(12,10,[[1,2,'SAO'],[7,6,'OBE',H]]),
  shards:[{x:8,z:6,mode:1}],
  perspectiveBridges:[{id:'first-crossing',name:'First perspective bridge',from:{x:3,z:2},to:{x:7,z:6}}],
  mechanicHint:'In overview, distant white bridge stones can line up. Stand on one, align their outlines, and cross with the bridge action.',
  hint:'Follow amber to the marked white stone. The starting overview lines it up with the higher landing: use the bridge action to cross. On the far stone, enter first person and follow blue to the fragment and arch. The bridge exists only in overview.',
  completion:'The stones were far apart. Your view brought them together.'
 },
 {
  id:28,progressKey:'perspective-turn-toward',chapter:'Perspective bridges',name:'Turn<br>toward it.',menu:'Turn toward it',
  description:'The path is waiting<br>at another angle.',
  ...layout(12,12,[[2,9,'S'],[2,8,'A'],[2,7,'O'],[6,3,'OAAO',H],[9,2,'B',H],[9,1,'E',H]]),
  shards:[{x:8,z:3,mode:0},{x:9,z:2,mode:1}],
  perspectiveBridges:[{id:'new-angle',name:'Turned perspective bridge',from:{x:2,z:7},to:{x:6,z:3}}],
  mechanicHint:'Turn the overview left or right to bring the bridge stones together. Alignment comes from the actual view.',
  hint:'Follow amber north to the bridge stone. Turn the overview left once from its starting view and cross when the two outlines meet. Stay in overview to follow the higher amber gallery east for a fragment. At the far white stone, enter first person and walk north through blue to the remaining fragment and arch.',
  completion:'A quarter turn revealed a way that was already there.'
 },
 {
  id:29,progressKey:'perspective-both-shores',chapter:'Perspective bridges',name:'Both<br>shores.',menu:'Both shores',
  description:'One place to begin.<br>Two horizons to bring home.',
  ...layout(14,13,[[5,4,'E'],[5,5,'A'],[5,6,'S'],[9,2,'OBO',H],[1,8,'O',H],[1,9,'B',H],[1,10,'O',H]]),
  shards:[{x:11,z:2,mode:1},{x:1,z:8,mode:1}],
  perspectiveBridges:[
   {id:'morning-shore',name:'Morning bridge',from:{x:5,z:6},to:{x:9,z:2}},
   {id:'evening-shore',name:'Evening bridge',from:{x:5,z:6},to:{x:1,z:10}}
  ],
  mechanicHint:'A single white stone can meet more than one horizon. You can cross each bridge in either direction.',
  hint:'At the start, turn overview left once to align the northeastern landing. Cross, enter first person, and explore its eastern blue balcony. Return to its bridge stone and to overview, then cross home. Turn the overview twice to meet the southwestern landing, cross, and follow blue north for its fragment. Return to the central stone in overview and take amber north to the arch.',
  completion:'You visited both shores, and learned to bring the horizon home.'
 },
 {
  id:30,progressKey:'perspective-over-the-crest',chapter:'Perspective bridges',name:'Over<br>the crest.',menu:'Over the crest',
  description:'Rise with one view.<br>Descend with another.',
  ...layout(15,12,[[2,9,'S'],[2,8,'A'],[2,7,'A'],[2,6,'O'],[6,2,'OAO',H],[12,6,'O'],[12,7,'B'],[12,8,'B'],[12,9,'E']]),
  shards:[{x:7,z:2,mode:0},{x:12,z:8,mode:1}],
  perspectiveBridges:[
   {id:'ascent',name:'Ascent bridge',from:{x:2,z:6},to:{x:6,z:2}},
   {id:'descent',name:'Descent bridge',from:{x:8,z:2},to:{x:12,z:6}}
  ],
  mechanicHint:'A higher platform can be the middle of a journey. Its next bridge may align at a different angle.',
  hint:'Follow amber north and turn the overview left once to climb the first bridge. Cross the high amber gallery for its fragment. At the next bridge stone, turn left once more to line up the lower landing and descend. Enter first person there and follow blue south to the remaining fragment and arch.',
  completion:'The highest place was another beginning.'
 },
 {
  id:31,progressKey:'perspective-between-heights',chapter:'Perspective bridges',name:'Between<br>heights.',menu:'Between heights',
  description:'Some paths need a new view.<br>Others need you to step inside.',
  ...layout(16,12,[[1,2,'SO'],[6,6,'OBBO',H],[13,2,'O',2*H],[13,3,'A',2*H],[13,4,'O',2*H],[7,8,'OBO',H],[9,9,'E',H]]),
  shards:[{x:8,z:6,mode:1},{x:13,z:3,mode:0},{x:7,z:8,mode:1}],
  perspectiveBridges:[
   {id:'lower-step',name:'Lower bridge',from:{x:2,z:2},to:{x:6,z:6}},
   {id:'upper-step',name:'Upper bridge',from:{x:9,z:6},to:{x:13,z:2}},
   {id:'last-step',name:'Returning bridge',from:{x:13,z:4},to:{x:9,z:8}}
  ],
  mechanicHint:'Bridge crossings need overview. Blue galleries between them need first person. Return to white stone before changing.',
  hint:'Cross the first bridge in the starting overview. Enter first person and cross the blue gallery for a fragment. At its far white stone, return to overview, turn left once, and climb the second bridge. Follow amber south for the next fragment, then cross the third bridge from the southern white stone at the same overview angle. Enter first person on the last landing, visit the blue branch to the west, and return to the arch just south of the landing.',
  completion:'You changed your view, your height, and the world beneath your feet.'
 },
 {
  id:32,progressKey:'perspective-borrowed-horizon',chapter:'Perspective bridges',name:'A borrowed<br>horizon.',menu:'A borrowed horizon',
  description:'Carry the light across<br>every space you have crossed.',
  ...layout(15,12,[[6,4,'E'],[6,5,'A'],[6,6,'S.O'],[8,7,'A'],[8,8,'O'],[10,2,'OBO',H],[4,1,'O',H],[4,2,'B',H],[4,3,'B',H],[4,4,'O',H]]),
  shards:[{x:11,z:2,mode:1},{x:8,z:7,mode:0},{x:4,z:1,mode:0}],
  perspectiveBridges:[
   {id:'outward-view',name:'Outward bridge',from:{x:6,z:6},to:{x:10,z:2}},
   {id:'middle-view',name:'Middle bridge',from:{x:12,z:2},to:{x:8,z:6}},
   {id:'far-view',name:'Far bridge',from:{x:8,z:8},to:{x:4,z:4}}
  ],
  mechanicHint:'The arch waits near the beginning. The last fragment rests in amber, at the end of a blue path.',
  hint:'Turn left once at the start and cross to the high eastern gallery. Use first person to collect its fragment and reach its far bridge stone. Return to overview and cross the second bridge at the same angle. Follow amber south for another fragment, then turn the overview left once more and cross to the western platform. Follow blue north to its last white stone and shift to overview for the final fragment. Retrace the blue path and all three bridges, then follow amber north from the start to the arch.',
  completion:'Six perspective bridge chambers complete. Three final journeys bring the old and new ways together.'
 },
 {
  id:33,progressKey:'echo-perspective-above-a-memory',chapter:'Further mastery',name:'Above<br>a memory.',menu:'Above a memory',
  description:'An echo opens the way.<br>A view carries you beyond it.',
  ...layout(13,12,[[1,2,'SOBBO'],[9,6,'O',H],[9,7,'B',H],[9,8,'B',H],[9,9,'E',H]]),
  shards:[{x:4,z:2,mode:1},{x:9,z:8,mode:1}],
  echoPads:[
   {id:'below',name:'Lower echo',anchor:{x:2,z:2},mode:0,gates:[{x:3,z:2}]},
   {id:'above',name:'Higher echo',anchor:{x:9,z:6},mode:0,gates:[{x:9,z:7}]}
  ],
  perspectiveBridges:[{id:'between-echoes',name:'Memory bridge',from:{x:5,z:2},to:{x:9,z:6}}],
  mechanicHint:'An echo can bring you to a bridge stone. Return to overview to cross, then leave a fresh echo on the other side.',
  hint:'Leave an amber echo at the lower pad and cross blue for the first fragment. At the far white stone, return to overview and cross the aligned perspective bridge. Leave a new amber echo at the higher landing, then follow its opened blue path south to the last fragment and arch.',
  completion:'One memory stayed below. Another opened the way above.'
 },
 {
  id:34,progressKey:'echo-perspective-turning-toward',chapter:'Further mastery',name:'Turning<br>toward tomorrow.',menu:'Turning toward tomorrow',
  description:'A turn reaches the viewpoint.<br>A memory reaches the light.',
  ...layout(13,14,[[1,11,'S'],[1,10,'B'],[1,9,'B'],[1,8,'OAAOAAO'],[7,9,'B'],[7,10,'O'],[4,5,'O'],[8,1,'OAO',H],[10,2,'B',H],[10,3,'E',H]]),
  shards:[{x:1,z:9,mode:1},{x:7,z:10,mode:1},{x:10,z:2,mode:1}],
  islands:[{id:'tomorrow',name:'Tomorrow island',pivot:{x:4,z:8},arm:[{x:2,z:8},{x:3,z:8},{x:5,z:8},{x:6,z:8}]}],
  echoPads:[
   {id:'beginning',name:'Beginning echo',anchor:{x:1,z:11},mode:0,gates:[{x:1,z:10}]},
   {id:'balcony',name:'Balcony echo',anchor:{x:7,z:8},mode:0,gates:[{x:7,z:9}]},
   {id:'balcony-return',name:'Returning balcony echo',anchor:{x:7,z:10},mode:0,gates:[{x:7,z:9}]},
   {id:'summit',name:'Summit echo',anchor:{x:10,z:1},mode:0,gates:[{x:10,z:2}]},
   {id:'summit-return',name:'Returning summit echo',anchor:{x:10,z:3},mode:0,gates:[{x:10,z:2}]}
  ],
  perspectiveBridges:[{id:'tomorrow-view',name:'Tomorrow bridge',from:{x:4,z:5},to:{x:8,z:1}}],
  mechanicHint:'Explore the island’s eastern balcony, then turn its arm north to reach a perspective bridge.',
  hint:'Leave an amber echo at the start and follow blue north for the first fragment. At the white landing, return to overview and cross both island arms to the eastern balcony. Leave an echo there and visit the blue branch for the second fragment. Return to the hub in overview and turn the island once clockwise so its arms run north–south. Walk to the northern bridge stone, turn the overview left once from its starting angle, and cross to the summit. Follow amber east, leave an echo at its last pad, and follow blue south to the last fragment and arch.',
  completion:'You turned toward the distance, then left a little light behind.'
 },
 {
  id:35,progressKey:'mastery-every-way-home',chapter:'Further mastery',name:'Every way<br>home.',menu:'Every way home',
  description:'A trace. A turn. A circle.<br>A horizon brought close.<br>Every way you have learned.',
  ...layout(14,15,[[1,10,'S'],[1,9,'B'],[1,8,'B'],[1,7,'OAOAO'],[3,5,'O'],[7,1,'OBBO',H],[10,2,'A',H],[10,3,'A',H],[10,4,'O',H],[6,8,'OBO'],[8,9,'A'],[8,10,'A'],[1,11,'OAAAAAAA'],[1,12,'B'],[1,13,'E']]),
  shards:[{x:1,z:8,mode:1},{x:9,z:1,mode:1},{x:7,z:8,mode:1},{x:1,z:12,mode:1}],
  islands:[{id:'homeward-turn',name:'Homeward island',pivot:{x:3,z:7},arm:[{x:2,z:7},{x:4,z:7}]}],
  seals:[
   {id:'high-window',name:'High window seal',anchor:{x:5,z:7},yaw:0,gates:[{x:8,z:1}]},
   {id:'open-home',name:'Home seal',anchor:{x:8,z:8},yaw:Math.PI,gates:[{x:1,z:12}]}
  ],
  echoPads:[
   {id:'first-memory',name:'First memory',anchor:{x:1,z:10},mode:0,gates:[{x:1,z:9}]},
   {id:'first-return',name:'Returning first memory',anchor:{x:1,z:7},mode:0,gates:[{x:1,z:9}]},
   {id:'high-memory',name:'High memory',anchor:{x:10,z:1},mode:1,gates:[{x:10,z:2}]},
   {id:'near-memory',name:'Near memory',anchor:{x:6,z:8},mode:0,gates:[{x:7,z:8}]},
   {id:'home-memory',name:'Home memory',anchor:{x:8,z:8},mode:1,gates:[{x:5,z:11}]},
   {id:'home-return',name:'Returning home memory',anchor:{x:1,z:11},mode:1,gates:[{x:5,z:11}]}
  ],
  perspectiveBridges:[
   {id:'far-horizon',name:'Far horizon bridge',from:{x:3,z:5},to:{x:7,z:1}},
   {id:'near-horizon',name:'Near horizon bridge',from:{x:10,z:4},to:{x:6,z:8}}
  ],
  mechanicHint:'The first seal opens the high gallery. The last seal opens the arch near home. Each echo carries you into the next part of the journey.',
  hint:'Leave an amber echo at the start and follow blue north for a fragment. At the white landing, return to overview and cross both island arms to the marked stone. Enter first person, face north, and bind the High window seal. Return to the hub in overview and turn the island once clockwise so its arms run north–south. Walk to the northern bridge, turn overview left once from its starting angle, and cross. Enter first person to cross the opened high gallery for a fragment. At its blue echo pad, shift to overview and follow amber south to the second bridge. Cross at the same angle. Leave an amber echo on the lower landing, cross blue for a fragment, and bind the Home seal while facing south at the far stone. Shift to overview there to leave a blue echo. Follow amber south, then west along the lower gallery to the white landing near the start. Enter first person and take the newly opened path south through the final fragment to the arch.',
  completion:'Thirty-five chambers complete. You have carried the light through every way of seeing, and found your way home.'
 }
];
