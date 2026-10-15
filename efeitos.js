// ============================================================
// EFEITOS: partículas (poeira, fogo, faíscas) e rastros de pneu que somem.
// ============================================================

// effects
const PM=[0xe2b97a,0xffa020,0x707070,0xfff0a0].map(c=>new T.MeshBasicMaterial({
  color:c
})),pg=new T.IcosahedronGeometry(1,0),PL=[];
let pk=0;
for(let i=0;i<160;i++){
  const m=new T.Mesh(pg,PM[0]);
  m.visible=false;
  sc.add(m);
  PL.push({
    m,l:0,L:1,v:[0,0,0],s:1,t:0
  })
}

function fx(x,y,z,vx,vy,vz,t,l,s){
  const p=PL[pk++%160];
  p.m.material=PM[t];
  p.m.visible=true;
  p.m.position.set(x,y,z);
  p.v=[vx,vy,vz];
  p.l=p.L=l;
  p.s=s;
  p.t=t
}
const sparks=(x,y,z,n)=>{
  for(let i=0;i<Math.min(8,n|0);i++)fx(x,y,z,(rnd()-.5)*9,2+rnd()*5,(rnd()-.5)*9,3,.3,.16)
};
const MK=new T.InstancedMesh(new T.PlaneGeometry(.38,1).rotateX(-PI/2),new T.MeshBasicMaterial({
  color:0x5e3f22,transparent:true,opacity:.5,polygonOffset:true,polygonOffsetFactor:-2
}),280),mks=[],dm=new T.Object3D(),UP=new T.Vector3(0,1,0),q2=new T.Quaternion();
MK.frustumCulled=false;
sc.add(MK);
let mi=0;

function mark(x,z,h,len){
  const gx=(H(x+.6,z)-H(x-.6,z))/1.2,gz=(H(x,z+.6)-H(x,z-.6))/1.2,q=new T.Quaternion().setFromUnitVectors(UP,new T.Vector3(-gx,1,-gz).normalize());
  q.multiply(q2.setFromAxisAngle(UP,h));
  mks[mi++%280]={
    x,y:H(x,z)+.1,z,q,len,l:6
  }
}
