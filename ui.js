// ============================================================
// UI: configurações de gráficos, botões do menu e início do jogo (carrega por último).
// ============================================================

// ui
function applyGfx(l){
  gfx=l;
  try{
    localStorage.setItem('nr_g',l)
  }catch(e){
  }
  R.setPixelRatio([.7,Math.min(devicePixelRatio,1.3),Math.min(devicePixelRatio,2)][l]);
  R.setSize(innerWidth,innerHeight);
  R.shadowMap.enabled=l>0;
  sun.castShadow=l>0;
  sun.shadow.mapSize.set(l>1?2048:1024,l>1?2048:1024);
  if(sun.shadow.map){
    sun.shadow.map.dispose();
    sun.shadow.map=null
  }
  sc.fog.near=l?60:40;
  sc.fog.far=l?230:150;
  sc.traverse(o=>{
    if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)
  });
  document.querySelectorAll('[data-g]').forEach(b=>b.classList.toggle('on',b.dataset.g==l))
}
document.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>applyGfx(+b.dataset.g));
$('bp').onclick=()=>{
  audio();
  start()
};
$('bc').onclick=()=>{
  $('menu').classList.add('h');
  $('cfg').classList.remove('h')
};
$('bx').onclick=()=>{
  $('cfg').classList.add('h');
  $('menu').classList.remove('h')
};
$('ba').onclick=()=>{
  auto^=1;
  $('ba').textContent='Acelerar automático: '+(auto?'SIM':'NÃO');
  $('ba').classList.toggle('on',!!auto)
};
$('br').onclick=start;
$('bm').onclick=menu;
onresize=()=>{
  R.setSize(innerWidth,innerHeight);
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix()
};

function loop(t){
  requestAnimationFrame(loop);
  const dt=Math.min((t-last)/1000||.016,.033);
  last=t;
  update(dt);
  R.render(sc,cam)
}
let g0=1;
try{
  g0=+localStorage.getItem('nr_g');
  if(isNaN(g0)||g0>2)g0=1
}catch(e){
}
applyGfx(g0);
reset();
onresize();
requestAnimationFrame(loop);

// aviso "em breve" para o que ainda não existe (loja, ranking, sala online)
let toastT;
function aviso(t){
  const e=$('toast');
  e.textContent=t;
  e.classList.add('show');
  clearTimeout(toastT);
  toastT=setTimeout(()=>e.classList.remove('show'),1600);
}
document.querySelectorAll('[data-breve]').forEach(b=>b.onclick=()=>aviso('🚧 '+b.textContent+' — em breve!'));
