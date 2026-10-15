// ============================================================
// CENÁRIO: ferro-velho — contêineres, carros empilhados, barreiras,
// guindastes, outdoors e prédios ao longe, tudo sob neblina de poeira.
// ============================================================

function texCanvas(w,h,desenha){
  const c=document.createElement('canvas');
  c.width=w;c.height=h;
  desenha(c.getContext('2d'),w,h);
  const t=new T.CanvasTexture(c);
  t.wrapS=t.wrapT=T.RepeatWrapping;
  t.anisotropy=4;
  return t;
}
const css=h=>'#'+h.toString(16).padStart(6,'0');
const solido=(x,z,hx,hz)=>W.push([x-hx,z-hz,x+hx,z+hz]);          // colisão (caixa)
const plano=(x,z)=>Math.abs(H(x+3,z)-H(x-3,z))<1.2&&Math.abs(H(x,z+3)-H(x,z-3))<1.2&&H(x,z)<2.2;
const achaLugar=m=>{                                              // sorteia um lugar livre e plano
  for(let j=0;j<300;j++){
    const x=(rnd()-.5)*190,z=(rnd()-.5)*190;
    if(free(x,z,m)&&plano(x,z))return[x,z];
  }
  return null;
};

// chão infinito além do muro (mesma cor da areia)
{
  const m=new T.Mesh(new T.PlaneGeometry(1400,1400).rotateX(-PI/2),new T.MeshPhongMaterial({color:0x86603f,shininess:0,flatShading:true}));
  m.position.y=-.15;
  sc.add(m);
}

// ---- contêineres (alguns empilhados) ----
const CONT_COR=[0xa6452d,0x2f5f8f,0xc7742a,0x3d6b4f,0x7a7f86,0x8a2f2f];
const contMat=CONT_COR.map(c=>new T.MeshPhongMaterial({
  map:texCanvas(64,64,(g,w,h)=>{
    g.fillStyle=css(c);g.fillRect(0,0,w,h);
    g.fillStyle='rgba(0,0,0,.25)';
    for(let x=2;x<w;x+=8)g.fillRect(x,0,3,h);                 // ondulado
    g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,w,3);g.fillRect(0,h-3,w,3);
    g.fillStyle='rgba(255,255,255,.08)';
    for(let i=0;i<10;i++)g.fillRect(rnd()*w,rnd()*h,6,2);      // desgaste
  }),shininess:6
}));
const GEO_CONT=new T.BoxGeometry(6.2,2.6,2.5);
for(let i=0;i<11;i++){
  const p=achaLugar(8);if(!p)continue;
  const[x,z]=p,girado=rnd()<.5,mat=contMat[(rnd()*contMat.length)|0];
  const niveis=rnd()<.3?2:1;
  for(let n=0;n<niveis;n++){
    const m=new T.Mesh(GEO_CONT,contMat[n?(rnd()*contMat.length)|0:contMat.indexOf(mat)]);
    m.position.set(x+(n?(rnd()-.5)*.4:0),H(x,z)+1.25+n*2.6,z);
    m.rotation.y=(girado?PI/2:0)+(n?(rnd()-.5)*.1:0);
    m.castShadow=true;
    sc.add(m);
  }
  solido(x,z,girado?1.35:3.2,girado?3.2:1.35);
}

// ---- pilhas de carros destruídos ----
const WR_COR=[0x7a3b28,0x4d5560,0x8a7650,0x3a4a3d,0x6d6d6d,0x5a2f2f];
function carcaca(g,col,y,yaw,dx,dz){
  const m=new T.Group();
  const c1=new T.Mesh(new T.BoxGeometry(4.3,.85,1.9),M(col));
  const c2=new T.Mesh(new T.BoxGeometry(2.2,.7,1.65),M(col));
  const v=new T.Mesh(new T.BoxGeometry(2.0,.35,1.7),M(0x1a1a1a));
  c1.position.y=.45;
  c2.position.set(-.25,1.15,0);
  v.position.set(-.25,1.15,0);
  m.add(c1,c2,v);
  m.position.set(dx,y,dz);
  m.rotation.set(0,yaw,(rnd()-.5)*.08);
  m.traverse(o=>o.castShadow=true);
  g.add(m);
}
for(let i=0;i<6;i++){
  const p=achaLugar(8);if(!p)continue;
  const[x,z]=p,g=new T.Group(),girado=rnd()<.5,n=2+((rnd()*3)|0),base=girado?PI/2:0;
  for(let k=0;k<n;k++)carcaca(g,WR_COR[(rnd()*6)|0],k*.95,base+(rnd()-.5)*.25,(rnd()-.5)*.5,(rnd()-.5)*.4);
  g.position.set(x,H(x,z)-.05,z);
  sc.add(g);
  solido(x,z,girado?1.3:2.5,girado?2.5:1.3);
}

