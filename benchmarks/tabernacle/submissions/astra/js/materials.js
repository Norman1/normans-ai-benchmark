(function (A) {
  'use strict';
  A.random = function(seed) { return () => { seed = Math.imul(1664525, seed) + 1013904223 | 0; return (seed >>> 0) / 4294967296; }; };
  A.makeMaterials = function(T) {
    const rand = A.random(712);
    function canvas(size, draw) { const c=document.createElement('canvas'); c.width=c.height=size; draw(c.getContext('2d'),size); return c; }
    function texture(c, repeat=1) { const t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(repeat,repeat); t.colorSpace=T.SRGBColorSpace; t.anisotropy=8; return t; }
    const grain=canvas(512,(c,n)=>{
      c.fillStyle='#bbb7aa'; c.fillRect(0,0,n,n);
      for(let i=0;i<50000;i++){let v=120+rand()*120;c.fillStyle=`rgba(${v},${v},${v},${.1+rand()*.2})`;c.fillRect(rand()*n,rand()*n,1+rand()*2,1+rand()*2);}
    });
    const sand=canvas(1024,(c,n)=>{
      c.fillStyle='#b7a181';c.fillRect(0,0,n,n);
      for(let y=0;y<n;y++) { let l=167+6*Math.sin(y*.12+3*Math.sin(y*.013)); c.fillStyle=`rgba(${l+21},${l+2},${l-29},.35)`;c.fillRect(0,y,n,1); }
      for(let i=0;i<140000;i++){const v=rand();c.fillStyle=v>.5?'rgba(248,224,170,.18)':'rgba(66,52,31,.10)';c.fillRect(rand()*n,rand()*n,v>.95?3:1,1);}
      for(let i=0;i<400;i++){c.fillStyle='rgba(83,71,51,.14)';c.beginPath();c.ellipse(rand()*n,rand()*n,.8+rand()*2,.5+rand(),rand()*3,0,Math.PI*2);c.fill();}
    });
    const cloth=canvas(512,(c,n)=>{
      c.fillStyle='#ece2c9';c.fillRect(0,0,n,n);
      for(let i=0;i<n;i+=2){c.fillStyle=`rgba(80,67,45,${.025+rand()*.075})`;c.fillRect(i,0,1,n);c.fillRect(0,i,n,1);}
      for(let i=0;i<5000;i++){c.fillStyle='rgba(88,72,48,.04)';c.fillRect(rand()*n,rand()*n,1,3+rand()*9);}
    });
    function woven(cherub) {
      return canvas(1024,(c,n)=>{
        c.fillStyle=cherub?'#292d47':'#494558';c.fillRect(0,0,n,n);
        const colors=['#263952','#633b50','#944235','#bea36b'];
        for(let i=0;i<8;i++){c.fillStyle=colors[i%4];c.fillRect(i*128,0,128,n);}
        c.globalAlpha=.15;for(let x=0;x<n;x+=3){c.fillStyle=x%2?'#ead7ae':'#050609';c.fillRect(x,0,1,n);c.fillRect(0,x,n,1);}c.globalAlpha=1;
        for(const y of [32,64,960,992]){c.fillStyle='#c6ae77';c.fillRect(0,y,n,3);}
        for(let y=100;y<950;y+=185)for(let x=64;x<n;x+=128){
          c.save();c.translate(x,y);c.strokeStyle='#c5ae78';c.fillStyle='#bda471';c.lineWidth=2;
          if(cherub){
            c.beginPath();c.ellipse(0,26,5,8,0,0,Math.PI*2);c.fill();
            c.beginPath();c.moveTo(0,35);c.lineTo(0,72);c.moveTo(-14,83);c.quadraticCurveTo(0,64,14,83);c.stroke();
            for(const s of [-1,1])for(let j=0;j<7;j++){c.beginPath();c.moveTo(0,50);c.quadraticCurveTo(s*(14+j*3),47-j*4,s*(24+j*2),12+j*4);c.stroke();}
          } else {c.beginPath();c.moveTo(0,5);c.lineTo(22,39);c.lineTo(0,73);c.lineTo(-22,39);c.closePath();c.stroke();c.beginPath();c.arc(0,39,5,0,7);c.fill();}
          c.restore();
        }
      });
    }
    const wood=canvas(512,(c,n)=>{
      c.fillStyle='#534133';c.fillRect(0,0,n,n);
      for(let x=0;x<n;x++){c.strokeStyle=`rgba(${60+rand()*90},${35+rand()*70},${18+rand()*40},.3)`;c.beginPath();c.moveTo(x,0);for(let y=0;y<=n;y+=16)c.lineTo(x+3*Math.sin(y/72+x/11),y);c.stroke();}
    });
    const goldMap=texture(grain);const sandMap=texture(sand,64);const clothMap=texture(cloth);
    const standard=(color,roughness=.7,metalness=0,extra={})=>new T.MeshStandardMaterial({color,roughness,metalness,...extra});
    const materials={
      sand:standard('#eee2c7',.96,0,{map:sandMap,bumpMap:sandMap,bumpScale:.13}),
      linen:standard('#fff3dd',.96,0,{map:clothMap,bumpMap:clothMap,bumpScale:.035,side:T.DoubleSide}),
      embroidered:standard('#ffffff',.89,0,{map:texture(woven(true)),side:T.DoubleSide}),
      screen:standard('#ffffff',.9,0,{map:texture(woven(false)),side:T.DoubleSide}),
      gold:standard('#c9a558',.36,.9,{map:goldMap,bumpMap:goldMap,bumpScale:.018,envMapIntensity:1.1}),
      darkGold:standard('#8c692f',.46,.8,{map:goldMap,envMapIntensity:.8}),
      bronze:standard('#a07747',.4,.86,{map:goldMap,bumpMap:goldMap,bumpScale:.028,envMapIntensity:1.1}),
      darkBronze:standard('#483f30',.68,.5,{map:goldMap}),
      silver:standard('#bec2bb',.3,.9,{envMapIntensity:1}),
      wood:standard('#c5aa84',.9,0,{map:texture(wood)}),
      rope:standard('#b4a17b',1),
      hair:standard('#3c3328',1,0,{map:clothMap,bumpMap:clothMap,bumpScale:.075,side:T.DoubleSide}),
      redHide:standard('#763d2c',.96,0,{map:goldMap,side:T.DoubleSide}),
      hide:standard('#93816a',.97,0,{map:goldMap,bumpMap:goldMap,bumpScale:.06,side:T.DoubleSide}),
      bread:standard('#ba8546',1,0,{map:goldMap,bumpMap:goldMap,bumpScale:.03}),
      coal:standard('#211a14',1),
      ember:new T.MeshBasicMaterial({color:'#ec6329'}),
      water:new T.MeshPhysicalMaterial({color:'#597a72',roughness:.12,metalness:.55,transparent:true,opacity:.88,envMapIntensity:1.6}),
      rock:standard('#89735b',1)
    };
    const glow=canvas(128,(c,n)=>{const g=c.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'rgba(255,242,199,.9)');g.addColorStop(.1,'rgba(255,191,72,.45)');g.addColorStop(.35,'rgba(255,140,40,.08)');g.addColorStop(1,'rgba(255,120,20,0)');c.fillStyle=g;c.fillRect(0,0,n,n);});
    materials.glowMap=texture(glow);
    const shadow=canvas(128,(c,n)=>{const g=c.createRadialGradient(n/2,n/2,4,n/2,n/2,n/2);g.addColorStop(0,'rgba(32,24,12,.5)');g.addColorStop(.5,'rgba(32,24,12,.2)');g.addColorStop(1,'rgba(32,24,12,0)');c.fillStyle=g;c.fillRect(0,0,n,n);});
    materials.shadow=new T.MeshBasicMaterial({map:texture(shadow),transparent:true,depthWrite:false});
    return materials;
  };
  A.environment=function(T,renderer){
    const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');
    const g=ctx.createLinearGradient(0,0,0,256);g.addColorStop(0,'#819da8');g.addColorStop(.45,'#cad6d2');g.addColorStop(.55,'#dfceb0');g.addColorStop(1,'#625949');ctx.fillStyle=g;ctx.fillRect(0,0,512,256);
    const sun=ctx.createRadialGradient(370,70,1,370,70,60);sun.addColorStop(0,'#fff8dc');sun.addColorStop(.2,'#fce8c4');sun.addColorStop(1,'#fce8c400');ctx.fillStyle=sun;ctx.fillRect(300,0,150,140);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.mapping=T.EquirectangularReflectionMapping;
    const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromEquirectangular(map);map.dispose();pmrem.dispose();return env.texture;
  };
})(window.ASTRA = window.ASTRA || {});
