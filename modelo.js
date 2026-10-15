// ============================================================
// MODELO: carrega o Porsche 911 GT3 RSR (.glb) e prepara o carro do jogo.
//
// Coloque o arquivo .glb na MESMA pasta do index.html.
// Se o nome do seu arquivo for outro, troque aqui:
// ============================================================
const MODELO_ARQUIVO='2022_porche_911_gt3_rsr.glb';
const COMPRIMENTO_CARRO=4.9;   // tamanho do carro no jogo (o modelo é redimensionado)
let MODELO=null;               // fica null se o .glb não carregar (usa o carro padrão)

// carrega o arquivo e chama pronto(true/false) (sempre de forma assíncrona)
function carregarModelo(pronto){
  let feito=false;
  const fim=ok=>{
    if(feito)return;
    feito=true;
    clearTimeout(limite);
    setTimeout(()=>pronto(ok),0);
  };
  const limite=setTimeout(()=>fim(false),25000);   // desiste depois de 25 s
  try{
    if(!T.GLTFLoader)throw new Error('GLTFLoader não carregou (sem internet?)');
    new T.GLTFLoader().load(MODELO_ARQUIVO,
      gltf=>{
        try{MODELO=prepararModelo(gltf);fim(true)}
        catch(e){console.error(e);fim(false)}
      },
      xhr=>{if(xhr.total)$('lt').textContent='Carregando carro… '+Math.round(xhr.loaded/xhr.total*100)+'%'},
      err=>{console.error(err);fim(false)}
    );
  }catch(e){console.error(e);fim(false)}
}

// junta várias geometrias numa só (menos chamadas de desenho por carro)
function juntarGeos(geos){
  let nv=0,ni=0;
  geos.forEach(g=>{
    nv+=g.attributes.position.count;
    ni+=g.index?g.index.count:g.attributes.position.count;
  });
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
  let vo=0,io=0;
  geos.forEach(g=>{
    const p=g.attributes.position,n=g.attributes.normal,c=p.count;
    for(let i=0;i<c;i++){
      pos[(vo+i)*3]=p.getX(i);pos[(vo+i)*3+1]=p.getY(i);pos[(vo+i)*3+2]=p.getZ(i);
      nor[(vo+i)*3]=n.getX(i);nor[(vo+i)*3+1]=n.getY(i);nor[(vo+i)*3+2]=n.getZ(i);
    }
    if(g.index){
      for(let i=0;i<g.index.count;i++)idx[io++]=g.index.getX(i)+vo;
    }else{
      for(let i=0;i<c;i++)idx[io++]=vo+i;
    }
    vo+=c;
  });
  const r=new T.BufferGeometry();
  r.setAttribute('position',new T.BufferAttribute(pos,3));
  r.setAttribute('normal',new T.BufferAttribute(nor,3));
  r.setIndex(new T.BufferAttribute(idx,1));
  return r;
}

// converte os materiais do .glb para materiais leves (Phong)
function matGLB(o){
  const n=o.name,c=o.color?o.color.clone():new T.Color(1,1,1);
  if(n=='Mesheswindows21Mtl')return new T.MeshPhongMaterial({color:0x0d1620,transparent:true,opacity:.55,shininess:120,specular:0x888888,depthWrite:false,side:T.DoubleSide});
  if(n=='Meshesneon11Mtl')return new T.MeshBasicMaterial({color:0xfff3c0});   // faróis
  if(n=='Meshpart1Mtl')return new T.MeshBasicMaterial({color:0xff2a2a});      // lanternas
  if(c.r+c.g+c.b<.06)c.setHex(0x202226);                                       // preto puro vira cinza escuro
  return new T.MeshPhongMaterial({color:c,shininess:60,specular:0x333333,side:T.DoubleSide});
}

// tinta de cada carro (a cor do jogador/bot)
const _tintas={};
const matTinta=c=>_tintas[c]||(_tintas[c]=new T.MeshPhongMaterial({color:c,shininess:110,specular:0x999999,side:T.DoubleSide}));

// "assa" as transformações, centraliza no chão, redimensiona e separa as rodas
function prepararModelo(gltf){
  const raiz=gltf.scene;
  raiz.updateMatrixWorld(true);
  const lista=[],caixa=new T.Box3();
  raiz.traverse(o=>{
    if(!o.isMesh)return;
    const g=o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);          // aplica a rotação do nó (Z-up -> Y-up)
    g.computeBoundingBox();
    caixa.union(g.boundingBox);
    lista.push({g,orig:o.material});
  });
  const S=COMPRIMENTO_CARRO/(caixa.max.z-caixa.min.z);
  const cx=(caixa.min.x+caixa.max.x)/2,cz=(caixa.min.z+caixa.max.z)/2;
  const grupos={},rodas=[];
  lista.forEach(({g,orig})=>{
    g.translate(-cx,-caixa.min.y,-cz);
    g.scale(S,S,S);
    if(orig.name=='Meshesrim191Mtl'){       // rodas: cada uma gira em torno do próprio centro
      g.computeBoundingBox();
      const c=new T.Vector3();
      g.boundingBox.getCenter(c);
      g.translate(-c.x,-c.y,-c.z);
      rodas.push({geo:g,x:c.x,y:c.y,z:c.z,mat:matGLB(orig)});
    }else{
      (grupos[orig.name]||(grupos[orig.name]={geos:[],orig})).geos.push(g);
    }
  });
  const corpo=Object.keys(grupos).map(n=>{
    const gr=grupos[n],tinta=n=='Meshesbeat1Mtl';     // material da pintura da carroceria
    return{geo:juntarGeos(gr.geos),paint:tinta,mat:tinta?null:matGLB(gr.orig)};
  });
  return{corpo,rodas,wr:rodas.length?rodas[0].y:.38};
}

// coloca o carro .glb dentro do grupo g e devolve as rodas [{p:pivô, w:roda}]
function montaGLB(g,col){
  MODELO.corpo.forEach(p=>{
    const m=new T.Mesh(p.geo,p.paint?matTinta(col):p.mat);
    m.castShadow=p.paint;                    // só a pintura projeta sombra (mais leve)
    g.add(m);
  });
  const wh=[];
  MODELO.rodas.forEach(r=>{
    const pv=new T.Group();
    pv.position.set(r.x,r.y,r.z);
    pv.add(new T.Mesh(r.geo,r.mat));
    g.add(pv);
    wh[(r.z>0?0:2)+(r.x>0?0:1)]={p:pv,w:pv.children[0]};   // 0 FE, 1 FD, 2 TE, 3 TD
  });
  return wh;
}
