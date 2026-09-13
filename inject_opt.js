const fs = require('fs');
let app = fs.readFileSync('d:\\_web\\autumn leaves\\app.js', 'utf8');

// --- 1. Modify Filters in Mic.start ---
const oldFilters = /let lpf = ctx\.createBiquadFilter\(\);[\s\S]*?lpf\.connect\(an\);/m;
const newFilters = `// HPF (ハイパスフィルター): 80Hz以下の低周波ノイズ（エアコン等）をカット
    let hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 75; // 6弦開放(82.4Hz)付近
    hpf.Q.value = 0.707;

    // LPF (ローパスフィルター): 1.2kHz以上の高次倍音やピッキングノイズをカット
    let lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 1200;
    lpf.Q.value = 0.707;

    an=ctx.createAnalyser();an.fftSize=BUF;
    
    // ルーティング: Source -> HPF -> LPF -> Analyser -> Worklet
    src.connect(hpf);
    hpf.connect(lpf);
    lpf.connect(an);`;
app = app.replace(oldFilters, newFilters);

// --- 2. Add Throttle for UI rendering ---
const throttleCode = `
// --- Throttle/Debounce for Rendering (UI/DOM Updates) ---
const UIRenderer = {
  lastRender: 0,
  interval: 64, // ~15fps (64ms). ジャズテンポ(120-200BPM)において、16分音符の最短が約75msのため、64ms間隔の描画は視覚的なレスポンスと発熱抑制の最適解。
  state: {
    amp: 0,
    pitchData: null,
    silent: true,
    dirty: false
  },
  loop(timestamp) {
    requestAnimationFrame((t) => UIRenderer.loop(t));
    if (!UIRenderer.state.dirty) return;
    if (timestamp - UIRenderer.lastRender < UIRenderer.interval) return;
    
    UIRenderer.lastRender = timestamp;
    UIRenderer.state.dirty = false;
    
    // Execute DOM updates
    UI.refreshVU(UIRenderer.state.amp);
    if (!UIRenderer.state.silent && UIRenderer.state.pitchData) {
       UI.logDiag(UIRenderer.state.pitchData);
       document.getElementById('pNote').textContent = UIRenderer.state.pitchData.note.name + UIRenderer.state.pitchData.note.oct;
       document.getElementById('pNote').classList.remove('sil');
       document.getElementById('pHz').textContent = UIRenderer.state.pitchData.freq.toFixed(1) + ' Hz';
       FB.render(); // SVG rendering is heavy
    } else {
       let ne=document.getElementById('pNote');
       if(!ne.classList.contains('sil')){ne.textContent='\u2014';ne.classList.add('sil');document.getElementById('pHz').textContent='\u2014 Hz';}
    }
  }
};
requestAnimationFrame((t) => UIRenderer.loop(t));
`;

// Inject UIRenderer before App object
app = app.replace("const App={", throttleCode + "\nconst App={");

// Modify App.onPitch and App.onSilent to use UIRenderer instead of direct UI calls
const oldOnPitch = /onPitch\(\{raw,freq,note,amp,audioTime\}\)\{[\s\S]*?UI\.refreshFB\(\);\s*\}/;
const newOnPitch = `onPitch({raw,freq,note,amp,audioTime}){
    this.detPC=note.pc;
    ScoringEngine.onPitch(note,audioTime); // Scoring must run synchronously (unthrottled) for latency accuracy
    
    UIRenderer.state.pitchData = {raw,freq,note,amp};
    UIRenderer.state.amp = amp;
    UIRenderer.state.silent = false;
    UIRenderer.state.dirty = true;
  }`;
app = app.replace(oldOnPitch, newOnPitch);

const oldOnSilent = /onSilent\(amp\)\{\s*UI\.refreshVU\(amp\);\s*this\.detPC=null;\s*\}/;
const newOnSilent = `onSilent(amp){
    this.detPC=null;
    UIRenderer.state.amp = amp;
    UIRenderer.state.silent = true;
    UIRenderer.state.dirty = true;
  }`;
app = app.replace(oldOnSilent, newOnSilent);

fs.writeFileSync('d:\\_web\\autumn leaves\\app.js', app, 'utf8');
console.log("Filters and UI Throttle injected");
