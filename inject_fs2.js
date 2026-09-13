const fs = require('fs');
let app = fs.readFileSync('d:\\_web\\autumn leaves\\app.js', 'utf8');

// 1. Add fsUtils
const fsUtils = `
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
`;

// Replace the old fullscreenchange listener
const oldFsRegex = /document\.addEventListener\('fullscreenchange', \(\) => \{[\s\S]*?\}\);/g;
app = app.replace(oldFsRegex, "document.addEventListener('fullscreenchange', handleFs);");
app = fsUtils + '\n' + app;

// 2. Replace document.exitFullscreen / requestFullscreen usages
app = app.replace(/if\(document\.fullscreenElement\) document\.exitFullscreen\(\)\.catch\(\(\)=>\{\}\);/g, "exitFS();");
app = app.replace(/if\(document\.getElementById\('chkPlayMode'\) && document\.getElementById\('chkPlayMode'\)\.checked && !document\.fullscreenElement\) document\.documentElement\.requestFullscreen\(\)\.catch\(\(\)=>\{\}\);/g, "if(document.getElementById('chkPlayMode') && document.getElementById('chkPlayMode').checked && !document.fullscreenElement && !document.webkitFullscreenElement) reqFS(document.documentElement);");

// 3. Update App.onSessionEnd to call exitFS()
const oldSessionEnd = /onSessionEnd\(\)\{\s*RhythmEngine\.stop\(\);\s*UI\.refreshRhBtn\(false\);\s*UI\.showRetroResult\(\);\s*\}/;
const newSessionEnd = `onSessionEnd(){
    RhythmEngine.stop();
    UI.refreshRhBtn(false);
    exitFS();
    UI.showRetroResult();
  }`;
app = app.replace(oldSessionEnd, newSessionEnd);

// Write it back
fs.writeFileSync('d:\\_web\\autumn leaves\\app.js', app, 'utf8');
console.log("Injected FS robustly");
