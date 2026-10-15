// ============================================================
// CONTROLES: joysticks, pedais, teclado e leitura do input do jogador.
// ============================================================

const sL=stick($('zl')),sR=stick($('zr')),pd={
  g:0,b:0,r:0
},K={
};

function stick(z){
  const s={
    x:0,y:0,on:0
  },b=document.createElement('div'),k=document.createElement('div');
  b.className='sb';
  k.className='sk';
  b.append(k);
  document.body.append(b);
  let id=null,ox,oy;
  const mv=e=>{
    let dx=(e.clientX-ox)/55,dy=(e.clientY-oy)/55,l=Math.hypot(dx,dy);
    if(l>1){
      dx/=l;
      dy/=l
    }
    s.x=dx;
    s.y=dy;
    k.style.transform=`translate(${dx*40}px,${dy*40}px)`
  };
  z.onpointerdown=e=>{
    audio();
    id=e.pointerId;
    z.setPointerCapture(id);
    ox=e.clientX;
    oy=e.clientY;
    b.style.display='block';
    b.style.left=ox-55+'px';
    b.style.top=oy-55+'px';
    s.on=1;
    mv(e)
  };
  z.onpointermove=e=>{
    if(e.pointerId==id)mv(e)
  };
  z.onpointerup=z.onpointercancel=e=>{
    if(e.pointerId==id){
      id=null;
      s.x=s.y=s.on=0;
      b.style.display='none'
    }
  };
  return s
}
[['pg','g'],['pb','b'],['pr','r']].forEach(([i,k])=>{
  const e=$(i);
  e.onpointerdown=()=>{
    audio();
    pd[k]=1;
    e.classList.add('on')
  };
  e.onpointerup=e.onpointercancel=e.onpointerleave=()=>{
    pd[k]=0;
    e.classList.remove('on')
  }
});
onkeydown=e=>{
  K[e.code]=1;
  if(e.code=='KeyC')front^=1
};
onkeyup=e=>K[e.code]=0;
$('cb').onclick=()=>front^=1;

function pin(){
  const i=P.in,v=camY+(front?PI:0),m=Math.hypot(sR.x,sR.y);
  i.thr=((auto&&!pd.b&&!pd.r&&!K.KeyS)||pd.g||K.KeyW||K.ArrowUp)?1:0;
  i.br=(pd.b||K.KeyS||K.ArrowDown)?1:0;
  i.rv=(pd.r||K.KeyX)?1:0;
  i.st=cl(-sL.x+((K.KeyA||K.ArrowLeft)?1:0)-((K.KeyD||K.ArrowRight)?1:0),-1,1);
  if(sR.on&&m>.2){
    const f=Math.sin(v),g=Math.cos(v),rx=-Math.cos(v),rz=Math.sin(v);
    i.aim=Math.atan2(f*-sR.y+rx*sR.x,g*-sR.y+rz*sR.x);
    i.fire=m>.5?1:0
  }else{
    i.aim=null;
    i.fire=K.Space?1:0
  }
}
