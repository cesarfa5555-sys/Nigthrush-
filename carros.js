// ============================================================
// CARROS: modelo 3D estilo Porsche 911 (rodas, torreta, escudo, nome).
// ============================================================

const WL=[[.95,1.35],[-.95,1.35],[.95,-1.35],[-.95,-1.35]],cars=[];
let P;

// ---- pneus e rodas ----
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

// ---- peças do 911 ----
// carroceria baixa: nariz arredondado, capô inclinado, traseira redonda
const GEO_CASCO=(()=>{
  const s=new T.Shape();
  s.moveTo(-1.7,.52);s.lineTo(1.7,.52);
  s.quadraticCurveTo(2.15,.52,2.15,.8);
  s.quadraticCurveTo(2.13,1.0,1.7,1.03);
  s.lineTo(.9,1.1);
  s.lineTo(-1.1,1.12);
  s.quadraticCurveTo(-2.1,1.1,-2.12,.8);
  s.quadraticCurveTo(-2.12,.52,-1.7,.52);
  return corpoLateral(s,1.3,.12,.3);
})();
// cabine "fastback": o teto desce numa curva só até a traseira
const GEO_CABINE=(()=>{
  const s=new T.Shape();
  s.moveTo(1.05,1.05);
  s.bezierCurveTo(.8,1.4,.45,1.75,-.05,1.78);
  s.bezierCurveTo(-.9,1.8,-1.5,1.35,-1.85,1.02);
  s.lineTo(1.05,1.05);
  return corpoLateral(s,.86,.1,.3);
})();
// capa do teto (cor da carroceria) acompanhando a curva
const GEO_TETO=(()=>{
  const s=new T.Shape(),o=.12;
  s.moveTo(.62,1.54+o);
  s.bezierCurveTo(.45,1.74+o,.2,1.81+o,-.05,1.81+o);
  s.bezierCurveTo(-.8,1.82+o,-1.35,1.5+o,-1.6,1.12+o);
  s.lineTo(-1.55,1.1+o);
  s.bezierCurveTo(-1.3,1.4+o,-.8,1.67+o,-.05,1.67+o);
  s.bezierCurveTo(.2,1.67+o,.45,1.6+o,.62,1.54+o);
  return corpoLateral(s,.95,.06,.3);
})();
const GEO_PARALAMA=new T.SphereGeometry(1,16,8,0,PI*2,0,PI/2);
const GEO_ESFERA=new T.SphereGeometry(1,14,10);
const GEO_GRADE=rbox(1.0,.16,.1,.05),GEO_VENT=rbox(.05,.16,.55,.02);
const GEO_PATO=rbox(1.5,.06,.45,.03);                       // rabo de pato
const GEO_ASA=rbox(1.7,.08,.7,.04),GEO_POSTE=rbox(.1,.3,.1,.02);   // asa "baleia" (Turbo)
const GEO_LUZ=rbox(1.5,.07,.06,.02),GEO_PLACA=rbox(.55,.2,.05,.02);
const GEO_ESCAPE=new T.CylinderGeometry(.08,.1,.45,10).rotateX(PI/2);
const GEO_CANO=new T.CylinderGeometry(.11,.14,1.5,12).rotateX(PI/2);
const GEO_BOCA=new T.TorusGeometry(.14,.045,6,12);
const GEO_ANEL=new T.TorusGeometry(.5,.07,8,18).rotateX(PI/2);
const SOFT_Y=new T.SpriteMaterial({map:SOFT,color:0xfff0c0,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false});
const SOFT_R=new T.SpriteMaterial({map:SOFT,color:0xff2a2a,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false});
const MAT_FARO=new T.MeshBasicMaterial({color:0xfff3b0}),MAT_LANT=new T.MeshBasicMaterial({color:0xff2a2a});

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
  s.scale.set(3.2,.8,1);
  s.position.y=3.1;
  s.renderOrder=9;
  return s
}

// tipo 0 = 911 com rabo de pato, tipo 1 = 911 Turbo com asa grande
function mkCar(name,col,me,tipo=0){
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
  const brilho=(mat,x,y,z,s)=>{const sp=new T.Sprite(mat);sp.position.set(x,y,z);sp.scale.set(s,s,1);g.add(sp)};
  const tinta=MG(col),vidro=MG(0x16222e,110),preto=MG(PRETO);
  add(GEO_CASCO,tinta,0,0,0);                              // carroceria
  add(GEO_CABINE,vidro,0,0,0);                             // vidros
  add(GEO_TETO,tinta,0,0,0);                               // teto
  [.7,-.7].forEach(x=>{                                    // faróis redondos nos paralamas
    add(GEO_ESFERA,tinta,x,1.14,1.7,.27,.2,.34);
    add(GEO_ESFERA,MAT_FARO,x,1.17,1.98,.19,.19,.09);
    brilho(SOFT_Y,x,1.17,2.15,1.5);
  });
  [.9,-.9].forEach(x=>add(GEO_ESFERA,tinta,x,1.22,.7,.1,.09,.13));      // retrovisores redondos
  [.97,-.97].forEach(x=>add(GEO_VENT,preto,x,.82,-1.15));               // entradas de ar traseiras
  add(GEO_GRADE,preto,0,.62,2.27);                                      // entrada de ar dianteira
  add(GEO_ESFERA,preto,0,.5,2.1,.95,.15,.28);                           // parachoques
  add(GEO_ESFERA,preto,0,.5,-2.05,.95,.15,.28);
  if(tipo==0){
    add(GEO_PATO,tinta,0,1.27,-2.0).rotation.x=.2;                      // rabo de pato
  }else{
    add(GEO_ASA,preto,0,1.38,-2.0).rotation.x=.12;                      // asa baleia
    [.6,-.6].forEach(x=>add(GEO_POSTE,preto,x,1.22,-1.95));
  }
  add(GEO_LUZ,MAT_LANT,0,.98,-2.22);                                    // barra de luz traseira
  brilho(SOFT_R,0,.98,-2.35,2.4);
  add(GEO_PLACA,MG(0xf2f2f2),0,.68,-2.23);
  [.45,-.45].forEach(x=>add(GEO_ESCAPE,MG(0xdddddd,120),x,.55,-2.15));  // escapamentos
  // para-lamas (traseiros mais largos, como no 911) e rodas
  const wh=WL.map(([x,z])=>{
    if(z>0)add(GEO_PARALAMA,tinta,x*.93,.52,z,.42,.5,.75);
    else add(GEO_PARALAMA,tinta,x*.93,.52,z,.47,.55,.85);
    const p=new T.Group();
    p.position.set(x,.42,z);
    const w=new T.Mesh(PNEU,MG(0x1a1a1a,15));
    w.castShadow=true;
    w.add(new T.Mesh(ARO,MG(0x2e3238,90)));
    const raio=MG(0xb7bec7,110);
    w.add(new T.Mesh(RAIO1,raio),new T.Mesh(RAIO2,raio));
    p.add(w);
    g.add(p);
    return{p,w};
  });
  // torreta sobre o teto: cúpula + anel colorido + cano com boca
  const tg=new T.Group();
  tg.position.set(0,2.0,-.05);
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
