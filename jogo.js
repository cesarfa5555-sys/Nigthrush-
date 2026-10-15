// ============================================================
// JOGO: estados, reiniciar/começar partida, loop principal (update/draw), câmera e HUD.
// ============================================================

// game
let state='menu',cd=0,endT=0,shake=0,flash=0,camY=0,front=0,auto=0,gfx=1,last=0,fovC=62,hudBf='';
const bu=[],bgm=new T.BoxGeometry(.14,.14,1.4),bmat=[];

function feed(t){
  const d=document.createElement('div');
  d.textContent=t;
  $('feed').prepend(d);
  setTimeout(()=>d.remove(),4000)
}

function reset(){
  cars.forEach(c=>sc.remove(c.g));
  cars.length=0;
  bu.forEach(b=>sc.remove(b.m));
  bu.length=0;
  $('sbd').innerHTML='';
  [['VOCÊ',0x2f8cff],['NITRO_X',0xff3b3b],['RAZOR',0x35d36b],['VIPER',0xb04dff]].forEach((n,k)=>{
    const c=mkCar(n[0],n[1],k==0);
    c.x=SP[k][0];
    c.z=SP[k][1];
    c.b.sh=5;   // proteção de nascimento (escudo por 5s)
    c.h=Math.atan2(-c.x,-c.z);
    WL.forEach(([lx,lz],i)=>{
      const p=wp(c,lx,lz);
      c.w[i]=H(p[0],p[1])
    });
    cars.push(c);
    const r=document.createElement('div');
    r.className='r';
    r.innerHTML=`<span style="color:#${n[1].toString(16).padStart(6,'0')}">${n[0]}</span><i><u></u></i>`;
    $('sbd').append(r);
    c.hb=r.querySelector('u');
    c.row=r
  });
  P=cars[0];
  camY=P.h;
  pus.forEach(p=>setPU(p,(rnd()*4)|0));
  mks.length=0;
  mi=0;
  draw(0)
}

function start(){
  soltaTudo();
  reset();
  state='play';
  cd=3.6;
  endT=0;
  ['menu','cfg','end'].forEach(i=>$(i).classList.add('h'));
  ['ctl','tl','tc','tr','sp','btns'].forEach(i=>$(i).classList.remove('h'))
}

function menu(){
  soltaTudo();
  state='menu';
  reset();
  $('menu').classList.remove('h');
  $('end').classList.add('h');
  ['ctl','tl','tc','tr','sp','btns'].forEach(i=>$(i).classList.add('h'));
  $('cd').textContent=''
}
const dum=new T.Object3D();

function draw(dt){
  const t=performance.now()/1000;
  pus.forEach(p=>{
    if(!p.g.visible){
      p.rs-=dt;
      if(p.rs<=0)setPU(p,(rnd()*4)|0);
      return
    }
    p.g.position.set(p.x,H(p.x,p.z)+1.7+Math.sin(t*3+p.x)*.25,p.z);
    p.o.rotation.y=t*2
  });
  for(const p of PL)if(p.l>0){
    p.l-=dt;
    if(p.l<=0){
      p.m.visible=false;
      continue
    }
    const k=p.l/p.L;
    p.m.position.x+=p.v[0]*dt;
    p.m.position.y+=p.v[1]*dt;
    p.m.position.z+=p.v[2]*dt;
    p.v[1]-=(p.t==2?-1:9)*dt;
    p.m.scale.setScalar(p.s*(p.t==2?(1.6-.6*k)*Math.min(1,k*3):k))
  }
  for(let n=0;n<280;n++){
    const m=mks[n];
    if(!m||m.l<=0)dum.scale.set(0,0,0);
    else{
      m.l-=dt;
      dum.position.set(m.x,m.y,m.z);
      dum.quaternion.copy(m.q);
      const s=m.l<2.4?Math.max(0,m.l/2.4):1;
      dum.scale.set(s,1,m.len)
    }
    dum.updateMatrix();
    MK.setMatrixAt(n,dum.matrix)
  }
  MK.instanceMatrix.needsUpdate=true
}

