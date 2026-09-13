const fs = require('fs');
let app = fs.readFileSync('d:\\_web\\autumn leaves\\app.js', 'utf8');

// 1. Update YIN threshold in YIN.detect call
app = app.replace(/YIN\.detect\(buf,sr,0\.12\)/g, "YIN.detect(buf,sr,0.08)");

// 2. Update bandpass bounds in processBuffer
// Old: if(!raw||raw<72||raw>1400)
// New: if(!raw||raw<80||raw>1200)
app = app.replace(/if\(!raw\|\|raw<72\|\|raw>1400\)/g, "if(!raw||raw<80||raw>1200)");

// 3. Add LPF in Mic.start
const oldMicStart = `src=ctx.createMediaStreamSource(stream);an=ctx.createAnalyser();an.fftSize=BUF;src.connect(an);`;
const newMicStart = `src=ctx.createMediaStreamSource(stream);
    
    // LPF (ローパスフィルター) の挿入：ジャズギターの実用音域（最大約1.2kHz）以上の倍音・ノイズをカット
    let lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 1200; // カットオフ周波数
    lpf.Q.value = 0.707; // バターワース特性（通過帯域を平坦に）

    an=ctx.createAnalyser();an.fftSize=BUF;
    
    // ルーティング: Source -> LPF -> Analyser -> Worklet
    src.connect(lpf);
    lpf.connect(an);`;
app = app.replace(oldMicStart, newMicStart);

fs.writeFileSync('d:\\_web\\autumn leaves\\app.js', app, 'utf8');
console.log("DSP improvements injected");
