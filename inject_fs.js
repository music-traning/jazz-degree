const fs = require('fs');
let app = fs.readFileSync('d:\\_web\\autumn leaves\\app.js', 'utf8');

// 1. Add fullscreenchange listener
const fsEvt = `
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    document.body.classList.add('play-mode-active');
  } else {
    document.body.classList.remove('play-mode-active');
  }
  if (typeof UI !== 'undefined' && UI.refreshFB) UI.refreshFB();
});
`;
app = app + '\n' + fsEvt;

// 2. Modify btnRhStart
const oldStartBtnRegex = /document\.getElementById\('btnRhStart'\)\.onclick=\(\)=>\{[\s\S]*?RhythmEngine\.stop\(\); UI\.refreshRhBtn\(false\);\s*\}else\{/;
const newStartBtn = `document.getElementById('btnRhStart').onclick=()=>{
    if(RhythmEngine.isRunning()){
      RhythmEngine.stop(); UI.refreshRhBtn(false);
      if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    }else{
      if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
`;
app = app.replace(oldStartBtnRegex, newStartBtn);

// 3. Modify FB.render()
const oldFbRenderRegex = /dg\.innerHTML='';hg\.innerHTML='';\s*if\(!activeProg\.length\)return;/;
const newFbRender = `dg.innerHTML='';hg.innerHTML='';
    if (document.body.classList.contains('play-mode-active')) {
      let minF = App.minFret, maxF = App.maxFret;
      if(maxF > 15) maxF = 15;
      if(minF < 0) minF = 0;
      let pad = 10;
      let minX = minF === 0 ? 0 : NX + (minF - 1) * FW - pad;
      let maxX = NX + maxF * FW + pad;
      svg.setAttribute('viewBox', \`\${minX} 0 \${maxX - minX} 185\`);
    } else {
      svg.setAttribute('viewBox', '0 0 815 185');
    }
    if(!activeProg.length)return;`;
app = app.replace(oldFbRenderRegex, newFbRender);

// 4. Modify ScoringEngine.onPitch
const oldOnPitchRegex = /if\(g\)\{\s*ScoreTracker\.add\(g\);\s*UI\.flashScore\(g,note\);\s*this\.answered=true;\s*\}/;
const newOnPitch = `if(g){
        ScoreTracker.add(g); UI.flashScore(g,note); this.answered=true;
        if(g==='EXCELLENT'||g==='GOOD'){
          document.body.classList.add('glow-success');
          setTimeout(()=>document.body.classList.remove('glow-success'), 150);
        }
      }`;
app = app.replace(oldOnPitchRegex, newOnPitch);

fs.writeFileSync('d:\\_web\\autumn leaves\\app.js', app, 'utf8');
console.log("Injected fullscreen logic successfully");