// ---- barreiras de concreto ----
const GEO_BAR=new T.BoxGeometry(3,1.1,.7);
for(let i=0;i<14;i++){
  const p=achaLugar(6);if(!p)continue;
  const[x,z]=p,girado=rnd()<.5,m=new T.Mesh(GEO_BAR,M(0xb8b2a6));
  m.position.set(x,H(x,z)+.5,z);
  m.rotation.y=girado?PI/2:0;
  m.castShadow=true;
  sc.add(m);
  solido(x,z,girado?.45:1.6,girado?1.6:.45);
}

// ---- guindastes (ficam do lado de fora do muro, como silhueta) ----
const LATT=texCanvas(64,64,(g,w,h)=>{
  g.strokeStyle='#e2b422';g.lineWidth=5;
  g.strokeRect(2,2,w-4,h-4);
  g.beginPath();g.moveTo(0,0);g.lineTo(w,h);g.moveTo(w,0);g.lineTo(0,h);g.stroke();
});
function matTreliça(rx,ry){
  const t=LATT.clone();
  t.needsUpdate=true;
  t.repeat.set(rx,ry);
  return new T.MeshPhongMaterial({map:t,transparent:true,alphaTest:.5,side:T.DoubleSide,shininess:0});
}
function guindaste(x,z,h,yaw){
  const g=new T.Group();
  const peca=(geo,mat,px,py,pz)=>{const m=new T.Mesh(geo,mat);m.position.set(px,py,pz);g.add(m);return m};
  peca(new T.BoxGeometry(1.8,h,1.8),matTreliça(1,h/3.5),0,h/2,0);                 // torre
  peca(new T.BoxGeometry(34,1.6,1.6),matTreliça(34/3.2,1),10,h+.8,0);              // lança
  peca(new T.BoxGeometry(10,1.4,1.4),matTreliça(3,1),-9,h+.8,0);                   // contra-lança
  peca(new T.BoxGeometry(3,2.6,2.4),M(0x777777),-13,h+1,0);                        // contrapeso
  peca(new T.BoxGeometry(2.2,2.2,2.2),M(0xd9731e),1.5,h-1.2,0);                    // cabine
  peca(new T.CylinderGeometry(.08,.08,12,5),M(0x222222),22,h-5.2,0);               // cabo
  peca(new T.BoxGeometry(3.8,1.0,1.8),M(0x2a2a2a),22,h-11.5,0);                    // carro pendurado
  g.position.set(x,0,z);
  g.rotation.y=yaw;
  sc.add(g);
}
[[.3,150,46],[1.5,165,52],[2.7,155,44],[3.9,170,50],[5.2,150,42]].forEach(([a,r,h])=>
  guindaste(Math.sin(a)*r,Math.cos(a)*r,h,rnd()*PI));

// ---- prédios ao longe (silhueta em neblina) ----
const JANELAS=texCanvas(64,64,(g,w,h)=>{
  g.fillStyle='#8f867b';g.fillRect(0,0,w,h);
  g.fillStyle='#3b3a3d';
  for(let y=6;y<h;y+=16)for(let x=6;x<w;x+=16)g.fillRect(x,y,9,8);
});
for(let i=0;i<16;i++){
  const a=i/16*PI*2+(rnd()-.5)*.25,r=148+rnd()*40,w=14+rnd()*16,d=14+rnd()*14,h=16+rnd()*28;
  const t=JANELAS.clone();
  t.needsUpdate=true;
  t.repeat.set(w/8,h/8);
  const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshPhongMaterial({map:t,shininess:0}));
  m.position.set(Math.sin(a)*r,h/2,Math.cos(a)*r);
  m.rotation.y=a;
  sc.add(m);
}

// ---- outdoors "FERRO-VELHO 24" ----
function outdoor(a){
  const r=138,x=Math.sin(a)*r,z=Math.cos(a)*r,g=new T.Group();
  const tex=texCanvas(512,192,(c,w,h)=>{
    c.fillStyle='#24180f';c.fillRect(0,0,w,h);
    c.strokeStyle='#ff7a1a';c.lineWidth=10;c.strokeRect(8,8,w-16,h-16);
    c.fillStyle='#ffb04d';c.font='bold 74px Rajdhani,Impact,sans-serif';c.textAlign='center';
    c.fillText('FERRO-VELHO 24',w/2,105);
    c.fillStyle='#f1e3cf';c.font='bold 30px Rajdhani,system-ui,sans-serif';
    c.fillText('PEÇAS • DESMANCHE • ARENA',w/2,150);
  });
  tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;
  const placa=new T.Mesh(new T.PlaneGeometry(16,6),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));
  placa.position.y=12;
  g.add(placa);
  [-6,6].forEach(px=>{const p=new T.Mesh(new T.BoxGeometry(.7,12,.7),M(0x2a2420));p.position.set(px,6,-.2);g.add(p)});
  [-5,0,5].forEach(px=>{const l=new T.Mesh(new T.BoxGeometry(.9,.4,.9),new T.MeshBasicMaterial({color:0xfff0c0}));l.position.set(px,15.4,.6);g.add(l)});
  g.position.set(x,0,z);
  g.rotation.y=Math.atan2(-x,-z);
  sc.add(g);
}
[.6,2.3,4.3].forEach(outdoor);
