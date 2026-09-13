
function exitFS() {
  if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
}
function reqFS(el) {
  if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}
function handleFs() {
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    document.body.classList.add('play-mode-active');
  } else {
    document.body.classList.remove('play-mode-active');
    if(typeof RhythmEngine !== 'undefined' && RhythmEngine.isRunning()) {
      RhythmEngine.stop();
      if(typeof UI !== 'undefined' && UI.refreshRhBtn) UI.refreshRhBtn(false);
    }
  }
  if (typeof UI !== 'undefined' && UI.refreshFB) UI.refreshFB();
}
document.addEventListener('webkitfullscreenchange', handleFs);

﻿/* ================================================================
   ★ YIN, AUDIO, MIC & SCORING
   ================================================================ */
const YIN={
  detect(buf,sr,thr=0.12){
    const N=buf.length,h=N>>1;
    const df=new Float32Array(h);
    for(let t=1;t<h;t++){let s=0;for(let j=0;j<h;j++){const d=buf[j]-buf[j+t];s+=d*d;}df[t]=s;}
    const cm=new Float32Array(h);cm[0]=1;let rs=0;
    for(let t=1;t<h;t++){rs+=df[t];cm[t]=df[t]/((rs/t)||1);}
    let tau=-1;
    for(let t=2;t<h;t++){if(cm[t]<thr){while(t+1<h&&cm[t+1]<cm[t])t++;tau=t;break;}}
    if(tau===-1)return null;
    const x0=tau>0?tau-1:tau,x2=tau+1<h?tau+1:tau;
    let bt;
    if(x0===tau)bt=cm[tau]<=cm[x2]?tau:x2;else if(x2===tau)bt=cm[tau]<=cm[x0]?tau:x0;else{const s0=cm[x0],s1=cm[tau],s2=cm[x2];bt=tau+(s2-s0)/(2*(2*s1-s2-s0));}
    return sr/bt;
  },
  rms(buf){let s=0;for(let i=0;i<buf.length;i++)s+=buf[i]*buf[i];return Math.sqrt(s/buf.length);}
};
const Notes={
  fromFreq(f){
    if(!f||f<=0)return null;
    const m=69+12*Math.log2(f/440),mi=Math.round(m);
    return{midi:mi,pc:((mi%12)+12)%12,name:KEYS[((mi%12)+12)%12],oct:Math.floor(mi/12)-1};
  }
};
let _ctx=null;
function getCtx(){
  if(!_ctx||_ctx.state==='closed') _ctx=new(window.AudioContext||window.webkitAudioContext)({sampleRate:44100,latencyHint:'interactive'});
  return _ctx;
}
const ClickSynth={
  play(ctx,time,type){
    const osc=ctx.createOscillator(), amp=ctx.createGain();
    osc.connect(amp);amp.connect(ctx.destination);
    const P={
      accent:{f:1300,v:.5,d:.045,s:'triangle'}, normal:{f:950,v:.32,d:.036,s:'square'},
      countin:{f:1100,v:.4,d:.040,s:'triangle'}, '4and':{f:1500,v:.40,d:.042,s:'triangle'}
    }[type]||{f:950,v:.32,d:.036,s:'square'};
    osc.type=P.s;osc.frequency.value=P.f;
    amp.gain.setValueAtTime(0,time); amp.gain.linearRampToValueAtTime(P.v*.8,time+.001); amp.gain.exponentialRampToValueAtTime(.0001,time+P.d);
    osc.start(time);osc.stop(time+P.d+.01);
  }
};

const Mic=(()=>{
  let an=null,pr=null,wn=null,src=null,stream=null,running=false,hist=[],cb=null;
  let lastAmp = 0, lastAttackTime = 0;
  const BUF=2048;

  function processBuffer(t, buf, sr) {
      const amp=YIN.rms(buf);
      if(amp > 0.015 && (lastAmp < 0.015 || amp > lastAmp * 1.5)) {
        lastAttackTime = t;
      }
      lastAmp = amp;
      if(amp<0.015){cb.onSilent&&cb.onSilent(amp);return;}
      const raw=YIN.detect(buf,sr,0.12);
      if(!raw||raw<72||raw>1400){cb.onSilent&&cb.onSilent(amp);return;}
      hist.push(raw);if(hist.length>3)hist.shift();
      const s=[...hist].sort((a,b)=>a-b), freq=s.length%2?s[s.length>>1]:(s[(s.length>>1)-1]+s[s.length>>1])/2;
      const note=Notes.fromFreq(freq);if(!note)return;
      cb.onPitch&&cb.onPitch({raw,freq,note,amp,audioTime:lastAttackTime || (t+BUF/(2*sr))});
  }

  async function start(callbacks){
    if(running)return;cb=callbacks;
    try {
      stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    } catch(e) {
      alert("マイクへのアクセスが許可されていません。ブラウザの設定を確認してください。\nMicrophone access denied.");
      throw e;
    }
    const ctx=getCtx();if(ctx.state==='suspended')await ctx.resume();
    src=ctx.createMediaStreamSource(stream);an=ctx.createAnalyser();an.fftSize=BUF;src.connect(an);
    lastAmp = 0;
    lastAttackTime = 0;

    let useWorklet = false;
    if(ctx.audioWorklet) {
      try {
        await ctx.audioWorklet.addModule('pitch-processor.js');
        wn = new AudioWorkletNode(ctx, 'pitch-processor');
        src.connect(wn);
        wn.connect(ctx.destination);
        wn.port.onmessage = e => {
           processBuffer(ctx.currentTime, e.data.buffer, ctx.sampleRate);
        };
        useWorklet = true;
      } catch(e) { console.warn("AudioWorklet not supported/failed, falling back", e); }
    }
    
    if(!useWorklet) {
      pr=ctx.createScriptProcessor(BUF,1,1);src.connect(pr);pr.connect(ctx.destination);
      pr.onaudioprocess=e=>{
        processBuffer(e.playbackTime, e.inputBuffer.getChannelData(0), ctx.sampleRate);
      };
    }
    running=true;
  }
  function stop(){
    if(!running)return;
    if(pr)pr.disconnect();if(wn)wn.disconnect();if(src)src.disconnect();if(an)an.disconnect();
    if(stream)stream.getTracks().forEach(t=>t.stop());
    pr=wn=src=an=stream=null;hist=[];running=false;
  }
  return{start,stop,isRunning:()=>running,getAmp:()=>{if(!an)return null;let d=new Float32Array(an.fftSize);an.getFloatTimeDomainData(d);return d;}};
})();

