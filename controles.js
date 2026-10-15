// ============================================================
// CONTROLES: joystick de direção, botões (acelerar, freio, ré),
// botão redondo de tiro/mira e teclado.
//
// Cada dedo fica "preso" ao controle em que encostou primeiro
// (tabela `toques`). Assim um dedo nunca mexe no controle de outro.
// ============================================================

const sL={x:0,y:0,on:0};   // joystick de direção (esquerda)
const sR={x:0,y:0,on:0};   // botão de tiro/mira (direita)
let setas=0;               // 1 = direção por setas na tela
try{setas=+localStorage.getItem('nr_s')||0}catch(e){}
const pd={g:0,b:0,r:0,l:0,rt:0};    // acelerar, freio, ré
const K={};                // teclado
const toques={};           // id do dedo -> controle que ele usa

const ctl=$('ctl'),baseE=$('sbase'),knobE=$('sknob'),fireE=$('pf'),fireK=$('pfk');
const BTN={gas:$('pg'),brake:$('pb'),rev:$('pr'),left:$('sl'),right:$('sr')};
const PD_KEY={gas:'g',brake:'b',rev:'r',left:'l',right:'rt'};

// distância do ponto (x,y) até o controle (0 = dentro)
function distControle(k,x,y){
  if(k=='fire'){
    const f=fireE.getBoundingClientRect();
    return Math.max(0,Math.hypot(x-(f.left+f.width/2),y-(f.top+f.height/2))-f.width/2);
  }
  const r=BTN[k].getBoundingClientRect();
  return Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom));
}

// qual controle o dedo pegou? (o mais próximo, até 10px de folga)
function achaControle(x,y){
  let melhor=null,md=10;
  for(const k of['gas','brake','rev','fire','left','right']){
    if((k=='left'||k=='right')&&!setas)continue;
    const d=distControle(k,x,y);
    if(d<md){md=d;melhor=k}
  }
  if(melhor)return melhor;
  return(x<innerWidth*.5&&!setas)?'steer':null;
}

function pega(id,k,x,y){
  const o={k,ox:x,oy:y};
  toques[id]=o;
  if(k=='steer'){
    sL.on=1;
    baseE.style.display='block';
    baseE.style.left=(x-55)+'px';
    baseE.style.top=(y-55)+'px';
    move(o,x,y);
  }else if(k=='fire'){
    const f=fireE.getBoundingClientRect();
    o.ox=f.left+f.width/2;
    o.oy=f.top+f.height/2;
    sR.on=1;
    fireE.classList.add('on');
    move(o,x,y);
  }else{
    pd[PD_KEY[k]]=1;
    BTN[k].classList.add('on');
    if(navigator.vibrate)navigator.vibrate(8);
  }
}

function move(o,x,y){
  const R=o.k=='steer'?55:70;
  let dx=(x-o.ox)/R,dy=(y-o.oy)/R;
  const l=Math.hypot(dx,dy);
  if(l>1){dx/=l;dy/=l}
  if(o.k=='steer'){
    sL.x=dx;sL.y=dy;
    knobE.style.transform=`translate(${dx*40}px,${dy*40}px)`;
  }else{
    sR.x=dx;sR.y=dy;
    fireK.style.transform=`translate(${dx*22}px,${dy*22}px)`;
  }
}

function solta(o){
  if(o.k=='steer'){
    sL.x=sL.y=sL.on=0;
    baseE.style.display='none';
    knobE.style.transform='';
  }else if(o.k=='fire'){
    sR.x=sR.y=sR.on=0;
    fireE.classList.remove('on');
    fireK.style.transform='';
  }else{
    pd[PD_KEY[o.k]]=0;
    BTN[o.k].classList.remove('on');
  }
}

// solta todos os dedos (usado ao trocar de tela)
function soltaTudo(){
  for(const id in toques){solta(toques[id]);delete toques[id]}
}

ctl.addEventListener('touchstart',e=>{
  e.preventDefault();
  audio();
  for(const t of e.changedTouches){
    if(toques[t.identifier])continue;
    const k=achaControle(t.clientX,t.clientY);
    if(k)pega(t.identifier,k,t.clientX,t.clientY);
  }
},{passive:false});

ctl.addEventListener('touchmove',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    const o=toques[t.identifier];
    if(o&&(o.k=='steer'||o.k=='fire'))move(o,t.clientX,t.clientY);
  }
},{passive:false});

const fimToque=e=>{
  for(const t of e.changedTouches){
    const o=toques[t.identifier];
    if(o){solta(o);delete toques[t.identifier]}
  }
};
ctl.addEventListener('touchend',fimToque);
ctl.addEventListener('touchcancel',fimToque);

// teclado (para testar no computador)
onkeydown=e=>{
  K[e.code]=1;
  if(e.code=='KeyC')front^=1;
};
onkeyup=e=>K[e.code]=0;
$('cb').onclick=()=>front^=1;

// lê todos os controles e preenche o input do carro do jogador
function pin(){
  const i=P.in,v=camY+(front?PI:0),m=Math.hypot(sR.x,sR.y);
  i.thr=((auto&&!pd.b&&!pd.r&&!K.KeyS)||pd.g||K.KeyW||K.ArrowUp)?1:0;
  i.br=(pd.b||K.KeyS||K.ArrowDown)?1:0;
  i.rv=(pd.r||K.KeyX)?1:0;
  i.st=cl(-sL.x+(pd.l?1:0)-(pd.rt?1:0)+((K.KeyA||K.ArrowLeft)?1:0)-((K.KeyD||K.ArrowRight)?1:0),-1,1);
  if(sR.on){
    // tocou no botão redondo: atira. Arrastar mexe a mira.
    if(m>.2){
      const f=Math.sin(v),g=Math.cos(v),rx=-Math.cos(v),rz=Math.sin(v);
      i.aim=Math.atan2(f*-sR.y+rx*sR.x,g*-sR.y+rz*sR.x);
    }else i.aim=null;
    i.fire=1;
  }else{
    i.aim=null;
    i.fire=K.Space?1:0;
  }
}