function update(dt){
  draw(dt);
  const t=performance.now()/1000;
  if(state=='menu'){
    const a=t*.12;
    cam.position.set(Math.sin(a)*50,22,Math.cos(a)*50);
    cam.lookAt(0,2,0);
    sky.position.copy(cam.position);
    return
  }
  if(cd>0){
    const n=Math.ceil(cd-.6);
    const s=n>0?n:'GO!';
    if($('cd').textContent!=s){
      $('cd').textContent=s;
      $('cd').animate([{
        transform:'scale(1.8)',opacity:0
      },{
        transform:'scale(1)',opacity:1
      }],{
        duration:300
      })
    }
    cd-=dt;
    if(cd<=0)setTimeout(()=>$('cd').textContent='',500)
  }
  const live=cd<=.6;
  pin();
  for(const c of cars)if(c.alive){
    if(c!=P)ai(c,dt);
    drive(c,dt,live)
  }
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){
    const p=cars[a],q=cars[b];
    if(!p.alive||!q.alive)continue;
    const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);
    if(d<3&&d>.01){
      const nx=dx/d,nz=dz/d,pen=(3-d)/2;
      p.x-=nx*pen;
      p.z-=nz*pen;
      q.x+=nx*pen;
      q.z+=nz*pen;
      const rv=(p.vx-q.vx)*nx+(p.vz-q.vz)*nz;
      if(rv>0){
        const j=rv*.7;
        p.vx-=nx*j;
        p.vz-=nz*j;
        q.vx+=nx*j;
        q.vz+=nz*j;
        if(rv>6){
          hurt(p,(rv-6)*.8,q);
          hurt(q,(rv-6)*.8,p);
          sparks((p.x+q.x)/2,p.y+1,(p.z+q.z)/2,rv);
          if(p.me||q.me)shake=Math.max(shake,Math.min(.6,rv*.04));
          snd(70,30,.2,.4,'sine',.6,p.x,p.z)
        }
      }
    }
  }
  for(let n=bu.length-1;n>=0;n--){
    const b=bu[n];
    b.x+=b.vx*dt;
    b.z+=b.vz*dt;
    b.l-=dt;
    b.y=H(b.x,b.z)+1.9;
    b.m.position.set(b.x,b.y,b.z);
    let dead=b.l<=0;
    if(!dead)for(const o of cars)if(o!=b.o&&o.alive&&Math.hypot(o.x-b.x,o.z-b.z)<1.9&&Math.abs(b.y-o.y-1.1)<1.8){
      hurt(o,b.d,b.o);
      sparks(b.x,b.y,b.z,5);
      dead=true;
      break
    }
    if(!dead)for(const w of W)if(b.x>w[0]&&b.x<w[2]&&b.z>w[1]&&b.z<w[3]){
      dead=true;
      sparks(b.x,b.y,b.z,3);
      break
    }
    if(!dead&&muroTiro(b)){
      dead=true;
      sparks(b.x,b.y,b.z,3)
    }
    if(!dead)for(const o of C)if(Math.hypot(b.x-o.x,b.z-o.z)<o.r){
      dead=true;
      sparks(b.x,b.y,b.z,3);
      break
    }
    if(dead){
      sc.remove(b.m);
      bu.splice(n,1)
    }
  }
  for(const c of cars)if(c.alive)for(const p of pus)if(p.g.visible&&Math.hypot(p.x-c.x,p.z-c.z)<2.8){
    p.g.visible=false;
    p.rs=22;
    if(p.t==0)c.hp=Math.min(100,c.hp+45);
    else c.b[['','sh','sp','dm'][p.t]]=[0,7,8,10][p.t];
    snd(500,1100,.2,.2,'sine',0,c.x,c.z);
    for(let i=0;i<10;i++)fx(p.x,c.y+1.5,p.z,(rnd()-.5)*6,rnd()*5,(rnd()-.5)*6,3,.5,.2);
    if(c.me)feed('+ '+PU[p.t][1])
  }
  const al=cars.filter(c=>c.alive);
  if(state=='play'&&!endT&&(!P.alive||al.length<=1)){
    endT=1.8
  }
  if(endT>0){
    endT-=dt;
    if(endT<=0){
      state='over';
      $('et').textContent=P.alive?'🏆 VITÓRIA!':'DERROTA';
      $('end').classList.remove('h')
    }
  }
  // camera
  camY+=ad(P.h-camY)*Math.min(1,dt*(front?6:3.5));
  const v=camY+(front?PI:0),sx=Math.sin(v),sz=Math.cos(v),spd=Math.abs(P.vf),d=8.5+spd*.04,x=P.x-sx*d,z=P.z-sz*d;
  const ty=Math.max(P.y+4,H(x,z)+2);
  cam.position.y+=((cam.position.y||ty)-ty?ty-cam.position.y:0)*Math.min(1,dt*6);
  cam.position.x=x;
  cam.position.z=z;
  shake=Math.max(0,shake-dt*1.4);
  cam.position.x+=(Math.random()-.5)*shake;
  cam.position.y+=(Math.random()-.5)*shake;
  cam.lookAt(P.x+sx*6,P.y+1.2,P.z+sz*6);
  const fv=62+Math.min(spd,45)*.3+(P.b.sp>0?6:0);
  fovC+=(fv-fovC)*Math.min(1,dt*5);
  cam.fov=fovC;
  cam.updateProjectionMatrix();
  sky.position.copy(cam.position);
  sun.position.set(P.x+40,70,P.z+25);
  sun.target.position.set(P.x,0,P.z);
  roofs.forEach((r,i)=>{
    const b=bl[i];
    r.visible=!((Math.abs(P.x-b[0])<b[2]/2&&Math.abs(P.z-b[1])<b[3]/2)||(Math.abs(cam.position.x-b[0])<b[2]/2+1&&Math.abs(cam.position.z-b[1])<b[3]/2+1))
  });
  // hud
  $('hpb').querySelector('i').style.width=P.hp+'%';
  $('hpb').querySelector('i').style.background=P.hp>50?'#2fd36a':P.hp>25?'#ffb020':'#ff3b3b';
  $('al').textContent=al.length;
  $('sp').textContent=Math.round(Math.abs(P.vf)*3.6)+' km/h';
  cars.forEach(c=>c.hb.style.width=c.hp+'%');
  flash=Math.max(0,flash-dt*2);
  $('fl').style.opacity=flash;
  const bf=(P.b.sh>0?`🛡${Math.ceil(P.b.sh)} `:'')+(P.b.sp>0?`⚡${Math.ceil(P.b.sp)} `:'')+(P.b.dm>0?`💥${Math.ceil(P.b.dm)}`:'');
  if(bf!=hudBf){
    hudBf=bf;
    $('bf').textContent=bf
  }
  engine()
}
