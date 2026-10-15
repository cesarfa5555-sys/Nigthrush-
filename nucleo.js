// ============================================================
// NÚCLEO: three.js (renderer, cena, câmera), céu e luzes.
// ============================================================

const T=THREE,PI=Math.PI,$=i=>document.getElementById(i),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ad=a=>{
  while(a>PI)a-=2*PI;
  while(a<-PI)a+=2*PI;
  return a
};
let sd=7;
const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
const R=new T.WebGLRenderer({
  antialias:true,powerPreference:'high-performance'
});
document.body.prepend(R.domElement);
const sc=new T.Scene(),cam=new T.PerspectiveCamera(62,1,.3,500),HZ=0xf6d9a6;
sc.fog=new T.Fog(HZ,60,230);
const mc={
},M=c=>mc[c]||(mc[c]=new T.MeshPhongMaterial({
  color:c,flatShading:true,shininess:0
}));
// sky
const sky=(()=>{
  const g=new T.SphereGeometry(400,16,10),p=g.attributes.position,c=new Float32Array(p.count*3),a=new T.Color(0x3a8fe0),b=new T.Color(HZ),t=new T.Color();
  for(let i=0;i<p.count;i++){
    t.copy(b).lerp(a,cl(p.getY(i)/250,0,1));
    c.set([t.r,t.g,t.b],i*3)
  }
  g.setAttribute('color',new T.BufferAttribute(c,3));
  const m=new T.Mesh(g,new T.MeshBasicMaterial({
    vertexColors:true,side:T.BackSide,fog:false,depthWrite:false
  }));
  sc.add(m);
  return m
})();
sc.add(new T.HemisphereLight(0xfff1d6,0xc08a50,.8));
const sun=new T.DirectionalLight(0xfff0cc,.95);
sun.shadow.camera.left=-45;
sun.shadow.camera.right=45;
sun.shadow.camera.top=45;
sun.shadow.camera.bottom=-45;
sun.shadow.camera.far=220;
sun.shadow.bias=-.0006;
sc.add(sun,sun.target);