const ScoringEngine=(()=>{
  let target=null,scored=false,testMode=false,best=null;
  function getTolerances(){
    return {EX:50, GD:120, LA:280, WIN:0.43};
  }
  function checkFretConstraint(midi){
    const minF=App.minFret, maxF=App.maxFret;
    const bases=[40,45,50,55,59,64];
    for(let b of bases){
      let diff=midi-b;
      if(diff>=minF && diff<=maxF) return true;
    }
    return false;
  }
  function setTarget(iv,beatTime,chord){
    target={iv,beatTime,chordRoot:chord.root};
    scored=false;best=null;
  }
  function onPitch(note,audioTime){
    if(!testMode||!target||scored)return;
    const {WIN}=getTolerances();
    const err=(audioTime - App.latencyOffset/1000)-target.beatTime;
    if(Math.abs(err)>WIN)return;
    const dIv=((note.pc-target.chordRoot)+12)%12;
    if(dIv!==target.iv)return;
    const posOK=checkFretConstraint(note.midi);
    if(!best||Math.abs(err)<Math.abs(best.err)) best={err,dIv,posOK};
  }
  function finalize(){
    scored=true;let result;
    if(best){
      if(!best.posOK){
        result={grade:'WRONG_POS',score:0,timingMs:Math.abs(best.err*1000),targetIv:target.iv};
      }else{
        const {EX,GD}=getTolerances(), tMs=best.err*1000, absMs=Math.abs(tMs);
        let grade,score;
        if(absMs<EX){grade='EXCELLENT';score=100;}else if(absMs<GD){grade='GOOD';score=70;}else{grade='LATE';score=40;}
        result={grade,score,timingMs:tMs,targetIv:target.iv};
      }
    }else{
      result={grade:'MISS',score:0,timingMs:null,targetIv:target.iv};
    }
    ScoreTracker.record(result);
    UI.showFeedback(result);
    if(result.grade==='EXCELLENT' || result.grade==='GOOD'){
      document.body.classList.add('glow-success');
      setTimeout(()=>document.body.classList.remove('glow-success'), 150);
    }
    target=null;best=null;
  }
  function checkTimeout(now){
    if(!testMode||!target||scored)return;
    if(now-target.beatTime>getTolerances().WIN) finalize();
  }
  return{setTarget,onPitch,checkTimeout,setTestMode:v=>{testMode=v;}};
})();
/* ================================================================
   ★ RHYTHM ENGINE & LOGIC
   ================================================================ */
const RhythmEngine=(()=>{
  let running=false,worker=null,rafId=null,ctx=null;
  let nextTime=0,eighthIdx=0,barCount=0,progIdx=-1;
  let inCountin=false,countinTick=0;
  let qBeat=[],qChord=[],qTarget=[],qVisual=[];
  let cbBeat,cbChord,cbTarget,cbVisual,cbSessionEnd;
  const PATTERNS={'4beat':[0,2,4,6],'backbeat':[2,6],'beat1':[0],'4-1':[7]};

  function clickType(ei){
    if(App.pattern==='4-1')return ei===7?'4and':null;
    const pts=PATTERNS[App.pattern]||PATTERNS['4beat'];
    if(!pts.includes(ei))return null;
    return ei===0?'accent':'normal';
  }
  function eDur(){return 60/App.bpm/2;}

  function tick(){
    if(!ctx||!running)return;
    const horizon=ctx.currentTime+0.1;
    const bpc=App.barsPerChord;
    while(nextTime<horizon){
      let t=nextTime;
      if(inCountin){
        if(eighthIdx%2===0){
          let step=countinTick++;
          if(step===0 && App.testMode){
             let firstIv = pickTargetByLevel(activeProg[0].obj, App.level);
             let startTime = t + 16 * eDur(); 
             qTarget.push({time:t, iv:firstIv, chord:activeProg[0], isNext:true});
             qTarget.push({time:startTime, iv:firstIv, chord:activeProg[0], isNow:true, beatTime:startTime});
          }
          if(step<8){
            if([0,2,4,5,6,7].includes(step)){
              ClickSynth.play(ctx,t,'countin');
              let txt=(step===0||step===4)?'1':(step===2||step===5)?'2':(step===6)?'3':'4';
              qVisual.push({time:t,txt});
            }
          }
        }
        eighthIdx=(eighthIdx+1)%8;
        nextTime+=eDur();
        
        // --- FIXED LOGIC ---
        if(countinTick >= 8 && eighthIdx === 0){
          inCountin=false;barCount=0;progIdx=-1;
        }
        continue;
      }
      
      const ct=clickType(eighthIdx);
      if(ct)ClickSynth.play(ctx,t,ct);
      qBeat.push({time:t,ei:eighthIdx});

      if(eighthIdx===0){
        if(barCount%bpc===0){
          progIdx++;
          if(progIdx>=activeProg.length){
            progIdx=0;
            if(App.testMode && cbSessionEnd) { qVisual.push({time:t,end:true}); }
          }
          let cChord=activeProg[progIdx];
          qChord.push({time:t,idx:progIdx});
        }
        
        if(barCount%bpc === bpc-1 && App.testMode){
           let nextI=(progIdx+1)%activeProg.length;
           let nChord=activeProg[nextI];
           let nextIv=pickTargetByLevel(nChord.obj, App.level);
           qTarget.push({time:t, iv:nextIv, chord:nChord, isNext:true}); 
           qTarget.push({time:t+8*eDur(), iv:nextIv, chord:nChord, isNow:true, beatTime:t+8*eDur()});
        }
        barCount++;
      }
      eighthIdx=(eighthIdx+1)%8;
      nextTime+=eDur();
    }
  }
  function loop(){
    if(!ctx){rafId=requestAnimationFrame(loop);return;}
    let now=ctx.currentTime;
    while(qVisual.length&&qVisual[0].time<=now){
      let v=qVisual.shift();
      if(v.end) cbSessionEnd(); else if(cbVisual)cbVisual(v);
    }
    while(qBeat.length&&qBeat[0].time<=now){let ev=qBeat.shift();if(cbBeat)cbBeat(ev);}
    while(qChord.length&&qChord[0].time<=now){let ev=qChord.shift();if(cbChord)cbChord(ev);}
    while(qTarget.length&&qTarget[0].time<=now){let ev=qTarget.shift();if(cbTarget)cbTarget(ev);}
    ScoringEngine.checkTimeout(now);
    if(running)rafId=requestAnimationFrame(loop);
  }
  function start(cbs,useCountin){
    if(running)return;
    ctx=getCtx();if(ctx.state==='suspended')ctx.resume();
    cbBeat=cbs.onBeat;cbChord=cbs.onChord;cbTarget=cbs.onTarget;cbVisual=cbs.onVisual;cbSessionEnd=cbs.onSessionEnd;
    eighthIdx=0;barCount=0;progIdx=-1;
    inCountin=useCountin;countinTick=0;
    nextTime=ctx.currentTime+0.05;
    running=true;
    worker=new Worker(URL.createObjectURL(new Blob([`let id=null;self.onmessage=e=>{if(e.data.cmd==='start'){if(id)clearInterval(id);id=setInterval(()=>self.postMessage('t'),25);}else if(e.data.cmd==='stop'){clearInterval(id);id=null;}};`],{type:'application/javascript'})));
    worker.onmessage=tick;worker.postMessage({cmd:'start'});
    rafId=requestAnimationFrame(loop);
  }
  function stop(){
    running=false;if(worker){worker.postMessage({cmd:'stop'});worker.terminate();worker=null;}
    cancelAnimationFrame(rafId);rafId=null;
    qBeat=[];qChord=[];qTarget=[];qVisual=[];
  }
  return{start,stop,isRunning:()=>running};
})();

