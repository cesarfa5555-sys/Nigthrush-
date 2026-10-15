// ============================================================
// FÍSICA: colisões, direção, suspensão, torreta, poeira e rastros (função drive).
// ============================================================

function bump(c,nx,nz,pen){
  c.x+=nx*pen;
  c.z+=nz*pen;
  const vn=c.vx*nx+c.vz*nz;
  if(vn<0){
    c.vx-=1.35*vn*nx;
    c.vz-=1.35*vn*nz;
    const im=-vn;
    if(im>7){
      hurt(c,(im-7)*.7,null);
      sparks(c.x-nx*1.6,c.y+1,c.z-nz*1.6,im);
      if(c.me)shake=Math.max(shake,Math.min(.5,im*.03));
      snd(70,30,.2,.35,'sine',.6,c.x,c.z)
    }
  }
}

function drive(c,dt,live){
  const i=c.in;
  if(!live){
    i.thr=i.rv=i.br=i.st=i.fire=0
  }
  const sp=c.b.sp>0?1.35:1;
  let fx_=Math.sin(c.h),fz=Math.cos(c.h),vf=c.vx*fx_+c.vz*fz,vl=c.vx*fz-c.vz*fx_,a=0;
  if(i.thr)a+=27*sp;
  if(i.rv)a-=15;
  if(i.br&&Math.abs(vf)>.3)a-=Math.sign(vf)*42;
  const gx=(H(c.x+1,c.z)-H(c.x-1,c.z))/2,gz=(H(c.x,c.z+1)-H(c.x,c.z-1))/2;
  vf+=(a-5.4*(gx*fx_+gz*fz))*dt;
  vf/=1+.7*dt;
  vf=cl(vf,-12,38*sp);
  vl*=Math.exp(-(i.br?2:5.5)*dt);
  c.h+=i.st*(2.4/(1+Math.abs(vf)/20))*cl(vf/5,-1,1)*dt;
  fx_=Math.sin(c.h);
  fz=Math.cos(c.h);
  c.vx=fx_*vf+fz*vl;
  c.vz=fz*vf-fx_*vl;
  c.x+=c.vx*dt;
  c.z+=c.vz*dt;
  c.vf=vf;
  c.vl=vl;
  for(const w of W){
    const qx=cl(c.x,w[0],w[2]),qz=cl(c.z,w[1],w[3]);
    let dx=c.x-qx,dz=c.z-qz,d=Math.hypot(dx,dz);
    if(d<1.7){
      if(d<1e-4){
        dx=1;
        dz=0;
        d=1
      }
      bump(c,dx/d,dz/d,1.7-d)
    }
  }
  for(const o of C){
    const d=Math.hypot(c.x-o.x,c.z-o.z);
    if(d<o.r+1.5&&d>.01)bump(c,(c.x-o.x)/d,(c.z-o.z)/d,o.r+1.5-d)
  }
  muroCarro(c);   // muro de areia (com buracos)
  // suspension
  const cs=Math.cos(c.h),sn=Math.sin(c.h),ws=c.w;
  WL.forEach(([lx,lz],k)=>{
    const t=H(c.x+lx*cs+lz*sn,c.z-lx*sn+lz*cs);
    c.wv[k]+=(190*(t-ws[k])-17*c.wv[k])*dt;
    ws[k]+=c.wv[k]*dt
  });
  const av=(ws[0]+ws[1]+ws[2]+ws[3])/4,fr=(ws[0]+ws[1])/2,re=(ws[2]+ws[3])/2,lf=(ws[0]+ws[2])/2,rg=(ws[1]+ws[3])/2;
  c.y=av;
  c.g.position.set(c.x,av,c.z);
  c.g.rotation.set(-Math.atan2(fr-re,2.7),c.h,Math.atan2(lf-rg,1.9));
  c.spin+=vf*dt/.42;
  c.wh.forEach((w,k)=>{
    const[lx,lz]=WL[k],pl=av+(fr-re)/2.7*lz+(lf-rg)/1.9*lx;
    w.p.position.y=.42+cl(ws[k]-pl,-.4,.4);
    w.p.rotation.y=k<2?i.st*.5:0;
    w.w.rotation.x=c.spin
  });
  for(const k in c.b)c.b[k]=Math.max(0,c.b[k]-dt);
  c.sh.visible=c.b.sh>0;
  // turret & fire
  const tgt=i.aim==null?0:ad(i.aim-c.h);
  c.ta+=cl(ad(tgt-c.ta),-9*dt,9*dt);
  c.tg.rotation.y=c.ta;
  c.kick=Math.max(0,c.kick-dt*8);
  c.bar.position.z=.9-c.kick*.3;
  c.ft-=dt;
  if(i.fire&&c.ft<=0&&live){
    c.ft=c.me?.13:.3;
    shoot(c)
  }
  // backfire, dust, trails
  if(c.pt&&!i.thr&&vf>13&&c.bf<=0){
    backfire(c);
    c.bf=.5
  }
  if(c.b.sp>0&&Math.random()<dt*3)backfire(c);
  c.pt=i.thr;
  c.bf-=dt;
  if(Math.abs(vf)>4){
    c.dT-=dt;
    c.mT-=dt;
    if(c.dT<=0){
      c.dT=.05;
      for(const lx of[.95,-.95]){
        const[x,z]=wp(c,lx,-1.35);
        fx(x,H(x,z)+.3,z,(rnd()-.5)*2,1+rnd()*1.5,(rnd()-.5)*2,0,.7,.45+rnd()*.4)
      }
    }
    if(c.mT<=0){
      c.mT=.06;
      for(const lx of[.95,-.95]){
        const[x,z]=wp(c,lx,-1.35);
        mark(x,z,Math.atan2(c.vx,c.vz),Math.min(2.6,Math.hypot(c.vx,c.vz)*.08+.3))
      }
    }
  }
  if(c.hp<35&&Math.random()<dt*10)fx(c.x+Math.sin(c.h)*1.5,c.y+1.3,c.z+Math.cos(c.h)*1.5,0,2,0,2,.8,.5)
}
