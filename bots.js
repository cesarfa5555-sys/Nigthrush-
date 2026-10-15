// ============================================================
// BOTS: inteligência dos carros inimigos.
// ============================================================

function ai(c,dt){
  const i=c.in;
  let tg=null,bd=1e9;
  for(const o of cars){
    if(o==c||!o.alive)continue;
    const d=Math.hypot(o.x-c.x,o.z-c.z);
    if(d<bd){
      bd=d;
      tg=o
    }
  }
  if(!tg){
    i.thr=0;
    i.fire=0;
    return
  }
  let tx=tg.x,tz=tg.z;
  if(c.hp<45){
    let m=1e9;
    for(const p of pus)if(p.g.visible){
      const d=Math.hypot(p.x-c.x,p.z-c.z);
      if(d<m){
        m=d;
        tx=p.x;
        tz=p.z
      }
    }
  }
  if(Math.hypot(c.x,c.z)>92){
    tx=0;
    tz=0
  }
  let an=Math.atan2(tx-c.x,tz-c.z);
  if(bd<22&&tx==tg.x)an+=c.side*1.1;
  const df=ad(an-c.h);
  i.st=cl(df*2.2,-1,1);
  i.thr=Math.abs(df)<1.3?1:0;
  i.br=0;
  i.rv=0;
  if(Math.hypot(c.vx,c.vz)<2&&i.thr){
    c.stk+=dt;
    if(c.stk>1){
      c.rvT=1;
      c.stk=0
    }
  }else c.stk=0;
  if(c.rvT>0){
    c.rvT-=dt;
    i.rv=1;
    i.thr=0;
    i.st=-i.st
  }
  const t=bd/78,aa=Math.atan2(tg.x+tg.vx*t-c.x,tg.z+tg.vz*t-c.z);
  i.aim=aa;
  i.fire=bd<55&&Math.abs(ad(aa-(c.h+c.ta)))<.14?1:0
}
