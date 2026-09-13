const fs = require('fs');
let app = fs.readFileSync('d:\\_web\\autumn leaves\\app.js', 'utf8');

// 1. Inject pcHist variable
app = app.replace(/let hist=\[\];/, "let hist=[];\n  let pcHist=[];");

// 2. Replace processBuffer
const oldProcess = /function processBuffer\(t, buf, sr\) \{[\s\S]*?cb\.onPitch&&cb\.onPitch\(\{raw,freq,note,amp,audioTime:lastAttackTime \|\| \(t\+BUF\/\(2\*sr\)\)\}\);\s*\}/;
const newProcess = `function processBuffer(t, buf, sr) {
      const amp=YIN.rms(buf);
      const NOISE_GATE = 0.025; // 厳格化したノイズ閾値
      if(amp > NOISE_GATE && (lastAmp < NOISE_GATE || amp > lastAmp * 1.5)) {
        lastAttackTime = t;
      }
      lastAmp = amp;
      if(amp < NOISE_GATE){
        pcHist = []; // ミュート時にバッファをリセット
        cb.onSilent&&cb.onSilent(amp);return;
      }
      const raw=YIN.detect(buf,sr,0.08);
      if(!raw||raw<80||raw>1200){
        pcHist = [];
        cb.onSilent&&cb.onSilent(amp);return;
      }
      hist.push(raw);if(hist.length>3)hist.shift();
      const s=[...hist].sort((a,b)=>a-b), freq=s.length%2?s[s.length>>1]:(s[(s.length>>1)-1]+s[s.length>>1])/2;
      const note=Notes.fromFreq(freq);if(!note)return;
      
      // ヒステリシス（安定化バッファ）処理: 3フレーム連続でPitch Classが一致した場合のみ確定
      pcHist.push(note.pc);
      if(pcHist.length > 3) pcHist.shift();
      if(pcHist.length < 3 || pcHist[0] !== pcHist[1] || pcHist[1] !== pcHist[2]) {
        return; // 安定するまで処理をスキップ
      }

      cb.onPitch&&cb.onPitch({raw,freq,note,amp,audioTime:lastAttackTime || (t+BUF/(2*sr))});
  }`;
app = app.replace(oldProcess, newProcess);

// 3. Replace onPitch in ScoringEngine
const oldOnPitch = /function onPitch\(note,audioTime\)\{[\s\S]*?const posOK=checkFretConstraint\(note\.midi\);\s*if\(!best\|\|Math\.abs\(err\)<Math\.abs\(best\.err\)\) best=\{err,dIv,posOK\};\s*\}/;
const newOnPitch = `function onPitch(note,audioTime){
    if(!testMode||!target||scored)return;
    const {WIN}=getTolerances();
    const err=(audioTime - App.latencyOffset/1000)-target.beatTime;
    if(Math.abs(err)>WIN)return;
    
    // 度数判定における「オクターブの無視」（Pitch Classへの丸め）
    const dIv=((note.pc-target.chordRoot)+12)%12;
    if(dIv!==target.iv)return;
    
    // 倍音によるオクターブエラーで意図しないポジション違反（MISS）になるのを防ぐため、
    // ピッチクラス（度数）が合っていれば無条件で正解ポジションとして許容する
    const posOK = true; 
    
    if(!best||Math.abs(err)<Math.abs(best.err)) best={err,dIv,posOK};
  }`;
app = app.replace(oldOnPitch, newOnPitch);

fs.writeFileSync('d:\\_web\\autumn leaves\\app.js', app, 'utf8');
console.log("UX & DSP fallbacks injected");
