// ============================================================
// MURO: muro velho de areia em volta do mapa, com buracos de verdade.
//
// O muro é feito de "tijolos" (colunas x fileiras). Cada tijolo existe de
// verdade nos dados (muroSolido[coluna][fileira]), então o buraco que você
// vê é o mesmo que o carro e a bala enfrentam.
//  - Os buracos são abertos por "mordidas" aleatórias, com bordas irregulares.
//  - Buracos no chão (fileiras 0 e 1) dão passagem pros carros.
//  - Buracos no alto são janelas: só as balas passam.
//  - O topo do muro tem uma "coroa" bem mais grossa que o corpo.
//  - Do lado de fora há um corredor e um muro externo fechado.
// ============================================================

const MN=270;                 // colunas ao redor do círculo
const MR=104;                 // raio do muro
const MT=3.2;                 // espessura do corpo
const MROWS=6;                // fileiras do corpo (a coroa é a fileira extra, índice MROWS)
const MRH=1.15;               // altura de cada fileira
const MDT=PI*2/MN;            // ângulo de cada coluna
const MIN=MR-MT/2, MOUT=MR+MT/2;
const MEXT=123;               // face interna do muro externo (fechado)

const muroSolido=[];
for(let c=0;c<MN;c++)muroSolido.push(new Array(MROWS+1).fill(true));

// 1) topo gasto: cada coluna tem uma altura diferente
{
  const ph=rnd()*6;
  for(let c=0;c<MN;c++){
    const x=Math.sin(c*.11+ph)*.8+Math.sin(c*.37)*.6+(rnd()-.5)*.8;
    const alt=MROWS+1-Math.floor(Math.abs(x));   // MROWS+1 = muro inteiro com coroa
    for(let r=alt;r<=MROWS;r++)muroSolido[c][r]=false;
    if(alt==MROWS+1&&rnd()<.14)muroSolido[c][MROWS]=false;   // coroa quebrada
  }
}

// 2) mordida: abre um buraco irregular andando ao acaso a partir de um ponto
function muroMorder(cells,passos){
  for(let k=0;k<passos;k++){
    const o=cells[(rnd()*cells.length)|0];
    const d=[[1,0],[-1,0],[1,0],[-1,0],[0,1],[0,-1]][(rnd()*6)|0];
    const c=(o[0]+d[0]+MN)%MN,r=o[1]+d[1];
    if(r>=0&&r<=MROWS)cells.push([c,r]);
  }
  cells.forEach(p=>muroSolido[p[0]][p[1]]=false);
}

// 6 passagens no chão (largura mínima de 3 colunas ≈ 7 m) com topo irregular
for(let k=0;k<6;k++){
  const c0=Math.floor(k*MN/6+(rnd()-.5)*30+MN)%MN,cells=[];
  for(let d=-1;d<=1;d++)for(let r=0;r<2;r++)cells.push([(c0+d+MN)%MN,r]);
  muroMorder(cells,10+((rnd()*14)|0));
}
// 16 janelas no alto (só as balas passam)
for(let k=0;k<16;k++){
  const c0=(rnd()*MN)|0,r0=2+((rnd()*3)|0);
  muroMorder([[c0,r0]],6+((rnd()*10)|0));
}

// 3) desenha todos os tijolos que sobraram (uma única malha instanciada)
{
  let n=0;
  for(const col of muroSolido)for(const s of col)if(s)n++;
  const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshPhongMaterial({flatShading:true,shininess:0}),n);
  const d=new T.Object3D(),cor=new T.Color();
  let k=0;
  for(let c=0;c<MN;c++){
    const a=(c+.5)*MDT;
    for(let r=0;r<=MROWS;r++){
      if(!muroSolido[c][r])continue;
      const topo=r==MROWS;
      const esp=topo?MT*1.8:MT*(.92+rnd()*.16);          // coroa bem mais grossa
      const alt=topo?1.7:MRH*(.92+rnd()*.12);
      const y=topo?MROWS*MRH+.85:r*MRH+MRH/2;
      const rad=MR+(rnd()-.5)*.25;
      d.position.set(Math.cos(a)*rad,y-.05,Math.sin(a)*rad);
      d.rotation.set(0,-a-PI/2+(rnd()-.5)*.06,(rnd()-.5)*.03);
      d.scale.set(MDT*MR*(topo?1.15:1+(rnd()-.5)*.06),alt,esp);
      d.updateMatrix();
      mesh.setMatrixAt(k,d.matrix);
      cor.setHSL(.095+rnd()*.015,.42+rnd()*.14,(topo?.68:.5+r*.012)+(rnd()-.5)*.08);
      mesh.setColorAt(k,cor);
      k++;
    }
  }
  mesh.instanceMatrix.needsUpdate=true;
  if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  mesh.castShadow=mesh.receiveShadow=true;
  mesh.frustumCulled=false;
  sc.add(mesh);
}

// 4) muro externo fechado (também com coroa grossa no topo)
{
  const perfil=[[MEXT,-1],[MEXT,8.4],[MEXT-1.4,8.6],[MEXT-1.4,10.2],[MEXT+5,10.2],[MEXT+5,-1]].map(p=>new T.Vector2(p[0],p[1]));
  const m=new T.Mesh(new T.LatheGeometry(perfil,72),new T.MeshPhongMaterial({color:0xcfa86c,flatShading:true,shininess:0,side:T.DoubleSide}));
  m.receiveShadow=true;
  sc.add(m);
}

function muroColuna(ang){
  return ((Math.floor(ang/MDT)%MN)+MN)%MN;
}

// colisão do carro com o muro (chamada a cada frame em drive)
function muroCarro(c){
  const rho=Math.hypot(c.x,c.z);
  if(rho>MEXT-1.7){
    bump(c,-c.x/rho,-c.z/rho,rho-(MEXT-1.7));
    return;
  }
  if(rho>MIN-1.7&&rho<MOUT+1.7){
    const a=Math.atan2(c.z,c.x),dl=1.2/rho;
    const c0=muroColuna(a-dl),c1=muroColuna(a+dl);
    let solido=false;
    for(let k=c0;;k=(k+1)%MN){
      if(muroSolido[k][0]||muroSolido[k][1])solido=true;
      if(k==c1)break;
    }
    if(solido){
      if(rho<MR)bump(c,-c.x/rho,-c.z/rho,rho-(MIN-1.7));
      else bump(c,c.x/rho,c.z/rho,(MOUT+1.7)-rho);
    }
  }
}

// a bala bateu no muro? (passa pelos buracos)
function muroTiro(b){
  const rho=Math.hypot(b.x,b.z);
  if(rho>MEXT-.3)return true;
  if(rho<MIN||rho>MOUT)return false;
  const linha=Math.floor((b.y-H(b.x,b.z)+.25)/MRH);
  if(linha<0||linha>MROWS)return false;
  return muroSolido[muroColuna(Math.atan2(b.z,b.x))][linha];
}