function pickTargetByLevel(chordObj,level){
  const tones=chordObj.tones, tens=chordObj.tens;
  let third=tones.includes(3)?3:tones.includes(4)?4:null;
  if(level==='beginner') return third||0;
  if(level==='intermediate'){
    let seventh=tones.includes(10)?10:tones.includes(11)?11:null;
    let p=[]; if(third)p.push(third); if(seventh)p.push(seventh);
    return p.length?p[Math.floor(Math.random()*p.length)]:0;
  }
  return tens[Math.floor(Math.random()*tens.length)];
}

const ScoreTracker={
  history:[],
  record(r){
    this.history.push(r);
    UI.refreshScore();
    Settings.saveScore();
  },
  reset(){this.history=[];UI.refreshScore();}
};

const Settings={
  KEY:'jgt_p4',
  load(){
    try{return JSON.parse(localStorage.getItem(this.KEY)||'{}');}catch(e){return {};}
  },
  saveGen(){
    let s=this.load();
    s.bpm=App.bpm; s.lang=currentLang; s.mode=App.testMode;
    s.level=App.level; s.minFret=App.minFret; s.maxFret=App.maxFret;
    s.songId=AppSong.id; s.keyId=AppKey; s.pattern=App.pattern;
    s.barsPerChord=App.barsPerChord; s.missionTargetOnly=App.missionTargetOnly;
    s.degreeBase=App.degreeBase; s.latencyOffset=App.latencyOffset;
    localStorage.setItem(this.KEY,JSON.stringify(s));
  },
  saveScore(){
    let s=this.load();
    if(!s.scores) s.scores={};
    let k=`${AppSong.id}_${AppKey}_${App.level}`;
    s.scores[k]=ScoreTracker.history;
    localStorage.setItem(this.KEY,JSON.stringify(s));
  },
  loadScore(){
    let s=this.load();
    let k=`${AppSong.id}_${AppKey}_${App.level}`;
    ScoreTracker.history=(s.scores&&s.scores[k])?s.scores[k]:[];
    UI.refreshScore();
  }
};
/* ================================================================
   ★ STATE, UI & BOOTSTRAP
   ================================================================ */
const App={
  bpm:120, testMode:false, level:'intermediate', minFret:0, maxFret:15, idx:0, missionTargetOnly:false, latencyOffset:0,
  pattern:'4beat', barsPerChord:1, degreeBase:'chord', detPC:null, currentTarget:null, nextTarget:null,
  
  setBpm(val){
    this.bpm = Math.min(240, Math.max(40, val));
    document.getElementById('rhBpm').textContent = this.bpm;
    document.getElementById('bpmSlider').value = this.bpm;
    Settings.saveGen();
  },
  chord(){return activeProg[this.idx];},
  onChordChange(ev){
    this.idx=ev.idx;this.detPC=null;
    UI.refreshChord();UI.refreshFB();
  },
  onBeat(ev){},
  onTarget(ev){
    if(!this.testMode) return;
    if(ev.isNext){
      this.nextTarget = ev;
      UI.showNextTarget(ev);
    }
    if(ev.isNow){
      this.currentTarget = ev;
      this.nextTarget = null;
      ScoringEngine.setTarget(ev.iv, ev.beatTime, ev.chord);
      UI.showNowTarget(ev);
      UI.refreshFB();
    }
  },
  onPitch({raw,freq,note,amp,audioTime}){
    UI.logDiag({raw,freq,note,amp});
    this.detPC=note.pc;
    ScoringEngine.onPitch(note,audioTime);
    UI.refreshPitch({freq,note,amp});
    UI.refreshFB();
  },
  onSilent(amp){
    UI.refreshVU(amp);
    this.detPC=null;
  },
  onSessionEnd(){
    RhythmEngine.stop();
    UI.refreshRhBtn(false);
    exitFS();
    UI.showRetroResult();
  }
};

