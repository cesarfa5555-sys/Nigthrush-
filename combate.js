// ============================================================
// COMBATE: dano, explosão, tiro e backfire.
// ============================================================

function hurt(c,n,src){
  if(!c.alive||n<=0)return;
  if(c.b.sh>0){
    sparks(c.x,c.y+1.5,c.z,4);
    return
  }
  c.hp-=n;
  if(c.me){
    flash=.6;
    shake=Math.max(shake,.25);
    snd(180,60,.15,.25,'sawtooth',.8,c.x,c.z)
  }
  if(c.hp<=0)die(c,src)
}

function die(c,src){
  if(src&&src.me&&src!=c)kills++;
  c.alive=false;
  c.g.visible=false;
  c.hp=0;
  for(let i=0;i<26;i++)fx(c.x,c.y+1,c.z,(rnd()-.5)*14,rnd()*9,(rnd()-.5)*14,i%3,.9,.6+rnd()*.9);
  for(let i=0;i<6;i++)fx(c.x,c.y+1,c.z,(rnd()-.5)*6,3+rnd()*5,(rnd()-.5)*6,2,2,1.4);
  snd(90,25,.8,.6,'sawtooth',1,c.x,c.z);
  shake=Math.max(shake,Math.min(.9,25/(Math.hypot(c.x-P.x,c.z-P.z)+10)));
  c.row.classList.add('x');
  feed(src&&src!=c?`${src.name} destruiu ${c.name}`:`${c.name} explodiu`)
}

function shoot(c){
  const a=c.h+c.ta+(c.me?0:(rnd()-.5)*.06),dx=Math.sin(a),dz=Math.cos(a),x=c.x+dx*2.1,z=c.z+dz*2.1,k=c.col,m=new T.Mesh(bgm,bmat[k]||(bmat[k]=new T.MeshBasicMaterial({
    color:k==0x2f8cff?0x9fe0ff:k
  })));
  m.rotation.y=a;
  sc.add(m);
  bu.push({
    m,x,z,vx:dx*78,vz:dz*78,o:c,d:(c.me?10:4)*(c.b.dm>0?2:1),l:1.3
  });
  c.kick=1;
  const[fx0,fz0]=[c.x+dx*2.3,c.z+dz*2.3];
  fx(fx0,c.y+2,fz0,dx*3,.5,dz*3,3,.1,.5);
  snd(380,90,.09,.12,'square',.5,c.x,c.z);
  if(c.me)shake=Math.max(shake,.07)
}

function backfire(c){
  for(const s of[.55,-.55]){
    const[x,z]=wp(c,s,-2.2);
    for(let i=0;i<3;i++)fx(x,c.y+.7,z,-Math.sin(c.h)*(6+rnd()*5)+(rnd()-.5)*2,rnd()*2,-Math.cos(c.h)*(6+rnd()*5)+(rnd()-.5)*2,i?1:3,.2,.3+rnd()*.2)
  }
  snd(140,50,.12,.3,'square',.9,c.x,c.z)
}
