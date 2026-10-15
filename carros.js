// ============================================================
// CARROS: modelo 3D do carro (rodas, torreta, escudo, nome).
// ============================================================

// cars
const wg=new T.CylinderGeometry(.42,.42,.4,12).rotateZ(PI/2),hg=new T.BoxGeometry(.43,.5,.12),WL=[[.95,1.35],[-.95,1.35],[.95,-1.35],[-.95,-1.35]],cars=[];
let P;

function tag(n,c){
  const cv=document.createElement('canvas');
  cv.width=256;
  cv.height=64;
  const x=cv.getContext('2d');
  x.font='bold 34px system-ui';
  x.textAlign='center';
  x.lineWidth=6;
  x.strokeStyle='#000';
  x.strokeText(n,128,44);
  x.fillStyle=c;
  x.fillText(n,128,44);
  const s=new T.Sprite(new T.SpriteMaterial({
    map:new T.CanvasTexture(cv),depthTest:false,transparent:true,fog:false
  }));
  s.scale.set(5,1.25,1);
  s.position.y=3.4;
  s.renderOrder=9;
  return s
}

function mkCar(name,col,me){
  const g=new T.Group();
  g.rotation.order='YXZ';
  sc.add(g);
  const B=(w,h,d,c,x,y,z,p=g)=>{
    const m=new T.Mesh(new T.BoxGeometry(w,h,d),M(c));
    m.position.set(x,y,z);
    m.castShadow=true;
    p.add(m);
    return m
  };
  B(2,.7,4,col,0,.85,0);
  B(1.7,.6,1.9,col,0,1.45,-.3);
  B(1.74,.32,1.6,0x1b2a3a,0,1.5,-.3);
  B(2.1,.3,.3,0x222222,0,.6,2.05);
  B(2.1,.3,.3,0x222222,0,.6,-2.05);
  [.7,-.7].forEach(x=>{
    B(.4,.2,.1,0xffffcc,x,.95,2.02);
    B(.4,.2,.1,0xff2222,x,.95,-2.02)
  });
  [.55,-.55].forEach(x=>B(.2,.2,.5,0x333333,x,.55,-2.15));
  const wh=WL.map(([x,z],k)=>{
    const p=new T.Group();
    p.position.set(x,.42,z);
    const w=new T.Mesh(wg,M(0x1a1a1a));
    w.castShadow=true;
    w.add(new T.Mesh(hg,M(0xcccccc)));
    p.add(w);
    g.add(p);
    return{
      p,w
    }
  });
  const tg=new T.Group();
  tg.position.set(0,1.95,.1);
  const bs=new T.Mesh(new T.CylinderGeometry(.55,.65,.35,10),M(0x333333));
  tg.add(bs);
  const bar=B(.24,.24,1.5,0x777777,0,.1,.9,tg);
  g.add(tg);
  const sh=new T.Mesh(new T.SphereGeometry(2.7,14,10),new T.MeshBasicMaterial({
    color:0x38b6ff,transparent:true,opacity:.25,depthWrite:false
  }));
  sh.position.y=1.2;
  sh.visible=false;
  g.add(sh);
  g.add(tag(name,'#'+col.toString(16).padStart(6,'0')));
  return{
    g,wh,tg,bar,sh,name,col,me,x:0,z:0,y:0,h:0,vx:0,vz:0,vf:0,vl:0,hp:100,alive:true,w:[0,0,0,0],wv:[0,0,0,0],spin:0,ta:0,ft:0,pt:0,bf:0,dT:0,mT:0,b:{
      sh:0,sp:0,dm:0
    },kick:0,in:{
      thr:0,st:0,br:0,rv:0,aim:null,fire:0
    },side:rnd()<.5?1:-1,stk:0,rvT:0
  }
}
const wp=(c,lx,lz)=>[c.x+lx*Math.cos(c.h)+lz*Math.sin(c.h),c.z-lx*Math.sin(c.h)+lz*Math.cos(c.h)];