const TapTempo={
  times:[],
  tap(){
    let now=Date.now();
    this.times.push(now);
    if(this.times.length>4) this.times.shift();
    if(this.times.length>=2){
      let dt=now-this.times[this.times.length-2];
      if(dt>2000) { this.times=[now]; return; }
      let sum=0; for(let i=1;i<this.times.length;i++) sum+=this.times[i]-this.times[i-1];
      let avg=sum/(this.times.length-1);
      App.setBpm(Math.round(60000/avg));
    }
  }
};

const FB=(()=>{
  const NS='http://www.w3.org/2000/svg';
  const L=32,OW=30,NX=62,FW=47,SH=27,TOP=20,DR=9;
  const OPEN_MIDI=[64,59,55,50,45,40];
  let svg;
  function mk(t,a,tx){let e=document.createElementNS(NS,t);for(let k in a)e.setAttribute(k,a[k]);if(tx)e.textContent=tx;return e;}
  function init(el){
    svg=el;svg.innerHTML='';
    let S=mk('g',{});
    for(let s=0;s<6;s++)S.appendChild(mk('line',{x1:L-8,y1:TOP+s*SH,x2:815,y2:TOP+s*SH,stroke:'#22294a','stroke-width':[.7,.9,1.1,1.4,1.85,2.3][s]}));
    S.appendChild(mk('line',{x1:NX,y1:TOP-6,x2:NX,y2:TOP+5*SH+6,stroke:'#8892b0','stroke-width':5,'stroke-linecap':'round'}));
    for(let f=1;f<=15;f++){let x=NX+f*FW;S.appendChild(mk('line',{x1:x,y1:TOP-2,x2:x,y2:TOP+5*SH+2,stroke:'#1a2040','stroke-width':f===12?2.5:1.2}));}
    [3,5,7,9,15].forEach(f=>S.appendChild(mk('circle',{cx:NX+(f-.5)*FW,cy:TOP+2.5*SH,r:4.5,fill:'#181e38'})));
    S.appendChild(mk('circle',{cx:NX+11.5*FW,cy:TOP+1.5*SH,r:4.5,fill:'#181e38'}));
    S.appendChild(mk('circle',{cx:NX+11.5*FW,cy:TOP+3.5*SH,r:4.5,fill:'#181e38'}));
    ['e','B','G','D','A','E'].forEach((n,s)=>S.appendChild(mk('text',{x:L-14,y:TOP+s*SH+4.5,'text-anchor':'middle',fill:'#2d3658','font-size':10},n)));
    for(let f=0;f<=15;f++)S.appendChild(mk('text',{x:f===0?L+OW/2:NX+(f-.5)*FW,y:TOP+5*SH+20,'text-anchor':'middle',fill:'#1a2440','font-size':9},f));
    svg.appendChild(S);svg.appendChild(mk('g',{id:'fbd'}));svg.appendChild(mk('g',{id:'fbh'}));
  }
  function render(){
    if(!svg)return;
    let dg=svg.querySelector('#fbd'), hg=svg.querySelector('#fbh');
    dg.innerHTML='';hg.innerHTML='';
    if (document.body.classList.contains('play-mode-active')) {
      let minF = App.minFret, maxF = App.maxFret;
      if(maxF > 15) maxF = 15;
      if(minF < 0) minF = 0;
      let pad = 10;
      let minX = minF === 0 ? 0 : NX + (minF - 1) * FW - pad;
      let maxX = NX + maxF * FW + pad;
      svg.setAttribute('viewBox', `${minX} 0 ${maxX - minX} 185`);
    } else {
      svg.setAttribute('viewBox', '0 0 815 185');
    }
    if(!activeProg.length)return;
    let ch=activeProg[App.idx];
    let keyRoot = keyToPc(AppKey);
    for(let s=0;s<6;s++){
      for(let f=0;f<=15;f++){
        let midi=OPEN_MIDI[s]+f;
        if(f<App.minFret || f>App.maxFret) continue;
        
        let pc=midi%12;
        let civ=(pc-ch.root+12)%12;
        let isTone = ch.obj.tones.includes(civ);
        let isTens = ch.obj.tens.includes(civ);
        if(!isTone && !isTens) continue;
        
        if(App.missionTargetOnly){
          if(App.testMode && App.currentTarget){
             if(civ !== App.currentTarget.iv) continue;
          } else {
             if(![3,4,10,11].includes(civ)) continue; // Guide tones fallback
          }
        }

        let displayIv = App.degreeBase === 'key' ? (pc - keyRoot + 12) % 12 : civ;
        let lbl = getIvLabel(displayIv);
        let col = isTone?ch.obj.col:'#7c8db5';
        let cx=f===0?L+OW/2:NX+(f-.5)*FW, cy=TOP+s*SH;

        let isDet = App.detPC!==null && pc===App.detPC;
        let g=document.createElementNS(NS,'g');
        if(isDet){
          g.appendChild(mk('circle',{cx,cy,r:14,fill:'none',stroke:'#fbbf24','stroke-width':2.5,opacity:.7}));
          g.appendChild(mk('circle',{cx,cy,r:DR,fill:'#fbbf24'}));
          g.appendChild(mk('text',{x:cx,y:cy+3,'text-anchor':'middle',fill:'#000','font-size':7,'font-weight':'bold'},lbl));
          hg.appendChild(g);
        }else{
          g.appendChild(mk('circle',{cx,cy,r:DR,fill:col,opacity:.8}));
          g.appendChild(mk('text',{x:cx,y:cy+3,'text-anchor':'middle',fill:'#000','font-size':7,'font-weight':'bold'},lbl));
          dg.appendChild(g);
        }
      }
    }
  }
  return{init,render};
})();

