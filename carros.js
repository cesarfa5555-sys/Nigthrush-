// ============================================================
// CARROS: modelo 3D do carro (rodas, torreta, escudo, nome).
// ============================================================

// ---- geometrias reutilizáveis ----
const WL=[[.95,1.35],[-.95,1.35],[.95,-1.35],[-.95,-1.35]],cars=[];
let P;

// pneu gordinho com ombros arredondados (eixo no X) e rodas em estrela
const PNEU=new T.LatheGeometry([[0,-.21],[.33,-.21],[.42,-.14],[.44,0],[.42,.14],[.33,.21],[0,.21]].map(p=>new T.Vector2(p[0],p[1])),20).rotateZ(PI/2);
const ARO=new T.CylinderGeometry(.27,.27,.46,14).rotateZ(PI/2);
const RAIO1=new T.BoxGeometry(.47,.5,.09),RAIO2=new T.BoxGeometry(.47,.09,.5);

// material brilhante de brinquedo (superfície lisa)
const mg={};
const MG=(c,br=70)=>mg[c+'_'+br]||(mg[c+'_'+br]=new T.MeshPhongMaterial({color:c,shininess:br,specular:0x555555}));

// suaviza as normais (une vértices na mesma posição) -> curvas sem "quinas"
function suave(g){
  g.computeVertexNormals();
  const p=g.attributes.position,n=g.attributes.normal,mapa={};
  const key=i=>Math.round(p.getX(i)*500)+','+Math.round(p.getY(i)*500)+','+Math.round(p.getZ(i)*500);
  for(let i=0;i<p.count;i++){
    const k=key(i),a=mapa[k]||(mapa[k]=[0,0,0]);
    a[0]+=n.getX(i);a[1]+=n.getY(i);a[2]+=n.getZ(i);
  }
  for(let i=0;i<p.count;i++){
    const a=mapa[key(i)],l=Math.hypot(a[0],a[1],a[2])||1;
    n.setXYZ(i,a[0]/l,a[1]/l,a[2]/l);
  }
  return g;
}

// caixa de cantos arredondados (w=largura x, h=altura y, d=comprimento z)
function rbox(w,h,d,r){
  const b=Math.min(.05,w/4,h/4,d/4),W2=w/2-b,H2=h/2-b,rr=Math.min(r,W2,H2);
  const s=new T.Shape();
  s.moveTo(-W2+rr,-H2);s.lineTo(W2-rr,-H2);s.quadraticCurveTo(W2,-H2,W2,-H2+rr);
  s.lineTo(W2,H2-rr);s.quadraticCurveTo(W2,H2,W2-rr,H2);
  s.lineTo(-W2+rr,H2);s.quadraticCurveTo(-W2,H2,-W2,H2-rr);
  s.lineTo(-W2,-H2+rr);s.quadraticCurveTo(-W2,-H2,-W2+rr,-H2);
  const g=new T.ExtrudeGeometry(s,{depth:d-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:5});
  g.translate(0,0,-(d-2*b)/2);
  return suave(g);
}

// perfil lateral (x = frente do carro, y = altura) vira um corpo curvo
function corpoLateral(shape,largura,bs,bt){
  const g=new T.ExtrudeGeometry(shape,{depth:largura,bevelEnabled:true,bevelThickness:bt,bevelSize:bs,bevelSegments:4,curveSegments:10});
  g.rotateY(-PI/2);
  g.translate(largura/2,0,0);
  return suave(g);
}

