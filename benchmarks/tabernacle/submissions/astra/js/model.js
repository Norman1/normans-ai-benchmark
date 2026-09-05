(function(A){
  'use strict';
  A.buildModel=function(T,m){
    const root=new T.Group();root.name='The Tabernacle';
    const solids=[],doors={},objects={},measured={},flames=[],sheets=[];
    const V=(x,y,z)=>new T.Vector3(x,y,z);
    const group=(id,parent=root)=>{const g=new T.Group();g.name=id;g.userData.inspect=id;parent.add(g);if(!objects[id])objects[id]=g;return g;};
    const add=(g,geo,mat,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
    const box=(g,w,h,d,mat,x=0,y=0,z=0)=>add(g,new T.BoxGeometry(w,h,d),mat,x,y,z);
    const cylinder=(g,r,h,mat,x=0,y=0,z=0,rt=r)=>add(g,new T.CylinderGeometry(rt,r,h,16),mat,x,y,z);
    const sphere=(g,r,mat,x,y,z,sx=1,sy=1,sz=1)=>{const o=add(g,new T.SphereGeometry(r,16,10),mat,x,y,z);o.scale.set(sx,sy,sz);return o;};
    function rod(g,a,b,r,mat){const va=V(...a),vb=V(...b),delta=vb.clone().sub(va);const o=cylinder(g,r,delta.length(),mat,...va.clone().add(vb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());return o;}
    function curve(g,points,r,mat){return add(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>V(...p))),32,r,7,false),mat);}
    function ring(g,r,thick,mat,x,y,z,rot=0){const o=add(g,new T.TorusGeometry(r,thick,6,18),mat,x,y,z);o.rotation.y=rot;return o;}
    function lathe(g,profile,mat,x=0,y=0,z=0){return add(g,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),40),mat,x,y,z);}
    function rect(id,x1,x2,z1,z2){const s={type:'rect',id,x1,x2,z1,z2};solids.push(s);return s;}
    function circle(id,x,z,r){solids.push({type:'circle',id,x,z,r});}
    function segment(id,ax,az,bx,bz,r){solids.push({type:'segment',id,ax,az,bx,bz,r});}
    function rope(g,a,b,r=.035){rod(g,a,b,r,m.rope);solids.push({type:'segment',id:g.name,ax:a[0],az:a[2],bx:b[0],bz:b[2],r:r+.05});}
    function shade(g,x,z,w,d){if(!m.shadow)return;const p=add(g,new T.PlaneGeometry(w,d),m.shadow,x,.026,z);p.rotation.x=-Math.PI/2;p.castShadow=false;p.receiveShadow=false;}
    function folded(g,width,height,mat,x,y,z,phase=0){
      const geo=new T.PlaneGeometry(width,height,Math.ceil(width*12),14),p=geo.attributes.position;
      for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i);const t=(height/2-py)/height;p.setZ(i,.085*Math.cos(px*10+phase)+.045*Math.sin(px*5+phase)*t);}
      geo.computeVertexNormals();return add(g,geo,mat,x,y,z);
    }
    function post(g,x,z,h,mat,baseMat,r=.14){
      const capMat=mat===m.wood?m.silver:mat;
      cylinder(g,r,h,mat,x,h/2,z);box(g,r*3,.2,r*3,baseMat,x,.1,z);cylinder(g,r*1.35,.1,capMat,x,h-.05,z);ring(g,.09,.019,capMat,x,h-.18,z);circle(g.name,x,z,r*2.2);
    }
    function poleRings(g,w,d,y,mat,poleLength){
      for(const sx of [-1,1])for(const sz of [-1,1])ring(g,.11,.025,mat,sx*(w/2+.1),y,sz*(d/2-.16),Math.PI/2);
      for(const sx of [-1,1])rod(g,[sx*(w/2+.1),y,-poleLength/2],[sx*(w/2+.1),y,poleLength/2],.055,mat);
    }
    function moulding(g,w,d,y,mat){for(const z of [-d/2,d/2])box(g,w,.055,.04,mat,0,y,z);for(const x of [-w/2,w/2])box(g,.04,.055,d,mat,x,y,0);}
    function horns(g,w,d,y,size,mat){for(const sx of [-1,1])for(const sz of [-1,1])curve(g,[[sx*(w/2-.12),y,sz*(d/2-.12)],[sx*(w/2-.10),y+size*.55,sz*(d/2-.10)],[sx*(w/2-.01),y+size,sz*(d/2-.01)]],size*.16,mat);}
    function lamp(g,x,y,z,scale=1){
      const bowl=lathe(g,[[0,0],[.08,0],[.16,.05],[.18,.12],[.14,.13],[.11,.07],[0,.05]],m.gold,x,y,z);bowl.scale.setScalar(scale);
      box(g,.025,.05,.025,m.coal,x,y+.1*scale,z);
      const flame=add(g,new T.SphereGeometry(.065*scale,10,8),new T.MeshBasicMaterial({color:'#ffe8a6'}),x,y+.23*scale,z);flame.scale.set(.65,2.3,.65);flame.castShadow=false;
      if(m.glowMap){const glow=new T.Sprite(new T.SpriteMaterial({map:m.glowMap,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.75}));glow.position.set(x,y+.24*scale,z);glow.scale.setScalar(1.45*scale);g.add(glow);flames.push({flame,glow,phase:flames.length*1.7});}
    }
    // Court coordinates: x is north, -z is west. One world unit is one cubit.
    const court=group('court');
    for(const x of [-25,25]){
      for(let i=0;i<20;i++){
        const z=-50+i*5,postZ=x<0?z:z+5;post(court,x,postZ,5,m.wood,m.bronze);
        const cloth=folded(court,5,5,m.linen,x,2.5,z+2.5);cloth.rotation.y=Math.PI/2;
        rod(court,[x,4.92,z],[x,4.92,z+5],.038,m.silver);
        ring(court,.11,.024,m.silver,x,4.76,postZ,Math.PI/2);
        if(i%2===0){rope(court,[x,4.75,postZ],[x+Math.sign(x)*2.1,.1,postZ+.7]);cylinder(court,.055,.45,m.bronze,x+Math.sign(x)*2.1,.1,postZ+.7);}
      }
      rect('court',x-.17,x+.17,-50,50);
    }
    for(let i=0;i<10;i++){
      const x=-20+i*5;post(court,x,-50,5,m.wood,m.bronze);
      folded(court,5,5,m.linen,x-2.5,2.5,-50);
      rod(court,[x-5,4.92,-50],[x,4.92,-50],.038,m.silver);
    }
    rect('court',-25,25,-50.18,-49.82);
    for(const s of [-1,1])for(let i=0;i<3;i++){
      const x=s*((s<0?15:10)+i*5);post(court,x,50,5,m.wood,m.bronze);folded(court,5,5,m.linen,s*(12.5+i*5),2.5,50);
      rod(court,[s*(10+i*5),4.92,50],[s*(15+i*5),4.92,50],.038,m.silver);
    }
    rect('court',-25,-10,49.82,50.18);rect('court',10,25,49.82,50.18);
    const gate=group('gate');
    for(const x of [-10,-5,0,5])post(gate,x,50,5,m.wood,m.bronze);
    rod(gate,[-10,5,50],[10,5,50],.05,m.silver);
    // The gate hangs in compressed folds, leaving walking openings between pillars.
    for(const x of [-8.25,8.25]){const c=folded(gate,10,5,m.screen,x,2.5,50);c.scale.x=.35;rect('gate',x-1.85,x+1.85,49.78,50.22);}
    measured.court={length:100,width:50,height:5};
    // The open, hollow altar body is exactly five by five by three cubits.
    const altar=group('altar');altar.position.set(0,0,24);
    const altarBody=new T.Group();altarBody.name='measured-bronzeAltar';altar.add(altarBody);
    for(const z of [-2.44,2.44])box(altarBody,5,3,.12,m.bronze,0,1.5,z);
    for(const x of [-2.44,2.44])box(altarBody,.12,3,4.76,m.bronze,x,1.5,0);
    measured.bronzeAltar=altarBody;
    moulding(altar,4.98,4.98,2.98,m.darkBronze);moulding(altar,5,5,.17,m.darkBronze);
    horns(altar,5,5,3,.4,m.bronze);poleRings(altar,5,5,1.6,m.bronze,8);
    for(let i=-11;i<=11;i++){box(altar,.032,.035,4.76,m.darkBronze,i*.2,1.5,0);box(altar,4.76,.035,.032,m.darkBronze,0,1.5,i*.2);}
    const rng=A.random?A.random(96):(()=>.4);
    for(let i=0;i<55;i++){const x=(rng()-.5)*4.3,z=(rng()-.5)*4.3;const o=sphere(altar,.13+rng()*.12,i%8===0?m.ember:m.coal,x,1.57+rng()*.1,z,1,.55,1);o.rotation.set(rng(),rng(),rng());}
    shade(altar,0,0,9,9);rect('altar',-2.56,2.56,21.44,26.56);
    for(const x of [-2.6,2.6])segment('altar',x,20,x,28,.06);
    const utensils=group('altar');utensils.position.set(4.1,0,24.4);
    lathe(utensils,[[.3,0],[.55,.12],[.66,.7],[.69,.75],[.62,.76],[.59,.2],[.28,.07]],m.bronze);curve(utensils,[[-.6,.63,0],[-.62,1.2,0],[.6,1.2,0],[.6,.63,0]],.028,m.bronze);
    rod(utensils,[.5,.08,0],[1.6,.18,1.5],.038,m.bronze);box(utensils,.35,.07,.5,m.bronze,1.7,.18,1.7);circle('altar',4.1,24.4,.72);rect('altar',4.4,6,24.3,26.4);
    // Bronze basin; no scriptural dimension is assigned to this interpretive shape.
    const laver=group('laver');laver.position.set(0,0,7);
    lathe(laver,[[0,0],[.8,0],[.92,.12],[.68,.3],[.32,.45],[.24,1.0],[.48,1.2],[.89,1.35],[1.25,1.7],[1.45,2.05],[1.48,2.17],[1.4,2.2],[1.36,2.02],[1.16,1.73],[.65,1.52],[0,1.48]],m.bronze);
    const water=add(laver,new T.CircleGeometry(1.29,64),m.water,0,1.94,0);water.rotation.x=-Math.PI/2;water.castShadow=false;
    for(const y of [.19,.4,1.06]){const torus=ring(laver,y===.19?.74:.31,.035,m.darkBronze,0,y,0);torus.rotation.x=Math.PI/2;}
    shade(laver,0,0,4.8,4.8);circle('laver',0,7,1.52);
    // Twenty boards on each long side, each 1.5 cubits across and 10 high.
    const tent=group('tent');
    for(const s of [-1,1])for(let i=0;i<20;i++){
      const z=-8-.75-i*1.5;box(tent,.18,10,1.5,m.gold,s*4.91,5,z);
      for(const dz of [-.38,.38])box(tent,.24,.16,.25,m.silver,s*4.88,.08,z+dz);
      // Fine board-edge reveals, not monumental columns.
      box(tent,.025,9.7,.035,m.darkGold,s*4.808,5,z-.72);
    }
    // Six west boards plus two overlapping corner boards; all eight retain 1.5 width.
    for(let i=0;i<6;i++){box(tent,1.5,10,.18,m.gold,-3.75+i*1.5,5,-37.91);for(const dx of [-.38,.38])box(tent,.25,.16,.26,m.silver,-3.75+i*1.5+dx,.08,-37.86);}
    for(const x of [-4.25,4.25]){box(tent,1.5,10,.18,m.gold,x,5,-37.69);for(const dx of [-.38,.38])box(tent,.25,.16,.26,m.silver,x+dx,.08,-37.64);}
    for(const x of [-4.72,4.72])for(const y of [1.4,3.2,5,6.8,8.6]){
      rod(tent,[x,y,-8.1],[x,y,-37.7],.055,m.gold);
      for(let z=-9;z>-37;z-=3)ring(tent,.1,.022,m.gold,x,y,z,Math.PI/2);
    }
    for(const y of [1.4,3.2,5,6.8,8.6])rod(tent,[-4.65,y,-37.45],[4.65,y,-37.45],.055,m.gold);
    rect('tent',-5.12,-4.65,-38.15,-7.95);rect('tent',4.65,5.12,-38.15,-7.95);rect('tent',-5.12,5.12,-38.15,-37.45);
    measured.tent={length:30,width:10,height:10};
    const covering=group('coverings');
    const roofLinen=m.embroidered.clone();roofLinen.side=T.FrontSide;
    const roofHair=m.hair.clone();roofHair.side=T.BackSide;roofHair.polygonOffset=true;roofHair.polygonOffsetFactor=-1;roofHair.polygonOffsetUnits=-1;
    // Panels are parameterised in developed (flat) cubits, then draped. Corner overlaps
    // are tucked into the sides; the rendering of those folds is interpretive.
    function roofSheet(length,width,index,mat,offset=0,goat=false){
      const columns=length*4,rows=width*4;
      const geo=new T.PlaneGeometry(length,width,columns,rows),p=geo.attributes.position;
      for(let i=0;i<p.count;i++){
        const u=p.getX(i),v=index*width+(width/2-p.getY(i));
        let along=goat?v-2:v;
        if(goat&&along<0)along=-along; // doubled front half-panel
        if(goat&&along>40)along=80-along; // turn the trailing hem up at the ground
        const side=Math.max(0,Math.abs(u)-5),back=Math.max(0,along-30);
        const x=Math.max(-5,Math.min(5,u));
        const y=10-Math.max(side,back)+offset;
        // A diagonal hospital fold tucks the rear corners onto the side planes.
        // max/min exchange the two panel axes without stretching either one.
        const z=-8-Math.min(along,30)+Math.min(side,back)-offset;
        p.setXYZ(i,x,y,z);
      }
      // Align each quad's diagonal with its crease. The other diagonal would
      // shortcut across a fold and artificially shrink the woven surface.
      const indices=[],point=i=>V(p.getX(i),p.getY(i),p.getZ(i));
      for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
        const a=r*(columns+1)+c,b=a+1,cc=a+columns+1,d=cc+1;
        if(point(a).distanceToSquared(point(d))>=point(b).distanceToSquared(point(cc)))indices.push(a,cc,d,a,d,b);
        else indices.push(a,cc,b,cc,d,b);
      }
      geo.setIndex(indices);
      geo.computeVertexNormals();const o=add(covering,geo,mat);o.userData.developed={length,width,index,layer:goat?'goatHairCurtains':'curtains'};sheets.push(o);return o;
    }
    for(let i=0;i<10;i++)roofSheet(28,4,i,roofLinen,.012);
    for(let i=0;i<11;i++)roofSheet(30,4,i,roofHair,.075,true);
    // Skin layers are weather covers; their dimensions are not given in Exodus.
    box(covering,10.25,.065,30.18,m.redHide,0,10.13,-23.02);
    box(covering,10.35,.06,30.3,m.hide,0,10.2,-23.03);
    for(const x of [-5.16,5.16])box(covering,.04,.35,30.3,m.hide,x,10.06,-23.03);
    for(let z=-9;z>-37;z-=3.5){
      for(const x of [-5.2,5.2]){rope(covering,[x,9.94,z],[Math.sign(x)*9.0,.1,z+1]);cylinder(covering,.075,.65,m.bronze,Math.sign(x)*9,.2,z+1);}
      rod(covering,[-5.15,10.25,z],[5.15,10.25,z],.021,m.rope);
    }
    // Fifty joining clasps on each of the two textile assemblies.
    for(let i=0;i<50;i++){
      const u=-13.8+i*(27.6/49),x=Math.max(-5,Math.min(5,u)),y=10-Math.max(0,Math.abs(u)-5);
      const r=ring(covering,.047,.012,m.gold,x,y-.028,-28);r.rotation.x=Math.PI/2;
      const ug=-14.8+i*(29.6/49),xg=Math.max(-5.075,Math.min(5.075,ug)),yg=10.075-Math.max(0,Math.abs(ug)-5);
      const rg=ring(covering,.047,.012,m.bronze,xg,yg,-26);rg.rotation.x=Math.PI/2;
    }
    function makeDoor(id,z,columns,baseMat,mat){
      const g=group(id);for(let i=0;i<columns;i++){const x=-4.6+9.2*i/(columns-1);post(g,x,z,10,m.gold,baseMat,.105);}
      rod(g,[-4.95,9.94,z],[4.95,9.94,z],.05,m.gold);
      const left=folded(g,5,9.9,mat,-2.5,4.95,z+.1,1),right=folded(g,5,9.9,mat,2.5,4.95,z+.1,1);
      const lc=rect(id,-5,0,z-.12,z+.32),rc=rect(id,0,5,z-.12,z+.32);
      doors[id]={open:false,amount:0,left,right,lc,rc,z,update(dt,visitor){
        if(!this.open&&this.amount>0&&visitor&&Math.abs(visitor.z-z)<visitor.radius+.42&&Math.abs(visitor.x)<5.5)this.open=true;
        const target=this.open?1:0;this.amount+=Math.sign(target-this.amount)*Math.min(Math.abs(target-this.amount),dt*.9);
        const t=this.amount*this.amount*(3-2*this.amount),w=5-4*t;
        left.scale.x=right.scale.x=w/5;left.position.x=-5+w/2;right.position.x=5-w/2;
        lc.x2=-5+w;rc.x1=5-w;
      }};
      return g;
    }
    makeDoor('entrance',-7.85,5,m.bronze,m.screen);
    makeDoor('veil',-28,4,m.silver,m.embroidered);
    // Table on the northern (positive x) side.
    const table=group('table');table.position.set(3.2,0,-18.6);table.rotation.y=Math.PI/2;
    const tableBody=new T.Group();table.add(tableBody);tableBody.name='measured-table';
    box(tableBody,2,.13,1,m.gold,0,1.435,0);
    for(const x of [-.85,.85])for(const z of [-.35,.35]){box(tableBody,.13,1.37,.13,m.gold,x,.685,z);box(tableBody,.17,.12,.17,m.darkGold,x,.12,z);}
    box(tableBody,1.85,.22,.07,m.gold,0,1.26,-.43);box(tableBody,1.85,.22,.07,m.gold,0,1.26,.43);
    for(const x of [-.93,.93])box(tableBody,.07,.22,.84,m.gold,x,1.26,0);
    measured.table=tableBody;moulding(table,1.99,.99,1.47,m.gold);poleRings(table,2,1,1.2,m.gold,3.4);
    for(const x of [-.53,.53]){
      lathe(table,[[0,0],[.36,0],[.41,.05],[.37,.075],[0,.04]],m.gold,x,1.5,0);
      for(let i=0;i<6;i++)sphere(table,.29,m.bread,x,1.59+i*.085,0,1,.23,.9);
    }
    for(const x of [-.2,.2])lathe(table,[[0,0],[.08,0],[.11,.13],[.12,.16],[.095,.17],[.07,.035],[0,.035]],m.gold,x,1.52,-.32);
    shade(table,0,0,4.6,3.4);rect('table',2.67,3.73,-19.63,-17.57);
    for(const z of [-17.5,-19.7])segment('table',1.5,z,4.9,z,.06);
    // The menorah's six branches and central stem hold seven oil lamps.
    const menorah=group('menorah');menorah.position.set(-3.2,0,-18.6);menorah.rotation.y=Math.PI/2;
    lathe(menorah,[[0,0],[.6,0],[.65,.12],[.51,.22],[.36,.26],[.2,.4],[.12,.5]],m.gold);
    rod(menorah,[0,.3,0],[0,3.0,0],.065,m.gold);
    for(let i=1;i<=3;i++)for(const s of [-1,1]){
      const x=s*i*.43,y=.65+(3-i)*.4;
      curve(menorah,[[0,y,0],[x*.42,y+.18,0],[x*.9,2.0,0],[x,2.55,0],[x,3,0]],.051,m.gold);
      for(let j=0;j<3;j++){const yy=2.16+j*.28;const xx=x*(.92+j*.04);sphere(menorah,.088,m.gold,xx,yy,0,1,.65,1);for(let k=0;k<3;k++){const a=k*Math.PI*2/3;const petal=sphere(menorah,.06,m.gold,xx+Math.cos(a)*.07,yy+.07,Math.sin(a)*.07,.5,1.35,.5);petal.rotation.z=Math.cos(a)*.4;}}
      lamp(menorah,x,3,0);
    }
    for(let j=0;j<4;j++){
      const y=.65+j*.59;sphere(menorah,.11,m.gold,0,y,0,1,.75,1);
      for(let k=0;k<3;k++){const a=k*Math.PI*2/3;sphere(menorah,.06,m.gold,Math.cos(a)*.08,y+.1,Math.sin(a)*.08,.6,1.5,.6);}
    }
    lamp(menorah,0,3,0);shade(menorah,0,0,3.4,3.4);rect('menorah',-3.64,-2.76,-20.15,-17.05);circle('menorah',-3.2,-18.6,.67);
    // Incense altar immediately before the veil, with two carrying rings.
    const incense=group('incense');incense.position.set(0,0,-25);
    const incenseBody=box(incense,1,2,1,m.gold,0,1,0);incenseBody.name='measured-altarOfIncense';measured.altarOfIncense=incenseBody;
    moulding(incense,.99,.99,1.96,m.darkGold);moulding(incense,1,1,.1,m.darkGold);horns(incense,1,1,2,.2,m.gold);
    for(const s of [-1,1]){ring(incense,.09,.022,m.gold,s*.57,1.8,0,Math.PI/2);rod(incense,[s*.57,1.8,-1],[s*.57,1.8,1],.036,m.gold);}
    lathe(incense,[[0,0],[.27,0],[.31,.06],[.26,.09],[0,.03]],m.darkGold,0,2.02,0);
    for(let i=0;i<8;i++)sphere(incense,.04,i%3?m.coal:m.ember,(rng()-.5)*.38,2.075,(rng()-.5)*.38,1,.5,1);
    shade(incense,0,0,2.5,3.5);rect('incense',-.53,.53,-25.53,-24.47);
    for(const x of [-.57,.57])segment('incense',x,-26,x,-24,.04);
    // The ark body has its stated dimensions, independent of lid, wings and poles.
    const ark=group('ark');ark.position.set(0,0,-33.9);
    const arkBody=box(ark,2.5,1.5,1.5,m.gold,0,.75,0);arkBody.name='measured-ark';measured.ark=arkBody;
    box(ark,2.5,.07,1.5,m.gold,0,1.535,0);moulding(ark,2.5,1.5,1.49,m.darkGold);moulding(ark,2.49,1.49,.065,m.darkGold);
    for(const z of [-.755,.755]){box(ark,2.21,.022,.012,m.darkGold,0,.21,z);box(ark,2.21,.022,.012,m.darkGold,0,1.27,z);for(const x of [-1.1,1.1])box(ark,.022,1.07,.012,m.darkGold,x,.74,z);}
    poleRings(ark,2.5,1.5,.46,m.gold,4.7);
    // Stylised kneeling forms. The text prescribes facing and wings, not anatomy.
    for(const s of [-1,1]){
      const x=s*.94;
      sphere(ark,.19,m.gold,x,1.66,0,1.25,.7,1.1);
      const torso=sphere(ark,.15,m.gold,x,1.94,0,.9,1.9,.8);torso.rotation.z=-s*.25;
      sphere(ark,.13,m.gold,x-s*.07,2.25,0,.9,1.05,.9);
      curve(ark,[[x,2.02,-.08],[x-s*.17,1.96,-.1],[x-s*.25,1.75,0]],.045,m.gold);
      curve(ark,[[x,2.02,.08],[x-s*.17,1.96,.1],[x-s*.25,1.75,0]],.045,m.gold);
      for(const side of [-1,1]){
        for(let f=0;f<9;f++){
          const pts=[[x,2.02,side*.07],[x-s*.15,2.34,side*.2],[x-s*(.6+f*.035),2.68-f*.035,side*(.2+f*.025)],[x-s*(.78+f*.021),2.69-f*.035,side*(.26+f*.021)]];
          const spline=new T.CatmullRomCurve3(pts.map(p=>V(...p))),pos=[],idx=[];
          for(let j=0;j<=18;j++){
            const t=j/18,p=spline.getPoint(t),tan=spline.getTangent(t),perp=V(-tan.y,tan.x,0).normalize();
            const w=.048*Math.sin(Math.PI*t)**.6;
            for(const k of [-1,0,1]){const q=p.clone().addScaledVector(perp,w*k);q.z+=side*(k===0?.019*Math.sin(Math.PI*t):0);pos.push(...q.toArray());}
            if(j<18)for(let k=0;k<2;k++){const n=j*3+k;idx.push(n,n+3,n+1,n+1,n+3,n+4);}
          }
          const feather=new T.BufferGeometry();feather.setAttribute('position',new T.Float32BufferAttribute(pos,3));feather.setIndex(idx);feather.computeVertexNormals();
          const featherMat=m.gold.clone();featherMat.side=T.DoubleSide;add(ark,feather,featherMat);
          curve(ark,pts,.01,m.gold);
        }
        curve(ark,[[x,2.04,side*.06],[x-s*.22,2.46,side*.2],[x-s*.8,2.72,side*.26]],.045,m.gold);
      }
    }
    shade(ark,0,0,5.2,6.4);rect('ark',-1.28,1.28,-34.68,-33.12);
    for(const x of [-1.35,1.35])segment('ark',x,-36.25,x,-31.55,.06);
    // A floor hit in the inner room opens the purpose of the sanctuary.
    const presence=group('presence');const anchor=add(presence,new T.PlaneGeometry(8,8),new T.MeshBasicMaterial({visible:false}),0,.035,-33);anchor.rotation.x=-Math.PI/2;
    function boundsOf(o){o.updateWorldMatrix(true,true);return new T.Box3().setFromObject(o);}
    function measure(key){const target=measured[key];if(!target?.isObject3D)return target;const b=boundsOf(target),size=b.getSize(V(0,0,0));return {length:key==='table'?size.z:size.x,width:key==='table'?size.x:size.z,height:size.y};}
    root.updateMatrixWorld(true);
    return {root,solids,doors,objects,measured,flames,sheets,measure,water,helpers:{box,rod,sphere,add,group,circle,rect,shade}};
  };
})(window.ASTRA = window.ASTRA || {});