const UI={
  init(){
    FB.init(document.getElementById('fretboard'));
    let ss=document.getElementById('songSel');
    SONG_DB.forEach(s=>{let o=document.createElement('option');o.value=s.id;o.textContent=s.title;ss.appendChild(o);});
    let customOpt = document.createElement('option'); customOpt.value = 'custom'; customOpt.textContent = t('customProg'); ss.appendChild(customOpt);

    let ks=document.getElementById('keySel');
    KEYS.forEach(k=>{let o=document.createElement('option');o.value=k;o.textContent=k;ks.appendChild(o);});
    
    let srt = document.getElementById('selSingleRoot');
    KEYS.forEach((k,i)=>{let o=document.createElement('option');o.value=i;o.textContent=k;srt.appendChild(o);});
    let sql = document.getElementById('selSingleQual');
    Object.keys(CHORD_QUALITIES).forEach(q=>{let o=document.createElement('option');o.value=q;o.textContent=q;sql.appendChild(o);});
    
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      let k=el.dataset.i18n; if(!el.tagName.match(/INPUT|OPTION/)) el.innerHTML=t(k);
    });
  },
  buildProgStrip(){
    let ps=document.getElementById('progStrip');ps.innerHTML='';
    AppSong.sections.forEach(sec=>{
      let wrap=document.createElement('div');
      let row=document.createElement('div');row.className='prog-sec-row';
      let lbl=document.createElement('span');lbl.className='prog-sec-lbl';lbl.textContent=sec.lbl;
      row.appendChild(lbl);
      let chips=document.createElement('div');chips.className='prog-chips';
      for(let i=sec.s; i<sec.s+sec.n; i++){
        let c=activeProg[i];
        let d=document.createElement('div');d.className='pchip';
        d.dataset.idx=i; d.textContent=c.label;
        chips.appendChild(d);
      }
      row.appendChild(chips); wrap.appendChild(row); ps.appendChild(wrap);
    });
  },
  refreshChord(){
    if(!activeProg.length)return;
    let ch=activeProg[App.idx];
    document.getElementById('chordName').textContent=ch.label;
    document.getElementById('chordName').style.color=ch.obj.col;
    document.getElementById('chordTones').innerHTML='';
    ch.obj.tones.forEach(iv=>{
      let sp=document.createElement('span');sp.className='tc';
      sp.textContent=KEYS[(ch.root+iv)%12];
      document.getElementById('chordTones').appendChild(sp);
    });
    
    document.querySelectorAll('.pchip').forEach((d)=>{
      let i = parseInt(d.dataset.idx);
      if(i === App.idx){
        d.classList.add('act'); d.style.background=ch.obj.col;
      } else {
        d.classList.remove('act'); d.style.background='';
      }
    });
  },
  refreshPitch({note,amp}){
    let ne=document.getElementById('pNote');
    ne.textContent=note.name+note.oct;ne.classList.remove('sil');
    document.getElementById('pHz').textContent='';
    this.refreshVU(amp);
  },
  refreshVU(amp){document.getElementById('vuFill').style.width=Math.min(100,amp/.28*100)+'%';},
  refreshFB(){FB.render();},

  logDiag(data){
    let tb = document.getElementById('diagTableBody');
    if(!tb) return;
    let tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--bd)';
    let time = new Date().toISOString().split('T')[1].slice(0,-1);
    tr.innerHTML = '<td>'+time+'</td><td>'+data.raw.toFixed(1)+'</td><td>'+data.freq.toFixed(1)+'</td><td>'+data.note.name+data.note.oct+'</td><td>'+data.amp.toFixed(3)+'</td>';
    tb.insertBefore(tr, tb.firstChild);
    while(tb.children.length > 10) tb.removeChild(tb.lastChild);
  },

  refreshScore(){
    let pips=document.getElementById('scorePips');pips.innerHTML='';
    let ex=0,gd=0;
    ScoreTracker.history.forEach(r=>{
      let p=document.createElement('div');
      p.className='pip '+(r.grade==='EXCELLENT'?'pip-ex':r.grade==='GOOD'?'pip-gd':r.grade==='LATE'?'pip-la':'pip-ms');
      pips.appendChild(p);
      if(r.score===100)ex++; if(r.score===70)gd++;
    });
    let t=ScoreTracker.history.length;
    let avg=t?Math.round(ScoreTracker.history.reduce((a,b)=>a+b.score,0)/t):'--';
    document.getElementById('scoreAvg').textContent=avg;
    document.getElementById('scoreAttempts').textContent=t+' attempts';
  },
  showNextTarget(ev){
    let targetPc = (ev.chord.root + ev.iv) % 12;
    let displayIv = App.degreeBase === 'key' ? (targetPc - keyToPc(AppKey) + 12) % 12 : ev.iv;
    let lbl=getIvLabel(displayIv);
    let suf=App.degreeBase==='key'?` (Key of ${AppKey})`:'';
    document.getElementById('missionNext').textContent=`[ ${ev.chord.label} ] : ${lbl}${suf}`;
  },
  showNowTarget(ev){
    let targetPc = (ev.chord.root + ev.iv) % 12;
    let displayIv = App.degreeBase === 'key' ? (targetPc - keyToPc(AppKey) + 12) % 12 : ev.iv;
    let lbl=getIvLabel(displayIv);
    let suf=App.degreeBase==='key'?` (Key of ${AppKey})`:'';
    document.getElementById('missionNow').textContent=`[ ${ev.chord.label} ] : ${lbl}${suf}`;
    document.getElementById('missionNext').textContent=`---`;
  },
  refreshMissions(){
    if(App.testMode){
      if(App.currentTarget) this.showNowTarget(App.currentTarget);
      if(App.nextTarget) this.showNextTarget(App.nextTarget);
    }
  },
  resetMissions(){
    document.getElementById('missionNow').textContent=App.testMode?`---`:t('missionWait');
    document.getElementById('missionNext').textContent=App.testMode?`---`:t('missionWait');
  },
  showFeedback(res){
    let ov=document.getElementById('fbOverlay'),bd=document.getElementById('fbBadge');
    bd.className='fb-badge '+(res.grade==='EXCELLENT'?'fb-ex':res.grade==='GOOD'?'fb-gd':res.grade==='LATE'?'fb-la':'fb-ms');
    bd.textContent=t(res.grade.toLowerCase());
    ov.style.opacity='1';
    setTimeout(()=>ov.style.opacity='0',800);
  },
  refreshRhBtn(running){
    let b=document.getElementById('btnRhStart');
    b.innerHTML=running?`&#9209; ${t('stop')}`:`&#9654; ${t('start')}`;
    b.className=running?'btn btn-red':'btn btn-grn';
  },
  triggerVisualCountin(txt){
    let ov=document.getElementById('countinBg'), tEl=document.getElementById('countinTxt');
    ov.style.opacity='1';
    tEl.textContent=txt;
    tEl.classList.remove('anim-pop');
    void tEl.offsetWidth; 
    tEl.classList.add('anim-pop');
    if(txt==='4') setTimeout(()=>ov.style.opacity='0',400);
  },
  showRetroResult(){
    let ov=document.getElementById('retroBg');
    let msgs=(I18N[currentLang]||I18N.en).retroMsgs;
    document.getElementById('retroMsg').textContent=msgs[Math.floor(Math.random()*msgs.length)];
    let t=ScoreTracker.history.length;
    let avg=t?Math.round(ScoreTracker.history.reduce((a,b)=>a+b.score,0)/t):0;
    document.getElementById('retroStats').innerHTML=`SCORE: ${avg}<br>ATTEMPTS: ${t}`;
    ov.style.opacity='1';ov.style.pointerEvents='auto';
  },
  showHelp(){
    document.getElementById('helpBody').innerHTML=t('helpBody');
    document.getElementById('helpModal').classList.remove('hidden');
  }
};

