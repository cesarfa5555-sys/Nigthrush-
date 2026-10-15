// ============================================================
// MUNDO: terreno com lombadas, montanhas, prédios, cactos/pedras/barris e power-ups.
// ============================================================

// terrain
const bl=[[-45,-30,26,18],[50,35,22,22],[-10,60,20,16],[55,-50,18,18]];

function H(x,z){
  let h=2.4*Math.sin(x*.045+1)*Math.cos(z*.05)+1.1*Math.sin(x*.12+z*.09)+.45*Math.sin(z*.23-x*.17)+Math.max(0,Math.sin(x*.03+z*.04)*3),m=1;
  for(const b of bl){
    const d=Math.hypot(Math.max(Math.abs(x-b[0])-b[2]/2,0),Math.max(Math.abs(z-b[1])-b[3]/2,0));
    m=Math.min(m,cl((d-3)/9,0,1))
  }
  return h*m*cl((100-Math.hypot(x,z))/14,0,1)   // plano perto do muro
}
{
  const g=new T.PlaneGeometry(260,260,130,130);
  g.rotateX(-PI/2);
  const p=g.attributes.position,c=new Float32Array(p.count*3),k=new T.Color();
  for(let i=0;i<p.count;i++){
    const h=H(p.getX(i),p.getZ(i)),n=rnd()*.05,t=cl(h/5+.5,0,1);
    p.setY(i,h);
    const borda=cl((Math.hypot(p.getX(i),p.getZ(i))-75)/30,0,1);   // areia mais escura perto do muro
    const sujo=Math.sin(p.getX(i)*.08+1)*Math.sin(p.getZ(i)*.1)>.5?.05:0;   // manchas de terra
    k.setHSL(.075+n*.2,.38-t*.08+borda*.05,.40+t*.10+n-borda*.08-sujo);
    c.set([k.r,k.g,k.b],i*3)
  }
  g.setAttribute('color',new T.BufferAttribute(c,3));
  g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshPhongMaterial({
    vertexColors:true,flatShading:true,shininess:0
  }));
  m.receiveShadow=true;
  sc.add(m)
}
// world objects
const C=[],W=[],roofs=[],SP=[[0,-72],[72,0],[-72,0],[28,76]];   // pontos de nascimento (livres de prédios)

function wall(x0,z0,x1,z1,col){
  W.push([x0,z0,x1,z1]);
  const m=new T.Mesh(new T.BoxGeometry(x1-x0,9,z1-z0),M(col));
  m.position.set((x0+x1)/2,4.5,(z0+z1)/2);
  m.castShadow=m.receiveShadow=true;
  sc.add(m)
}
bl.forEach((b,i)=>{
  const[x,z,w,d]=b,t=1,hw=w/2,hd=d/2,col=[0xd98c5f,0x6fb1c9,0xe0c15a,0xb86fa0][i];
  [[x-hw,z+hd-t,x+hw,z+hd],[x-hw,z-hd,x+hw,z-hd+t],[x+hw-t,z-hd,x+hw,z+hd],[x-hw,z-hd,x-hw+t,z+hd]].forEach((s,k)=>{
    if(k!=i)return wall(...s,col);
    if(k<2){
      wall(s[0],s[1],x-4.5,s[3],col);
      wall(x+4.5,s[1],s[2],s[3],col)
    }else{
      wall(s[0],s[1],s[2],z-4.5,col);
      wall(s[0],z+4.5,s[2],s[3],col)
    }
  });
  const r=new T.Mesh(new T.BoxGeometry(w+1,1,d+1),M(0x6b4a3a));
  r.position.set(x,9.5,z);
  r.castShadow=true;
  sc.add(r);
  roofs.push(r)
});
const free=(x,z,m)=>Math.hypot(x,z)<100&&bl.every(b=>Math.abs(x-b[0])>b[2]/2+m||Math.abs(z-b[1])>b[3]/2+m)&&SP.every(s=>Math.hypot(x-s[0],z-s[1])>14);

function put(mk,n,r){
  for(let i=0,j=0;i<n&&j<400;j++){
    const x=(rnd()-.5)*200,z=(rnd()-.5)*200;
    if(!free(x,z,7))continue;
    i++;
    const m=mk();
    m.position.set(x,H(x,z),z);
    m.rotation.y=rnd()*6;
    m.traverse(o=>o.castShadow=true);
    sc.add(m);
    if(r)C.push({
      x,z,r
    })
  }
}
const cyl=(a,b,h,c,y)=>{
  const m=new T.Mesh(new T.CylinderGeometry(a,b,h,8),M(c));
  m.position.y=y;
  return m
};
put(()=>{
  const g=new T.Group();
  g.add(cyl(.5,.6,4,0x3f9a4a,2));
  const a=cyl(.28,.3,1.6,0x3f9a4a,2.8);
  a.position.x=.9;
  const b=a.clone();
  b.position.set(-.9,2.3,0);
  g.add(a,b);
  return g
},10,1);
put(()=>{
  const m=new T.Mesh(new T.DodecahedronGeometry(1.2+rnd()*1.4,0),M(0xa6896a));
  m.scale.y=.7;
  m.position.y=.5;
  const g=new T.Group();
  g.add(m);
  return g
},22,2);
put(()=>cyl(.6,.6,1.3,0xc0392b,.65),12,.8);
put(()=>{
  const g=new T.Group();
  for(let i=0;i<2;i++){
    const t=new T.Mesh(new T.TorusGeometry(.7,.3,6,12),M(0x222222));
    t.rotation.x=PI/2;
    t.position.y=.3+i*.55;
    g.add(t)
  }
  return g
},14,1);
put(()=>{
  const g=new T.Group();
  g.add(cyl(.5,.42,1.1,0x7f8c8d,.55),cyl(.56,.56,.15,0x555555,1.15));
  return g
},12,.7);
// power-ups
const PU=[[0x39ff6a,'VIDA'],[0x38b6ff,'ESCUDO'],[0xffe14a,'VELOCIDADE'],[0xff3a3a,'DANO x2']],pus=[];
for(let i=0;i<13;i++){
  let x,z;
  if(i<4){
    x=bl[i][0]+(rnd()-.5)*10;
    z=bl[i][1]+(rnd()-.5)*8
  }else do{
    x=(rnd()-.5)*190;
    z=(rnd()-.5)*190
  }while(!free(x,z,3));
  const g=new T.Group(),mt=new T.MeshBasicMaterial(),o=new T.Mesh(new T.OctahedronGeometry(.9),mt),ri=new T.Mesh(new T.TorusGeometry(1.3,.08,6,20),mt),bm=new T.Mesh(new T.CylinderGeometry(.5,.5,5,8,1,true),new T.MeshBasicMaterial({
    transparent:true,opacity:.2,depthWrite:false
  }));
  ri.rotation.x=PI/2;
  bm.position.y=2.5;
  g.add(o,ri,bm);
  sc.add(g);
  pus.push({
    g,mt,bm,x,z,t:0,rs:0,o
  })
}
const setPU=(p,t)=>{
  p.t=t;
  p.mt.color.set(PU[t][0]);
  p.bm.material.color.set(PU[t][0]);
  p.rs=0;
  p.g.visible=true
};
