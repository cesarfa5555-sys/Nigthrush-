// ============================================================
// EFEITOS: partículas (poeira, fogo, faíscas) e rastros de pneu que somem.
// ============================================================

// textura macia (bolinha de borda suave) para poeira, fumaça e brilhos
const SOFT=(()=>{
  const c=document.createElement('canvas');
  c.width=c.height=64;
  const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)');
  g.addColorStop(.45,'rgba(255,255,255,.55)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,64,64);
  return new T.CanvasTexture(c);
})();
// tipos: 0 poeira, 1 fogo, 2 fumaça, 3 faísca
const PCOR=[0xd8b98a,0xff9a28,0x6c6560,0xffe9a0],PL=[];
let pk=0;
for(let i=0;i<200;i++){
  const m=new T.Sprite(new T.SpriteMaterial({map:SOFT,transparent:true,depthWrite:false}));
  m.visible=false;
  sc.add(m);
  PL.push({m,l:0,L:1,v:[0,0,0],s:1,t:0});
}

function fx(x,y,z,vx,vy,vz,t,l,s){
  const p=PL[pk++%200];
  p.m.material.color.setHex(PCOR[t]);
  p.m.visible=true;
  p.m.position.set(x,y,z);
  p.v=[vx,vy,vz];
  p.l=p.L=l;
  p.s=s;
  p.t=t;
}
const sparks=(x,y,z,n)=>{
  for(let i=0;i<Math.min(8,n|0);i++)fx(x,y,z,(rnd()-.5)*9,2+rnd()*5,(rnd()-.5)*9,3,.3,.16)
};
const MK=new T.InstancedMesh(new T.PlaneGeometry(.5,1).rotateX(-PI/2),new T.MeshBasicMaterial({
  color:0x2b1d13,transparent:true,opacity:.62,polygonOffset:true,polygonOffsetFactor:-2
}),360),mks=[],dm=new T.Object3D(),UP=new T.Vector3(0,1,0),q2=new T.Quaternion();
MK.frustumCulled=false;
sc.add(MK);
let mi=0;

function mark(x,z,h,len){
  const gx=(H(x+.6,z)-H(x-.6,z))/1.2,gz=(H(x,z+.6)-H(x,z-.6))/1.2,q=new T.Quaternion().setFromUnitVectors(UP,new T.Vector3(-gx,1,-gz).normalize());
  q.multiply(q2.setFromAxisAngle(UP,h));
  mks[mi++%360]={
    x,y:H(x,z)+.1,z,q,len,l:6
  }
}
