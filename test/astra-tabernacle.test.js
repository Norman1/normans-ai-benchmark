import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const BASE=join(ROOT,'benchmarks/tabernacle/submissions/astra');
const read=path=>readFileSync(join(BASE,path),'utf8');
const context={console:{warn(){},error:console.error},setTimeout,clearTimeout};
context.window=context;context.self=context;vm.createContext(context);
for(const file of ['vendor/three.min.js','js/content.js','js/materials.js','js/model.js','js/navigation.js']){
  vm.runInContext(read(file),context,{filename:file});
}
const {THREE:T,ASTRA:A}=context;
// Use real Three.js geometry. Rendering and procedural canvas textures are tested
// separately in the browser; this suite measures vertices and walks the colliders.
function fixture(){
  const m=new Proxy({}, {get:(o,key)=>['glowMap','shadow'].includes(key)?null:(o[key]??=new T.MeshStandardMaterial())});
  const model=A.buildModel(T,m);return {model,nav:new A.Navigation(model.solids)};
}
function near(actual,expected,message){assert.ok(Math.abs(actual-expected)<.00001,`${message}: ${actual} != ${expected}`);}
function bounds(o){o.updateWorldMatrix(true,true);return new T.Box3().setFromObject(o).getSize(new T.Vector3());}

test('Astra is registered, and every runtime script and stylesheet ships locally',()=>{
  const manifest=JSON.parse(readFileSync(join(ROOT,'benchmarks/tabernacle/submissions/index.json'),'utf8'));
  const entry=manifest.submissions.find(s=>s.id==='astra');assert.equal(entry.agent,'GPT-6 Astra');
  assert.equal(entry.entry,'./benchmarks/tabernacle/submissions/astra/index.html');
  const html=read('index.html');
  for(const [,asset] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    assert.ok(asset.startsWith('./'),`Asset must be relative: ${asset}`);
    assert.ok(existsSync(join(BASE,asset)),`Missing asset: ${asset}`);
  }
  assert.doesNotMatch(html,/<script[^>]*type="module"/);
  for(const file of ['js/content.js','js/materials.js','js/model.js','js/navigation.js','js/app.js','style.css']){
    assert.doesNotMatch(read(file),/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB)\s*\(/,file);
    assert.doesNotMatch(read(file),/https?:\/\//,file);
  }
});

test('the declared dimensions match the benchmark, and the built furniture matches the declaration',()=>{
  const expected={unit:'cubit',court:{length:100,width:50,height:5},tent:{length:30,width:10,height:10},ark:{length:2.5,width:1.5,height:1.5},table:{length:2,width:1,height:1.5},altarOfIncense:{length:1,width:1,height:2},bronzeAltar:{length:5,width:5,height:3},curtains:{count:10,length:28,width:4},goatHairCurtains:{count:11,length:30,width:4}};
  const declared=JSON.parse(read('index.html').match(/id="tabernacle-dimensions">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(declared,expected);assert.deepEqual(JSON.parse(JSON.stringify(A.DIMENSIONS)),expected);
  const {model}=fixture();
  for(const key of ['ark','table','altarOfIncense','bronzeAltar'])for(const axis of ['length','width','height']){
    near(model.measure(key)[axis],expected[key][axis],`${key}.${axis}`);
  }
  // Independently measure the entire board assembly instead of its metadata.
  const tent=bounds(model.objects.tent);near(tent.x,10,'tent width');near(tent.y,10,'tent height');near(tent.z,30,'tent length');
  const sides=model.objects.court.children.filter(o=>o.geometry?.type==='PlaneGeometry'&&Math.abs(o.rotation.y-Math.PI/2)<.001);
  near(Math.max(...sides.map(o=>o.position.x))-Math.min(...sides.map(o=>o.position.x)),50,'court hanging-line width');
  near(Math.max(...sides.map(o=>o.position.z+o.geometry.parameters.width/2))-Math.min(...sides.map(o=>o.position.z-o.geometry.parameters.width/2)),100,'court hanging-line length');
  for(const hanging of sides)near(hanging.geometry.parameters.height,5,'court hanging height');
  for(const [layer,count,length]of[['curtains',10,28],['goatHairCurtains',11,30]]){
    const sheets=model.sheets.filter(s=>s.userData.developed.layer===layer);assert.equal(sheets.length,count);
    for(const sheet of sheets){assert.equal(sheet.geometry.parameters.width,length);assert.equal(sheet.geometry.parameters.height,4);}
  }
});

test('scriptural counts are present in distinct physical pieces',()=>{
  const {model}=fixture();const pillars=[],boards=[];
  model.root.traverse(o=>{
    const p=o.geometry?.parameters;
    if(o.geometry?.type==='CylinderGeometry'&&p.height===5&&p.radiusTop===.14)pillars.push(o);
    if(o.geometry?.type==='BoxGeometry'&&p.height===10&&(p.width===1.5||p.depth===1.5))boards.push(o);
  });
  assert.equal(pillars.length,60);assert.equal(new Set(pillars.map(p=>p.position.x+','+p.position.z)).size,60,'pillars must not be doubled at corners');
  assert.equal(boards.length,48,'twenty north, twenty south, six west and two corner boards');
  // Lamp bowls are rotational solids sitting at the shared three-cubit lamp level.
  const lamps=model.objects.menorah.children.filter(o=>o.geometry?.type==='LatheGeometry'&&o.position.y===3);
  assert.equal(lamps.length,7);
});

test('folding preserves every curtain triangle’s lengths and total developed area',()=>{
  const {model}=fixture();
  for(const sheet of model.sheets){
    const {length,width,layer,index}=sheet.userData.developed;
    const p=sheet.geometry.attributes.position,uv=sheet.geometry.attributes.uv,ix=sheet.geometry.index;
    let area=0;
    const v=i=>new T.Vector3(p.getX(i),p.getY(i),p.getZ(i));
    for(let i=0;i<ix.count;i+=3){
      const ids=[ix.getX(i),ix.getX(i+1),ix.getX(i+2)],vertices=ids.map(v);
      area+=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).length()/2;
      for(let e=0;e<3;e++){
        const a=ids[e],b=ids[(e+1)%3];
        const flat=Math.hypot((uv.getX(a)-uv.getX(b))*length,(uv.getY(a)-uv.getY(b))*width);
        near(v(a).distanceTo(v(b)),flat,`${layer} ${index} edge`);
      }
    }
    assert.ok(Math.abs(area-length*width)<length*width*0.000001,`${layer} ${index} area: ${area}`); // accumulated Float32 rounding
  }
});

test('large movements cannot tunnel through the court, walls, or furnishings',()=>{
  const {nav}=fixture();
  const cases=[
    {from:[0,30],delta:[0,-100],axis:'z',min:26.95,max:27.15},
    {from:[0,12],delta:[0,-20],axis:'z',min:8.9,max:9.1},
    {from:[0,-29.5],delta:[0,-20],axis:'z',min:-32.72,max:-32.55},
    {from:[0,-15],delta:[100,0],axis:'x',min:4.0,max:4.25},
    {from:[10,35],delta:[100,0],axis:'x',min:24.1,max:24.45},
    {from:[0,-22],delta:[0,-20],axis:'z',min:-24.05,max:-23.85}
  ];
  for(const c of cases){assert.ok(nav.place(...c.from));nav.move(...c.delta);assert.ok(nav[c.axis]>=c.min&&nav[c.axis]<=c.max,JSON.stringify({c,x:nav.x,z:nav.z}));assert.equal(nav.blocked(nav.x,nav.z),false);}
});

test('collision includes low bases, projecting poles, ropes and posts',()=>{
  const {nav}=fixture();
  for(const [x,z]of[[-2.6,-18.6],[1.6,-17.5],[1.35,-34],[2.6,24],[-25,-50],[5,-20],[7,-8.5]]){
    assert.ok(nav.blocked(x,z),`Expected a solid at ${x},${z}`);
  }
  for(const [x,z]of[[1.5,-18.6],[0,-32.1],[0,27.4]])assert.equal(nav.blocked(x,z),false,'spaces between carrying poles stay walkable');
});

test('screens block passage until drawn aside, and stay clear of a visitor while closing',()=>{
  const {nav,model}=fixture();
  for(const [id,x]of[['entrance',1.15],['veil',0]]){
    const door=model.doors[id];assert.ok(nav.place(x,door.z+1.1));nav.move(0,-5);assert.ok(nav.z>door.z+.7,`${id} must block`);
    door.open=true;door.update(2);assert.ok(nav.place(x,door.z+1.1));nav.move(0,-2.2);near(nav.z,door.z-1.1,`${id} open passage`);
    assert.ok(nav.place(x,door.z));door.open=false;door.update(.5,nav);assert.equal(door.open,true);assert.equal(door.amount,1);
    assert.ok(nav.place(x,door.z+1.1));door.open=false;door.update(2,nav);assert.equal(door.amount,0);
  }
});

test('a continuous collision-free route reaches the inner sanctuary from the eastern gate',()=>{
  const {nav,model}=fixture();for(const d of Object.values(model.doors)){d.open=true;d.update(2);}
  assert.ok(nav.place(1.25,54));
  const route=[[1.25,30],[-4,30],[-4,1],[1.15,1],[1.15,-12],[0,-12],[0,-22],[2,-22],[2,-26.7],[0,-26.7],[0,-30]];
  for(const [x,z]of route){
    const dx=x-nav.x,dz=z-nav.z,n=Math.ceil(Math.hypot(dx,dz)/.09);
    for(let i=0;i<n;i++){nav.move(dx/n,dz/n);assert.equal(nav.blocked(nav.x,nav.z),false);}
    near(nav.x,x,'route x');near(nav.z,z,'route z');
  }
});

test('all required places have physical inspection targets and sourced explanations',()=>{
  const {model}=fixture();
  for(const id of ['court','gate','altar','laver','tent','entrance','coverings','table','menorah','incense','veil','ark','presence']){
    assert.ok(model.objects[id],`Missing scene target ${id}`);assert.ok(A.entries[id].body.length>100);assert.match(A.entries[id].source,/Exodus/);
  }
  assert.ok(model.objects.table.position.x>0,'table is north');assert.ok(model.objects.menorah.position.x<0,'lampstand is south');
  assert.ok(model.objects.incense.position.z>-28,'incense before veil');assert.ok(model.objects.ark.position.z<-28,'ark behind veil');
});
