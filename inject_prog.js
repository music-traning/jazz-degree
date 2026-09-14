const fs = require('fs');
let app = fs.readFileSync('d:\\_web\\autumn leaves\\app.js', 'utf8');

// 1. Update UIRenderer to include chordStartTime and Unthrottled render
const oldLoop = /loop\(timestamp\) \{[\s\S]*?requestAnimationFrame\(\(t\) => UIRenderer\.loop\(t\)\);\s*if \(\!UIRenderer\.state\.dirty\) return;/;
const newLoop = `loop(timestamp) {
    requestAnimationFrame((t) => UIRenderer.loop(t));

    // --- 1. UNTHROTTLED (毎フレーム): プログレスバーの滑らかな更新 ---
    if (UIRenderer.state.chordStartTime > 0 && typeof RhythmEngine !== 'undefined' && RhythmEngine.isRunning()) {
        let ctx = getCtx();
        if (ctx && ctx.state === 'running') {
            let elapsed = ctx.currentTime - UIRenderer.state.chordStartTime;
            let dur = (60 / App.bpm) * 4 * App.barsPerChord;
            let p = Math.max(0, Math.min(1, Math.max(0, elapsed) / dur)); // Clamp 0.0 - 1.0
            
            let bar = document.getElementById('chordProgBar');
            if (bar) {
                // transformを使ってGPUアクセラレーションを効かせ、負荷をゼロにする
                bar.style.transform = \`scaleX(\${p})\`;
                // 80%を超えたら視覚的アラート（明るい色＋グロウ効果）
                if (p > 0.8) {
                    bar.style.background = '#ffffff';
                    bar.style.boxShadow = '0 0 12px #ffffff';
                } else {
                    bar.style.background = 'var(--accent)';
                    bar.style.boxShadow = 'none';
                }
            }
        }
    } else {
        let bar = document.getElementById('chordProgBar');
        if(bar) { bar.style.transform = \`scaleX(0)\`; bar.style.boxShadow = 'none'; }
    }

    // --- 2. THROTTLED (64ms間隔): 重いDOM/SVG更新 ---
    if (!UIRenderer.state.dirty) return;`;
app = app.replace(oldLoop, newLoop);
app = app.replace("silent: true,", "silent: true,\n    chordStartTime: 0,");

// 2. Update App.onChordChange to set chordStartTime
const oldOnChord = /onChordChange\(ev\)\{/;
const newOnChord = `onChordChange(ev){\n    UIRenderer.state.chordStartTime = ev.time;`;
app = app.replace(oldOnChord, newOnChord);

// 3. Reset chordStartTime on SessionEnd
const oldOnSessionEnd = /onSessionEnd\(\)\{/;
const newOnSessionEnd = `onSessionEnd(){\n    UIRenderer.state.chordStartTime = 0;`;
app = app.replace(oldOnSessionEnd, newOnSessionEnd);

fs.writeFileSync('d:\\_web\\autumn leaves\\app.js', app, 'utf8');
console.log("Progress bar logic injected");