// carroceria: capô baixo, traseira mais alta, cantos bem redondos
const GEO_CASCO=(()=>{
  const s=new T.Shape();
  s.moveTo(-1.6,.55);s.lineTo(1.6,.55);
  s.quadraticCurveTo(1.95,.55,1.95,.85);
  s.quadraticCurveTo(1.95,1.0,1.6,1.02);
  s.lineTo(-1.5,1.12);
  s.quadraticCurveTo(-1.95,1.12,-1.95,.82);
  s.quadraticCurveTo(-1.95,.55,-1.6,.55);
  return corpoLateral(s,1.3,.12,.3);
})();
// cabine de vidro em formato de gota
const GEO_CABINE=(()=>{
  const s=new T.Shape();
  s.moveTo(-1.15,1.05);
  s.bezierCurveTo(-1.1,1.4,-.9,1.72,-.55,1.76);
  s.lineTo(.35,1.76);
  s.bezierCurveTo(.7,1.74,.85,1.4,1.0,1.05);
  s.lineTo(-1.15,1.05);
  return corpoLateral(s,.9,.1,.3);
})();
const GEO_TETO=rbox(1.45,.14,1.1,.06);
const GEO_FAIXA=rbox(.22,.03,1.1,.01);
const GEO_PARALAMA=new T.SphereGeometry(1,16,8,0,PI*2,0,PI/2);
const GEO_ESFERA=new T.SphereGeometry(1,14,10);
const GEO_GRADE=rbox(.9,.2,.1,.05);
const GEO_ASA=rbox(1.7,.08,.5,.03);
const GEO_POSTE=rbox(.1,.3,.1,.02);
const GEO_ESCAPE=new T.CylinderGeometry(.08,.1,.45,10).rotateX(PI/2);
const GEO_CANO=new T.CylinderGeometry(.11,.14,1.5,12).rotateX(PI/2);
const GEO_BOCA=new T.TorusGeometry(.14,.045,6,12);
const GEO_ANEL=new T.TorusGeometry(.5,.07,8,18).rotateX(PI/2);

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
  const PRETO=0x20242b;
  // adiciona uma peça: geometria, material, posição e (opcional) escala
  const add=(geo,mat,x,y,z,sx=1,sy=1,sz=1,pai=g)=>{
    const m=new T.Mesh(geo,mat);
    m.position.set(x,y,z);
    m.scale.set(sx,sy,sz);
    m.castShadow=true;
    pai.add(m);
    return m;
  };
  const tinta=MG(col);
  add(GEO_CASCO,tinta,0,0,0);                          // carroceria curva
  add(GEO_CABINE,MG(0x16222e,110),0,0,-.1);            // vidros
  add(GEO_TETO,tinta,0,1.9,-.1);                       // teto
  add(GEO_FAIXA,MG(0xffffff),0,1.995,-.1);             // faixa de corrida
  add(GEO_ESFERA,MG(PRETO),0,.5,1.95,.9,.16,.3);       // parachoque da frente
  add(GEO_ESFERA,MG(PRETO),0,.5,-1.95,.9,.16,.3);      // parachoque de trás
  add(GEO_GRADE,MG(PRETO),0,.82,2.04);                 // grade
  [.62,-.62].forEach(x=>{
    add(GEO_ESFERA,new T.MeshBasicMaterial({color:0xfff3b0}),x,.88,1.99,.17,.17,.1);   // faróis redondos
    add(GEO_ESFERA,new T.MeshBasicMaterial({color:0xff2a2a}),x,.9,-2.0,.17,.14,.1);    // lanternas
  });
  [.5,-.5].forEach(x=>add(GEO_ESCAPE,MG(0xdddddd,120),x,.58,-2.12));   // canos de escape
  // aerofólio
  add(GEO_ASA,MG(PRETO),0,1.52,-1.95);
  [.55,-.55].forEach(x=>add(GEO_POSTE,MG(PRETO),x,1.35,-1.92));
  // para-lamas arredondados e rodas
  const wh=WL.map(([x,z])=>{
    add(GEO_PARALAMA,tinta,x*.93,.52,z,.42,.5,.78);
    const p=new T.Group();
    p.position.set(x,.42,z);
    const w=new T.Mesh(PNEU,MG(0x1a1a1a,15));
    w.castShadow=true;
    const aro=MG(0xd8dde3,110);
    w.add(new T.Mesh(ARO,aro),new T.Mesh(RAIO1,aro),new T.Mesh(RAIO2,aro));
    p.add(w);
    g.add(p);
    return{p,w};
  });
  // torreta: cúpula + anel colorido + cano com boca
  const tg=new T.Group();
  tg.position.set(0,2.0,.1);
  add(GEO_PARALAMA,MG(0x2b2f36),0,0,0,.5,.35,.5,tg);
  add(GEO_ANEL,tinta,0,.02,0,1,1,1,tg);
  const bar=add(GEO_CANO,MG(0x444b55,90),0,.18,.95,1,1,1,tg);
  add(GEO_BOCA,MG(0x888f99,90),0,0,.75,1,1,1,bar);
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
