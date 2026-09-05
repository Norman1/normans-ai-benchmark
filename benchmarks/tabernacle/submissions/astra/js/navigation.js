(function(A){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function segmentDistance2(x,z,s){
    const dx=s.bx-s.ax,dz=s.bz-s.az,l=dx*dx+dz*dz;
    const t=l?clamp(((x-s.ax)*dx+(z-s.az)*dz)/l,0,1):0;
    return (x-s.ax-dx*t)**2+(z-s.az-dz*t)**2;
  }
  A.Navigation=class {
    constructor(solids){this.solids=solids;this.radius=.43;this.x=15;this.z=31;this.yaw=.36;this.pitch=.035;this.eye=3.55;this.distance=0;}
    blocked(x,z){
      if(x < -31||x>31||z < -56||z>59)return true;
      const r=this.radius;
      return this.solids.some(s=>{
        if(s.disabled)return false;
        if(s.type==='circle')return (x-s.x)**2+(z-s.z)**2<(r+s.r)**2;
        if(s.type==='segment')return segmentDistance2(x,z,s)<(r+s.r)**2;
        const qx=clamp(x,s.x1,s.x2),qz=clamp(z,s.z1,s.z2);
        return (x-qx)**2+(z-qz)**2<r*r;
      });
    }
    move(dx,dz){
      // Substeps bound travel even after a slow frame, so walls cannot be tunnelled.
      const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));
      const sx=dx/steps,sz=dz/steps;let traveled=0;
      for(let i=0;i<steps;i++){
        const ox=this.x,oz=this.z;
        if(!this.blocked(this.x+sx,this.z))this.x+=sx;
        if(!this.blocked(this.x,this.z+sz))this.z+=sz;
        traveled+=Math.hypot(this.x-ox,this.z-oz);
      }
      this.distance+=traveled;return traveled;
    }
    walk(forward,side,dt,speed=5){
      const length=Math.max(1,Math.hypot(forward,side));forward/=length;side/=length;
      return this.move((-Math.sin(this.yaw)*forward+Math.cos(this.yaw)*side)*speed*dt,(-Math.cos(this.yaw)*forward-Math.sin(this.yaw)*side)*speed*dt);
    }
    look(dx,dy,sensitivity=1){this.yaw-=dx*.0024*sensitivity;this.pitch=clamp(this.pitch-dy*.0024*sensitivity,-1.3,1.3);}
    place(x,z,yaw=0,pitch=0){if(this.blocked(x,z))return false;this.x=x;this.z=z;this.yaw=yaw;this.pitch=pitch;return true;}
  };
})(window.ASTRA = window.ASTRA || {});
