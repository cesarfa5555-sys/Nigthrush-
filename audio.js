// ============================================================
// ÁUDIO: motor com marchas e efeitos sonoros (WebAudio).
// ============================================================

// audio
let AC,E1,E2,EF,EG,NB;

function audio(){
  if(AC){
    if(AC.state=='suspended')AC.resume();
    return
  }
  try{
    AC=new(window.AudioContext||window.webkitAudioContext)();
    E1=AC.createOscillator();
    E2=AC.createOscillator();
    E1.type='sawtooth';
    E2.type='square';
    EF=AC.createBiquadFilter();
    EF.type='lowpass';
    EG=AC.createGain();
    EG.gain.value=0;
    const g2=AC.createGain();
    g2.gain.value=.5;
    E1.connect(EF);
    E2.connect(g2);
    g2.connect(EF);
    EF.connect(EG);
    EG.connect(AC.destination);
    E1.start();
    E2.start();
    NB=AC.createBuffer(1,AC.sampleRate/2,AC.sampleRate);
    const d=NB.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1
  }catch(e){
    AC=null
  }
}

function snd(f0,f1,dur,vol,type,nm,x,z){
  if(!AC||!P)return;
  vol/=1+Math.hypot(x-P.x,z-P.z)/22;
  if(vol<.01)return;
  const t=AC.currentTime,g=AC.createGain();
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(.001,t+dur);
  g.connect(AC.destination);
  const o=AC.createOscillator(),og=AC.createGain();
  o.type=type;
  o.frequency.setValueAtTime(f0,t);
  o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  og.gain.value=1-nm;
  o.connect(og);
  og.connect(g);
  o.start(t);
  o.stop(t+dur);
  if(nm>0){
    const n=AC.createBufferSource(),ng=AC.createGain(),f=AC.createBiquadFilter();
    n.buffer=NB;
    f.type='lowpass';
    f.frequency.value=f0*4;
    ng.gain.value=nm;
    n.connect(f);
    f.connect(ng);
    ng.connect(g);
    n.start(t);
    n.stop(t+dur)
  }
}

function engine(){
  if(!AC)return;
  const t=AC.currentTime;
  if(state!='play'||!P.alive){
    EG.gain.setTargetAtTime(0,t,.1);
    return
  }
  const s=Math.abs(P.vf),gr=Math.min(5,Math.floor(s/9)),rp=cl((s-gr*9)/9,0,1),th=P.in.thr?1:0,f=42+gr*7+rp*(70+th*25);
  E1.frequency.setTargetAtTime(f,t,.06);
  E2.frequency.setTargetAtTime(f*.5,t,.06);
  EF.frequency.setTargetAtTime(260+rp*500+th*300,t,.08);
  EG.gain.setTargetAtTime(.05+th*.05,t,.1)
}