document.addEventListener('DOMContentLoaded',()=>{
  let s=Settings.load();
  currentLang=s.lang||'en';
  App.bpm=s.bpm||120; App.testMode=s.mode||false; App.level=s.level||'intermediate';
  App.minFret=s.minFret!=null?s.minFret:0; App.maxFret=s.maxFret!=null?s.maxFret:15;
  App.pattern=s.pattern||'4beat';
  App.barsPerChord=s.barsPerChord||1;
  App.degreeBase=s.degreeBase||'chord';
  App.missionTargetOnly=s.missionTargetOnly||false;
  App.latencyOffset=s.latencyOffset||0;
  ScoringEngine.setTestMode(App.testMode);

  AppSong=SONG_DB.find(x=>x.id===s.songId)||SONG_DB[0];
  AppKey=s.keyId||AppSong.key;

  UI.init();
  
  document.getElementById('songSel').value=AppSong.id;
  document.getElementById('keySel').value=AppKey;
  document.getElementById('minFret').value=App.minFret;
  document.getElementById('maxFret').value=App.maxFret;
  document.getElementById('fretRangeLbl').textContent=`${App.minFret} - ${App.maxFret}`;
  document.getElementById('rhBpm').textContent=App.bpm;
  document.getElementById('bpmSlider').value=App.bpm;
  document.getElementById('missionTargetChk').checked=App.missionTargetOnly;
  document.getElementById('latencyOffset').value=App.latencyOffset;
  document.getElementById('latencyLbl').textContent=`${App.latencyOffset > 0 ? '+' : ''}${App.latencyOffset}ms`;
  
  document.querySelectorAll('#levelGrp .rtgl').forEach(b=>b.classList.toggle('sel',b.dataset.lvl===App.level));
  document.querySelectorAll('#patGrp .rtgl').forEach(b=>b.classList.toggle('sel',b.dataset.pat===App.pattern));
  document.querySelectorAll('#bpcGrp .rtgl').forEach(b=>b.classList.toggle('sel',parseInt(b.dataset.bpc)===App.barsPerChord));
  document.querySelectorAll('#degBaseGrp .rtgl').forEach(b=>b.classList.toggle('sel',b.dataset.deg===App.degreeBase));
  document.getElementById('btnModePrac').classList.toggle('sel',!App.testMode);
  document.getElementById('btnModeTest').classList.toggle('sel',App.testMode);

  buildProg();
  UI.buildProgStrip();
  Settings.loadScore();
  App.onChordChange({idx:0});
  UI.resetMissions();

  if(s.songId === 'custom' && s.customProgText){
    applyCustomProgression(s.customProgText);
    document.getElementById('songSel').value = 'custom';
  } else if(s.songId && s.songId.startsWith('single:')){
    let label = s.songId.split(':')[1];
    let c = parseCustomChord(label);
    if(c){
      document.getElementById('chkSingleDrill').checked = true;
      document.getElementById('selSingleRoot').disabled = false;
      document.getElementById('selSingleQual').disabled = false;
      document.getElementById('selSingleRoot').value = c.root;
      document.getElementById('selSingleQual').value = c.q;
      applySingleChordDrill(c.root, c.q);
    }
  }

  // Events
  document.getElementById('songSel').onchange=e=>{
    let v = e.target.value;
    if(v==='custom'){
      let st=Settings.load();
      if(st.customProgText) { applyCustomProgression(st.customProgText); }
      else { document.getElementById('btnCustomProg').click(); }
    } else {
      AppSong=SONG_DB.find(x=>x.id===v);
      buildProg(); UI.buildProgStrip(); Settings.loadScore(); App.onChordChange({idx:0}); Settings.saveGen();
    }
    document.getElementById('chkSingleDrill').checked = false;
    document.getElementById('selSingleRoot').disabled = true;
    document.getElementById('selSingleQual').disabled = true;
  };
  document.getElementById('keySel').onchange=e=>{
    AppKey=e.target.value;
    buildProg(); UI.buildProgStrip(); Settings.loadScore(); App.onChordChange({idx:0}); Settings.saveGen();
  };
  document.getElementById('minFret').oninput=e=>{
    App.minFret=parseInt(e.target.value);
    if(App.minFret>App.maxFret){App.maxFret=App.minFret;document.getElementById('maxFret').value=App.maxFret;}
    document.getElementById('fretRangeLbl').textContent=`${App.minFret} - ${App.maxFret}`;
    UI.refreshFB(); Settings.saveGen();
  };
  document.getElementById('maxFret').oninput=e=>{
    App.maxFret=parseInt(e.target.value);
    if(App.maxFret<App.minFret){App.minFret=App.maxFret;document.getElementById('minFret').value=App.minFret;}
    document.getElementById('fretRangeLbl').textContent=`${App.minFret} - ${App.maxFret}`;
    UI.refreshFB(); Settings.saveGen();
  };
  document.getElementById('missionTargetChk').onchange=e=>{
    App.missionTargetOnly=e.target.checked; UI.refreshFB(); Settings.saveGen();
  };
  document.getElementById('latencyOffset').oninput=e=>{
    App.latencyOffset=parseInt(e.target.value);
    document.getElementById('latencyLbl').textContent=`${App.latencyOffset > 0 ? '+' : ''}${App.latencyOffset}ms`;
    Settings.saveGen();
  };
  document.getElementById('levelGrp').onclick=e=>{
    let b=e.target.closest('.rtgl');if(!b)return;
    document.querySelectorAll('#levelGrp .rtgl').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
    App.level=b.dataset.lvl; Settings.loadScore(); Settings.saveGen();
  };
  document.getElementById('patGrp').onclick=e=>{
    let b=e.target.closest('.rtgl');if(!b)return;
    document.querySelectorAll('#patGrp .rtgl').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
    App.pattern=b.dataset.pat; Settings.saveGen();
  };
  document.getElementById('bpcGrp').onclick=e=>{
    let b=e.target.closest('.rtgl');if(!b)return;
    document.querySelectorAll('#bpcGrp .rtgl').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
    App.barsPerChord=parseInt(b.dataset.bpc); Settings.saveGen();
  };
  document.getElementById('degBaseGrp').onclick=e=>{
    let b=e.target.closest('.rtgl');if(!b)return;
    document.querySelectorAll('#degBaseGrp .rtgl').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
    App.degreeBase=b.dataset.deg; 
    UI.refreshMissions(); UI.refreshFB(); Settings.saveGen();
  };
  document.getElementById('btnModePrac').onclick=()=>{
    App.testMode=false; ScoringEngine.setTestMode(false);
    document.getElementById('btnModePrac').classList.add('sel');
    document.getElementById('btnModeTest').classList.remove('sel');
    UI.resetMissions();Settings.saveGen();
  };
  document.getElementById('btnModeTest').onclick=()=>{
    App.testMode=true; ScoringEngine.setTestMode(true);
    document.getElementById('btnModeTest').classList.add('sel');
    document.getElementById('btnModePrac').classList.remove('sel');
    UI.resetMissions();Settings.saveGen();
  };
  
  document.getElementById('btnBpmDn').onclick=()=>App.setBpm(App.bpm-5);
  document.getElementById('btnBpmUp').onclick=()=>App.setBpm(App.bpm+5);
  document.getElementById('bpmSlider').oninput=e=>App.setBpm(parseInt(e.target.value));
  document.getElementById('btnTap').onclick=()=>TapTempo.tap();

  document.getElementById('btnResetSettings').onclick=()=>{ScoreTracker.reset();Settings.saveScore();};
  
  document.getElementById('btnFactoryReset').onclick=()=>{
    if(confirm(t('factoryResetConfirm'))){
      localStorage.removeItem(Settings.KEY);
      location.reload();
    }
  };

  

  document.getElementById('btnCalibrate').onclick=async()=>{
    if(!Mic.isRunning()){
      alert("Please start the Mic first to calibrate.");
      return;
    }
    let btn = document.getElementById('btnCalibrate');
    btn.textContent="...";
    btn.disabled = true;
    
    let latencies = [];
    const ctx = getCtx();
    for(let i=0; i<3; i++){
      let startTime = ctx.currentTime + 0.2;
      ClickSynth.play(ctx, startTime, 'accent');
      
      let detectedTime = await new Promise(resolve => {
        let check = setInterval(() => {
          let ampData = Mic.getAmp();
          if(ampData && YIN.rms(ampData) > 0.05) {
            clearInterval(check);
            resolve(ctx.currentTime);
          } else if (ctx.currentTime > startTime + 1.0) {
            clearInterval(check);
            resolve(null);
          }
        }, 5);
      });
      if(detectedTime) latencies.push((detectedTime - startTime)*1000);
      await new Promise(r => setTimeout(r, 500));
    }
    
    btn.textContent="Calibrate";
    btn.disabled = false;
    
    if(latencies.length > 0){
      latencies.sort((a,b)=>a-b);
      let median = latencies[Math.floor(latencies.length/2)];
      App.latencyOffset = Math.round(median);
      document.getElementById('latencyOffset').value = App.latencyOffset;
      document.getElementById('latencyLbl').textContent=App.latencyOffset > 0 ? '+' + App.latencyOffset + 'ms' : App.latencyOffset + 'ms';
      Settings.saveGen();
      alert('Calibration complete: ' + App.latencyOffset + 'ms\n(Note: This requires speakers. Headphones will fail calibration.)');
    } else {
      alert("Calibration failed. Could not detect the click sound. Are you using headphones?");
    }
  };

document.getElementById('btnCustomProg').onclick = () => {
    document.getElementById('customProgTxt').value = Settings.load().customProgText || '';
    document.getElementById('customModal').classList.remove('hidden');
  };
  document.getElementById('btnCustomClose').onclick = () => document.getElementById('customModal').classList.add('hidden');
  document.getElementById('btnCustomApply').onclick = () => {
    const txt = document.getElementById('customProgTxt').value;
    if(applyCustomProgression(txt)){
      let st = Settings.load(); st.customProgText = txt;
      localStorage.setItem(Settings.KEY, JSON.stringify(st));
      document.getElementById('songSel').value = 'custom';
      document.getElementById('chkSingleDrill').checked = false;
      document.getElementById('selSingleRoot').disabled = true;
      document.getElementById('selSingleQual').disabled = true;
      document.getElementById('customModal').classList.add('hidden');
    }
  };

  document.getElementById('chkSingleDrill').onchange = e => {
    let on = e.target.checked;
    document.getElementById('selSingleRoot').disabled = !on;
    document.getElementById('selSingleQual').disabled = !on;
    if(on){
      applySingleChordDrill(document.getElementById('selSingleRoot').value, document.getElementById('selSingleQual').value);
    } else {
      let sv = document.getElementById('songSel').value;
      if(sv==='custom' && Settings.load().customProgText) {
        applyCustomProgression(Settings.load().customProgText);
      } else {
        AppSong=SONG_DB.find(x=>x.id===sv)||SONG_DB[0];
        AppKey=document.getElementById('keySel').value;
        buildProg();UI.buildProgStrip();Settings.loadScore();App.onChordChange({idx:0});Settings.saveGen();
      }
    }
  };
  document.getElementById('selSingleRoot').onchange = e => {
    if(document.getElementById('chkSingleDrill').checked){
      applySingleChordDrill(e.target.value, document.getElementById('selSingleQual').value);
    }
  };
  document.getElementById('selSingleQual').onchange = e => {
    if(document.getElementById('chkSingleDrill').checked){
      applySingleChordDrill(document.getElementById('selSingleRoot').value, e.target.value);
    }
  };

  document.getElementById('btnRhStart').onclick=()=>{
    if(RhythmEngine.isRunning()){
      RhythmEngine.stop(); UI.refreshRhBtn(false);
      exitFS();
    }else{
      if(document.getElementById('chkPlayMode') && document.getElementById('chkPlayMode').checked && !document.fullscreenElement && !document.webkitFullscreenElement) reqFS(document.documentElement);

      RhythmEngine.start({
        onBeat:ev=>App.onBeat(ev),
        onChord:ev=>App.onChordChange(ev),
        onTarget:ev=>App.onTarget(ev),
        onVisual:ev=>UI.triggerVisualCountin(ev.txt),
        onSessionEnd:()=>App.onSessionEnd()
      }, App.testMode);
      UI.refreshRhBtn(true);
    }
  };

  document.getElementById('btnRetroClose').onclick=()=>{
    document.getElementById('retroBg').style.opacity='0';
    document.getElementById('retroBg').style.pointerEvents='none';
  };

  document.getElementById('btnHelp').onclick=()=>UI.showHelp();
  document.getElementById('btnHelpClose').onclick=()=>document.getElementById('helpModal').classList.add('hidden');

  document.getElementById('btnLang').onclick=()=>{
    currentLang=currentLang==='ja'?'en':'ja';
    document.getElementById('btnLang').textContent=currentLang==='ja'?'EN':'JA';
    document.querySelectorAll('[data-i18n]').forEach(el=>{let k=el.dataset.i18n; if(!el.tagName.match(/INPUT|OPTION/)) el.innerHTML=t(k);});
    let cOpt = document.querySelector('#songSel option[value="custom"]');
    if(cOpt) cOpt.textContent = t('customProg');
    UI.resetMissions(); UI.refreshMissions(); Settings.saveGen();
  };

  document.getElementById('btnMic').onclick=async()=>{
    if(Mic.isRunning()){
      Mic.stop();App.detPC=null;
      let b=document.getElementById('btnMic');b.className='btn';b.innerHTML=`&#9654; <span>${t('startMic')}</span>`;
      document.getElementById('mdhdr').className='mdot';
      UI.refreshPitch({note:{name:'-',oct:''},amp:0});UI.refreshFB();
    }else{
      try{
        await Mic.start({onPitch:d=>App.onPitch(d),onSilent:a=>App.onSilent(a)});
        let b=document.getElementById('btnMic');b.className='btn btn-red';b.innerHTML=`&#9209; <span>${t('stopMic')}</span>`;
        document.getElementById('mdhdr').className='mdot on';
      }catch(e){console.error(e);}
    }
  };
});
document.getElementById('btnDiag').onclick=()=>document.getElementById('diagModal').classList.remove('hidden');
document.getElementById('btnDiagClose').onclick=()=>document.getElementById('diagModal').classList.add('hidden');

if (typeof window !== 'undefined') {
  window.ScoreTracker = ScoreTracker;
  window.activeProg = window.activeProg || []; // Needs to be handled properly
  // Since activeProg is let in data.js, it might not be global depending on how it's loaded.
  // Wait, standard <script> creates globals. So it's fine.
}


document.addEventListener('fullscreenchange', handleFs);

document.getElementById('missionBar').addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(()=>{});
  }
});



document.getElementById('btnExitFs').onclick = () => { exitFS(); };
