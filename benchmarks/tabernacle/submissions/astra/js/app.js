(function(A,T){
  'use strict';
  const $=id=>document.getElementById(id);
  const canvas=$('world'),panel=$('panel'),content=$('panelContent');
  $('retry').onclick=()=>location.reload();
  if(!T){$('unsupported').hidden=false;$('errorText').textContent='The local rendering library did not load. Please reload the walkthrough.';return;}
  let renderer,scene,camera,model,nav,materials,started=false,panelMode=null,activeEntry=null;
  let elapsed=0,last=0,hover=null,drag=null,dragged=false,pointer={x:0,y:0,inside:false},locked=false;
  let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,sensitivity=1,walkSpeed=5,quality='high';
  const keys=new Set(),ray=new T.Raycaster(),ndc=new T.Vector2(),clockLights=[],dustUniforms={time:{value:0}};
  let rayTargets=[],toastTimer,fpsFrames=0,fpsLast=0,viewHidden=false,mouseLookAvailable=true;
  const anchors={
    court:{x:11,z:33,yaw:.46,pitch:.035},
    holy:{x:1.25,z:-10.5,yaw:.06,pitch:-.02},
    inner:{x:0,z:-29.5,yaw:0,pitch:-.28}
  };
  function notify(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
  function setReady(){const b=$('begin');b.disabled=false;b.innerHTML='Enter the sanctuary <span>→</span>';canvas.dataset.ready='true';}
  function fail(error){console.error(error);$('unsupported').hidden=false;$('errorText').textContent='This walkthrough needs working WebGL. '+(error.message||'Please reload to try again.');}
  function atmosphere(){
    scene.fog=new T.Fog('#c9bea4',85,310);
    const sky=new T.Mesh(new T.SphereGeometry(460,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{sun:{value:new T.Vector3(-.43,.62,.66).normalize()}},vertexShader:'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;uniform vec3 sun;void main(){vec3 d=normalize(v);float h=max(d.y,0.);vec3 c=mix(vec3(.78,.72,.60),vec3(.27,.43,.49),pow(h,.55));float a=max(dot(d,sun),0.);c+=vec3(1.,.77,.42)*pow(a,90.)*.42;c+=vec3(1.,.9,.65)*smoothstep(.9993,.9996,a)*2.;gl_FragColor=vec4(c,1.);}'}));scene.add(sky);
    const groundGeo=new T.PlaneGeometry(800,800,120,120);groundGeo.rotateX(-Math.PI/2);
    const p=groundGeo.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),edge=Math.max(0,Math.min(1,(Math.max(Math.abs(x)-38,Math.abs(z)-65))/45));p.setY(i,edge*(2.5*Math.sin(x*.024+z*.011)+1.8*Math.cos(z*.034-x*.016)+1.2)-.012);}
    groundGeo.computeVertexNormals();const ground=new T.Mesh(groundGeo,materials.sand);ground.receiveShadow=true;ground.name='ground';scene.add(ground);
    const rng=A.random(332);
    for(let layer=0;layer<3;layer++){
      const segments=320,rows=14,positions=[],indices=[],radius=145+layer*48;
      for(let j=0;j<=rows;j++)for(let i=0;i<=segments;i++){
        const a=i/segments*Math.PI*2,r=radius+j*4;
        const ridge=10+10*Math.sin(a*3+layer)**2+7*Math.sin(a*8+layer*.6)**2+3.5*Math.sin(a*19+1.8)**2;
        const envelope=Math.sin(j/rows*Math.PI)**.85;
        const erosion=Math.sin(a*41+j*.7)*1.8+Math.sin(a*79-j*.8)*.9;
        const y=-2+envelope*(ridge+layer*4+erosion);
        positions.push(Math.cos(a)*r,y,Math.sin(a)*r);
        if(j<rows&&i<segments){const b=j*(segments+1)+i,c=b+segments+1;indices.push(b,c,b+1,b+1,c,c+1);}
      }
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
      const mountain=new T.Mesh(geo,new T.MeshStandardMaterial({color:layer===0?'#737568':'#929487',roughness:1,side:T.DoubleSide}));scene.add(mountain);
    }
    // Small stones stay outside the walkable enclosure, so they cannot trip the visitor.
    const rocks=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),materials.rock,190),dummy=new T.Object3D();
    for(let i=0;i<190;i++){
      const a=rng()*Math.PI*2,r=75+rng()*65;dummy.position.set(Math.cos(a)*r,-.1,Math.sin(a)*r);dummy.rotation.set(rng(),rng()*6,rng());const s=.1+rng()*.7;dummy.scale.set(s*1.5,s*.65,s);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
    }rocks.castShadow=true;rocks.receiveShadow=true;scene.add(rocks);
    const geo=new T.BufferGeometry(),points=[];
    for(let i=0;i<100;i++)points.push((rng()-.5)*8,.6+rng()*8,-9-rng()*28);
    geo.setAttribute('position',new T.Float32BufferAttribute(points,3));
    const dust=new T.Points(geo,new T.ShaderMaterial({uniforms:dustUniforms,transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexShader:'uniform float time;varying float fade;void main(){vec3 p=position;p.x+=sin(time*.12+p.z)*.16;p.y+=sin(time*.18+p.x)*.18;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(15./-mv.z,1.,2.5);fade=.12;gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float fade;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(.94,.76,.42,smoothstep(.5,0.,d)*fade);}'}));scene.add(dust);
    const smokeGeo=new T.BufferGeometry(),smoke=[];for(let i=0;i<28;i++)smoke.push(rng(),i/28,rng());smokeGeo.setAttribute('position',new T.Float32BufferAttribute(smoke,3));
    const incenseSmoke=new T.Points(smokeGeo,new T.ShaderMaterial({uniforms:dustUniforms,transparent:true,depthWrite:false,vertexShader:'uniform float time;varying float fade;void main(){float life=fract(position.y+time*.085);vec3 p=vec3(sin(life*9.+position.x*2.+time*.3)*life*.22,2.1+life*2.8,-25.+cos(life*7.+position.z)*life*.15);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp((15.+life*75.)/-mv.z,1.,40.);fade=sin(life*3.14159)*.1;gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float fade;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(.72,.73,.68,smoothstep(.5,0.,d)*fade);}'}));scene.add(incenseSmoke);
  }
  // Batch opaque static geometry by material and inspection target. This retains
  // individual measured source meshes for verification while reducing draw calls.
  function batchModel(){
    const batches=new Map(),skip=new Set(['entrance','veil']);model.root.updateMatrixWorld(true);
    model.root.traverse(o=>{
      if(!o.isMesh||!o.material.visible||o===model.water||o.material.transparent)return;
      let p=o,id=null;while(p&&p!==model.root){if(p.userData.inspect)id=p.userData.inspect;p=p.parent;}
      if(skip.has(id))return;
      const key=id+':'+o.material.uuid;let b=batches.get(key);if(!b){b={id,mat:o.material,p:[],n:[],uv:[],idx:[]};batches.set(key,b);}
      let geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);if(!geo.index)geo=geo.toNonIndexed();const pos=geo.attributes.position,norm=geo.attributes.normal,uv=geo.attributes.uv,offset=b.p.length/3;
      for(let i=0;i<pos.count;i++){b.p.push(pos.getX(i),pos.getY(i),pos.getZ(i));b.n.push(norm.getX(i),norm.getY(i),norm.getZ(i));b.uv.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}
      if(geo.index)for(let i=0;i<geo.index.count;i++)b.idx.push(offset+geo.index.getX(i));else for(let i=0;i<pos.count;i++)b.idx.push(offset+i);
      geo.dispose();o.visible=false;
    });
    for(const b of batches.values()){
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(b.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));geo.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));geo.setIndex(b.idx);geo.computeBoundingSphere();
      const mesh=new T.Mesh(geo,b.mat);mesh.userData.inspect=b.id;mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);rayTargets.push(mesh);
    }
    model.root.traverse(o=>{if(o.isMesh&&o.visible&&o.material.visible&&!o.material.transparent)rayTargets.push(o);});
    rayTargets.push(model.objects.presence.children[0]);
  }
  function lighting(){
    scene.environment=A.environment(T,renderer);
    scene.add(new T.HemisphereLight('#c8dce0','#766149',.74));
    const sun=new T.DirectionalLight('#ffe3b0',3.1);sun.position.set(-36,66,45);sun.target.position.set(0,0,-4);sun.castShadow=true;
    Object.assign(sun.shadow.camera,{left:-60,right:60,top:65,bottom:-65,near:1,far:170});sun.shadow.mapSize.set(4096,4096);sun.shadow.bias=-.00012;sun.shadow.normalBias=.045;scene.add(sun,sun.target);A.sun=sun;
    const lamps=new T.PointLight('#ffc76b',24,25,1.6);lamps.position.set(-3.2,3.55,-18.6);lamps.castShadow=true;lamps.shadow.mapSize.set(512,512);lamps.shadow.bias=-.001;lamps.shadow.normalBias=.025;scene.add(lamps);clockLights.push(lamps);
    const innerFill=new T.PointLight('#f8dca1',7,17,1.5);innerFill.position.set(1.6,4.8,-32);scene.add(innerFill);
    const thresholdFill=new T.PointLight('#ede5c4',11,24,1.8);thresholdFill.position.set(0,5.8,-9.2);scene.add(thresholdFill);
  }
  function resize(){const w=innerWidth,h=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='high'?1.75:1));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function updateCamera(){camera.position.set(nav.x,nav.eye,nav.z);camera.rotation.order='YXZ';camera.rotation.set(nav.pitch,nav.yaw,0);camera.updateMatrixWorld();}
  function pick(x=0,y=0){
    ndc.set(x,y);ray.setFromCamera(ndc,camera);ray.far=22;
    const hits=ray.intersectObjects(rayTargets,false);
    if(!hits.length)return null;
    let o=hits[0].object,id=o.userData.inspect;
    while(!id&&o.parent){o=o.parent;id=o.userData.inspect;}
    return A.entries[id]?id:null;
  }
  function updateFocus(){
    if(!started||panelMode||viewHidden){$('focusCard').hidden=true;return;}
    const id=pick(locked?0:pointer.inside?pointer.x:0,locked?0:pointer.inside?pointer.y:0);hover=id;
    canvas.classList.toggle('inspectable',!!id&&!locked&&!drag);
    $('focusCard').hidden=!id;
    if(id){$('focusTitle').textContent=A.entries[id].title;$('focusKind').textContent=(id==='entrance'||id==='veil')?'A THRESHOLD · CLICK TO EXPLORE':'LOOK CLOSER';}
  }
  function zone(){
    if(nav.z<-28&&Math.abs(nav.x)<5)return ['THE MOST HOLY PLACE','The ark of the testimony'];
    if(nav.z<-8&&nav.z>-38&&Math.abs(nav.x)<5)return ['THE HOLY PLACE','Light, bread and incense'];
    if(nav.z>50||Math.abs(nav.x)>25||nav.z<-50)return ['OUTSIDE THE COURT','A sanctuary in the wilderness'];
    return ['THE OUTER COURT','A boundary of fine linen'];
  }
  function frame(ms){
    requestAnimationFrame(frame);const dt=Math.min(.04,(ms-last)/1000||.016);last=ms;
    if(document.hidden)return;elapsed+=dt;
    for(const door of Object.values(model.doors)){
      // A moving hanging must not sweep through a visitor who entered its opening.
      door.update(dt,nav);
    }
    if(started&&!panelMode){
      const f=+(keys.has('ArrowUp')||keys.has('w')||keys.has('forward'))-+(keys.has('ArrowDown')||keys.has('s')||keys.has('back'));
      const s=+(keys.has('ArrowRight')||keys.has('d')||keys.has('right'))-+(keys.has('ArrowLeft')||keys.has('a')||keys.has('left'));
      nav.walk(f,s,dt,walkSpeed*(keys.has('Shift')?1.6:1));
      nav.yaw+=((+keys.has('q'))-(+keys.has('e')))*dt*1.15;
      nav.pitch=Math.max(-1.3,Math.min(1.3,nav.pitch+((+keys.has('r'))-(+keys.has('f')))*dt*.8));
    }
    updateCamera();
    if(!reduced){
      for(const f of model.flames){const flicker=1+.075*Math.sin(elapsed*8+f.phase)+.035*Math.sin(elapsed*17+f.phase);f.flame.scale.y=2.3*flicker;f.glow.material.opacity=.7+.06*Math.sin(elapsed*5+f.phase);}
      for(const l of clockLights)l.intensity=24+Math.sin(elapsed*7)*.4+Math.sin(elapsed*13)*.2;
      dustUniforms.time.value=elapsed;
    }
    renderer.render(scene,camera);
    fpsFrames++;
    if(ms-fpsLast>500){
      const z=zone();$('zoneLabel').textContent=z[0];$('zoneDescription').textContent=z[1];
      const angle=((nav.yaw*180/Math.PI)%360+360)%360;$('bearing').textContent=['W','S','E','N'][Math.round(angle/90)%4];$('needle').style.transform=`rotate(${90+angle}deg)`;
      canvas.dataset.position=`${nav.x.toFixed(3)},${nav.z.toFixed(3)}`;canvas.dataset.view=`${nav.yaw.toFixed(3)},${nav.pitch.toFixed(3)}`;canvas.dataset.fps=String(Math.round(fpsFrames*1000/(ms-fpsLast)));canvas.dataset.drawCalls=String(renderer.info.render.calls);
      canvas.dataset.thresholds=JSON.stringify(Object.fromEntries(Object.entries(model.doors).map(([k,v])=>[k,+v.amount.toFixed(2)])));
      fpsFrames=0;fpsLast=ms;
      if(panelMode==='plan')updatePlan();
    }
    if((fpsFrames%5)===0)updateFocus();
  }
  function closePanel(){
    panel.hidden=true;panelMode=null;activeEntry=null;document.body.classList.remove('panel-open');
    for(const id of ['guideButton','planButton','settingsButton'])$(id).setAttribute('aria-expanded','false');
    keys.clear();if(started)canvas.focus({preventScroll:true});
  }
  function openPanel(mode){
    if(document.pointerLockElement)document.exitPointerLock();keys.clear();panelMode=mode;panel.hidden=false;document.body.classList.add('panel-open');
    for(const id of ['guideButton','planButton','settingsButton'])$(id).setAttribute('aria-expanded',String(id.startsWith(mode)));
    panel.scrollTop=0;$('panelClose').focus({preventScroll:true});
  }
  function inspect(id){
    const e=A.entries[id];if(!e)return;activeEntry=id;
    content.innerHTML=`<div class="eyebrow">${e.category}</div><h2 id="panelTitle">${e.title}</h2><p class="lede">${e.lede}</p><p>${e.body}</p>${e.fact?`<div class="fact"><strong>${e.fact}</strong><span>${e.unit}</span></div>`:''}<h3>Look closely</h3><p>${e.detail||e.body}</p>${model.doors[id]?`<button class="primary" id="drawCurtain">${model.doors[id].open?'Close the hanging':'Draw aside for study'} <span>→</span></button>`:''}<p class="source">SOURCE · ${e.source}</p>${e.interpretation?`<h3>Reading the reconstruction</h3><p class="interpretation">${e.interpretation}</p>`:''}${id==='coverings'?`<button class="text-button" id="clothDiagram">See the textile measurements →</button>`:''}<button class="text-button" id="backToGuide">← All field notes</button>`;
    openPanel('entry');
    if($('drawCurtain'))$('drawCurtain').onclick=()=>{const door=model.doors[id];if(door.open&&Math.abs(nav.z-door.z)<.9){notify('Step clear of the hanging before closing it.');return;}door.open=!door.open;closePanel();notify(door.open?'The hanging is drawn aside for study.':'The hanging is closing.');};
    if($('clothDiagram'))$('clothDiagram').onclick=measurements;
    $('backToGuide').onclick=guide;
  }
  function guide(){
    content.innerHTML='<div class="eyebrow">THE FIELD GUIDE</div><h2 id="panelTitle">A material story.</h2><p class="lede">From the linen boundary to the ark at the centre.</p><p>Click any object as you walk, or open a note below. Each separates what Exodus specifies from the choices made in this reconstruction.</p><div class="guide-list">'+Object.entries(A.entries).map(([id,e])=>`<button data-entry="${id}"><span><b>${e.title}</b><small>${e.category}</small></span><span>↗</span></button>`).join('')+'</div><button class="text-button" id="measurements">Dimensions & construction notes →</button>';
    openPanel('guide');content.querySelectorAll('[data-entry]').forEach(b=>b.onclick=()=>inspect(b.dataset.entry));$('measurements').onclick=measurements;
  }
  function measurements(){
    content.innerHTML=`<div class="eyebrow">MEASURE & MATERIAL</div><h2 id="panelTitle">Built in cubits.</h2><p>A cubit is an ancient forearm-based unit. The scene uses cubits directly, preserving the brief’s proportions without claiming a single exact modern conversion.</p><div class="measure-grid"><span>Court</span><span>100 × 50 × 5</span><span>Tent</span><span>30 × 10 × 10</span><span>Bronze altar</span><span>5 × 5 × 3</span><span>Table</span><span>2 × 1 × 1½</span><span>Incense altar</span><span>1 × 1 × 2</span><span>Ark chest</span><span>2½ × 1½ × 1½</span></div><p class="small">Length × width × height. Horns, poles, bread, the ark cover and cherubim are additional to the measured bodies.</p><h3>The cloth before it is folded</h3><svg viewBox="0 0 280 154" class="plan-svg" role="img" aria-label="Ten linen panels of 28 by 4 cubits, and eleven goat-hair panels of 30 by 4 cubits"><g fill="#454154" stroke="#afa17b" stroke-width=".6">${Array.from({length:10},(_,i)=>`<rect x="${8+i*12}" y="15" width="12" height="84"/>`).join('')}${Array.from({length:11},(_,i)=>`<rect x="${141+i*12}" y="15" width="12" height="90" fill="#514638"/>`).join('')}</g><text x="8" y="122">10 LINEN · 28 × 4</text><text x="141" y="122">11 HAIR · 30 × 4</text><text x="8" y="142">FIFTY GOLD CLASPS</text><text x="141" y="142">FIFTY BRONZE CLASPS</text></svg><p>Five linen panels join to five. Five goat-hair panels join to six; the extra front curtain is doubled. The diagram shows the developed panels. The scene shows a folded assembly, with simplified tucked corners.</p><h3>What is interpretive</h3><p>The flat roof, wall thickness and corner joints; the appearance of textiles and cherubim; the dimensions of the laver and lampstand; the terrain, time of day and viewing light. The field notes explain these choices beside the relevant object.</p><p class="interpretation">This freely accessible walkthrough is for study. Drawing the entrance screen or veil aside is a viewing aid, not a reenactment of priestly access.</p><p class="source">PRIMARY TEXT · Exodus 25–27, 30, 36–40.<br>Rendering: locally bundled Three.js r160 (MIT). All geometry and textures made for this submission. No remote assets.</p><button class="text-button" id="backToGuide">← Field guide</button>`;
    openPanel('measure');$('backToGuide').onclick=guide;
  }
  function plan(){
    content.innerHTML=`<div class="eyebrow">THE PLAN</div><h2 id="panelTitle">Three thresholds.</h2><p>The entrance faces east. You move west through the court, into the Holy Place and beyond the veil.</p><svg class="plan-svg" viewBox="0 0 250 410" role="img" aria-label="Plan of the Tabernacle court, with live visitor location"><text x="118" y="12">W</text><text x="118" y="405">E</text><text x="220" y="209">N</text><text x="19" y="209">S</text><rect class="boundary" x="40" y="23" width="170" height="340"/><path stroke="#dec384" stroke-width="3" d="M91 363h68"/><rect class="room" x="108" y="64" width="34" height="102"/><path class="boundary dashed" d="M108 98h34M108 166h34"/><rect class="mark" x="120.75" y="75" width="8.5" height="5.1"/><rect class="mark" x="135" y="126" width="3.4" height="6.8"/><circle class="mark" cx="114" cy="129" r="3"/><rect class="mark" x="123.3" y="107" width="3.4" height="3.4"/><circle class="mark" cx="125" cy="217" r="5"/><rect class="mark" x="116.5" y="267" width="17" height="17"/><text x="52" y="78">ARK</text><text x="49" y="133">LAMPS</text><text x="150" y="133">TABLE</text><text x="144" y="219">LAVER</text><text x="145" y="280">ALTAR</text><text x="94" y="385">EASTERN GATE</text><path id="visitor" d="M0 -6L4 5L0 3L-4 5Z"/></svg><p class="small">The ivory arrow is your position. Choose a first-person study viewpoint, or close the plan and keep walking.</p><div class="plan-row"><button data-view="court">Outer court ↗</button><button data-view="holy">Holy Place ↗</button><button data-view="inner">Inner sanctuary ↗</button><button id="returnEast">Eastern gate ↗</button></div>`;
    openPanel('plan');updatePlan();content.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>visit(b.dataset.view));$('returnEast').onclick=()=>visit('east');
  }
  function updatePlan(){const p=$('visitor');if(p)p.setAttribute('transform',`translate(${125+nav.x*3.4} ${193+nav.z*3.4}) rotate(${-nav.yaw*180/Math.PI})`);}
  function visit(id){
    if(!started)begin();
    if(id==='holy'||id==='inner'){model.doors.entrance.open=true;if(id==='inner')model.doors.veil.open=true;}
    const v=id==='east'?{x:1.25,z:54,yaw:0,pitch:0}:anchors[id];
    if(nav.place(v.x,v.z,v.yaw,v.pitch)){closePanel();notify('First-person study viewpoint. Continue with the arrow keys.');}
  }
  function settings(){
    content.innerHTML=`<div class="eyebrow">MAKE YOURSELF AT HOME</div><h2 id="panelTitle">The way you explore.</h2><label class="setting">Rendering detail<select id="quality"><option value="high">High</option><option value="balanced">Balanced</option></select></label><label class="setting">Walking pace<select id="pace"><option value="3.5">Unhurried</option><option value="5">Natural</option><option value="7">Brisk</option></select></label><label class="setting">Look sensitivity<input id="sensitivity" type="range" min=".4" max="2" step=".1" value="${sensitivity}"></label><label class="setting">Reduce ambient motion<input id="motion" type="checkbox" ${reduced?'checked':''}></label><h3>At your own pace</h3><p>Arrow keys or W A S D move. Drag anywhere in the scene to look. Click a furnishing to inspect it. Hold Shift to walk faster.</p><p>For keyboard looking: Q / E turn left / right; R / F look up / down. Enter inspects the object in the centre of your view.</p><p>M opens the plan. G opens the field guide. H hides the interface. Escape closes a panel or releases mouse look.</p><h3>Mouse look</h3><p>For continuous looking, use the Mouse look button. If your browser does not allow it, dragging always works.</p><button class="text-button" id="resetView">Return to the eastern gate →</button><p class="source">ASTRA · A Place Set Apart<br>Every texture and model is included locally.</p>`;
    openPanel('settings');$('quality').value=quality;$('pace').value=String(walkSpeed);
    $('quality').onchange=e=>{quality=e.target.value;resize();A.sun.shadow.mapSize.setScalar(quality==='high'?4096:2048);if(A.sun.shadow.map)A.sun.shadow.map.dispose();A.sun.shadow.map=null;};
    $('pace').onchange=e=>walkSpeed=+e.target.value;$('sensitivity').oninput=e=>sensitivity=+e.target.value;$('motion').onchange=e=>reduced=e.target.checked;$('resetView').onclick=()=>visit('east');
  }
  function begin(){
    if(started)return;started=true;$('intro').classList.add('leaving');setTimeout(()=>$('intro').hidden=true,650);
    for(const id of ['location','compass','lookButton'])$(id).hidden=false;
    if(matchMedia('(pointer: coarse)').matches)$('touchControls').hidden=false;
    canvas.focus({preventScroll:true});notify('Arrow keys move · drag to look · click a furnishing to discover it.');
  }
  function mouseLookFallback(){mouseLookAvailable=false;$('lookButton').textContent='Look controls ?';$('lookButton').title='Help with looking and movement';$('lookButton').onclick=settings;notify('This browser uses drag-to-look. Hold and drag anywhere in the scene.');}
  function mouseLook(){if(!started)begin();closePanel();try{const p=canvas.requestPointerLock?.();p?.catch(mouseLookFallback);if(!canvas.requestPointerLock)mouseLookFallback();}catch{mouseLookFallback();}}
  function wire(){
    $('begin').onclick=begin;$('guideButton').onclick=()=>panelMode==='guide'?closePanel():guide();$('planButton').onclick=()=>panelMode==='plan'?closePanel():plan();$('settingsButton').onclick=()=>panelMode==='settings'?closePanel():settings();$('panelClose').onclick=closePanel;$('focusCard').onclick=()=>{if(hover)inspect(hover);};$('lookButton').onclick=mouseLook;
    canvas.addEventListener('pointerdown',e=>{if(!started||panelMode)return;canvas.focus({preventScroll:true});drag={x:e.clientX,y:e.clientY,travel:0};dragged=false;if(!locked)canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{
      pointer={x:e.clientX/innerWidth*2-1,y:1-e.clientY/innerHeight*2,inside:true};
      if(!started||panelMode)return;
      if(locked){nav.look(e.movementX,e.movementY,sensitivity);return;}
      if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.travel+=Math.abs(dx)+Math.abs(dy);if(drag.travel>5){dragged=true;canvas.classList.add('dragging');nav.look(dx,dy,sensitivity);}drag.x=e.clientX;drag.y=e.clientY;}
    });
    canvas.addEventListener('pointerup',e=>{if(!started||panelMode)return;const wasDrag=dragged;drag=null;canvas.classList.remove('dragging');if(!wasDrag){const id=pick(locked?0:e.clientX/innerWidth*2-1,locked?0:1-e.clientY/innerHeight*2);if(id)inspect(id);}dragged=false;});
    canvas.addEventListener('pointercancel',()=>{drag=null;dragged=false;canvas.classList.remove('dragging');});canvas.addEventListener('pointerleave',()=>pointer.inside=false);
    document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;$('reticle').hidden=!locked;keys.clear();drag=null;$('lookButton').innerHTML=locked?'Release mouse <span>Esc</span>':mouseLookAvailable?'Mouse look <span>↗</span>':'Look controls ?';$('lookButton').onclick=()=>locked?document.exitPointerLock():mouseLookAvailable?mouseLook():settings();});
    document.addEventListener('pointerlockerror',mouseLookFallback);
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){keys.clear();if(panelMode){e.preventDefault();e.stopPropagation();closePanel();}return;}
      if(panelMode){
        if(e.key==='Tab'){const list=[...panel.querySelectorAll('button,input,select')].filter(x=>!x.disabled);const first=list[0],end=list.at(-1);if(e.shiftKey&&document.activeElement===first){end.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===end){first.focus();e.preventDefault();}}
        return;
      }
      if(/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;
      const k=e.key.length===1?e.key.toLowerCase():e.key;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','q','e','r','f','Shift'].includes(k)&&started){
        keys.add(k);e.preventDefault();
        // A short tap can begin and end between render frames. Give it a small,
        // collision-checked step; holding the key continues smoothly in frame().
        if(!e.repeat){
          const f=['ArrowUp','w'].includes(k)?1:['ArrowDown','s'].includes(k)?-1:0;
          const s=['ArrowRight','d'].includes(k)?1:['ArrowLeft','a'].includes(k)?-1:0;
          if(f||s)nav.walk(f,s,.04,walkSpeed);
          if(k==='q')nav.yaw+=.045;if(k==='e')nav.yaw-=.045;
          if(k==='r')nav.pitch=Math.min(1.3,nav.pitch+.035);if(k==='f')nav.pitch=Math.max(-1.3,nav.pitch-.035);
        }
      }
      if(e.repeat)return;
      if(k==='m'){e.preventDefault();plan();}if(k==='g'){e.preventDefault();guide();}
      if(k==='Enter'&&started&&e.target===canvas){e.preventDefault();const id=pick();if(id)inspect(id);}
      if(k==='h'&&started){viewHidden=!viewHidden;for(const sel of ['.masthead','.controls','.location','.compass'])document.querySelector(sel).hidden=viewHidden;notify(viewHidden?'Interface hidden. Press H to restore it.':'Interface restored.');}
    });
    document.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
    addEventListener('blur',()=>{keys.clear();drag=null;});document.addEventListener('visibilitychange',()=>keys.clear());
    for(const button of document.querySelectorAll('[data-move]')){
      let down=0;button.addEventListener('pointerdown',e=>{down=performance.now();keys.add(button.dataset.move);button.setPointerCapture(e.pointerId);e.preventDefault();});
      const end=()=>{keys.delete(button.dataset.move);if(performance.now()-down<170){const d=button.dataset.move;nav.walk(d==='forward'?1:d==='back'?-1:0,d==='right'?1:d==='left'?-1:0,.13,walkSpeed);}};
      button.addEventListener('pointerup',end);button.addEventListener('pointercancel',()=>keys.delete(button.dataset.move));
    }
    addEventListener('resize',resize);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();keys.clear();$('unsupported').hidden=false;$('errorText').textContent='The graphics context was interrupted. Reload the walkthrough to restore it.';});
  }
  try{
    renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=T.SRGBColorSpace;
    scene=new T.Scene();camera=new T.PerspectiveCamera(59,1,.07,600);materials=A.makeMaterials(T);model=A.buildModel(T,materials);scene.add(model.root);nav=new A.Navigation(model.solids);nav.place(16,33,.4,.025);
    atmosphere();lighting();batchModel();resize();updateCamera();wire();
    // Inspectable measurements are exposed as DOM data for read-only browser verification.
    canvas.dataset.measurements=JSON.stringify(Object.fromEntries(Object.keys(model.measured).map(k=>[k,model.measure(k)])));
    canvas.dataset.colliderCount=String(model.solids.length);canvas.dataset.sheetCount=String(model.sheets.length);
    renderer.compile(scene,camera);renderer.render(scene,camera);setReady();requestAnimationFrame(frame);
  }catch(error){fail(error);}
})(window.ASTRA,window.THREE);
