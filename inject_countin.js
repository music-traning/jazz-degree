const fs = require('fs');
let app = fs.readFileSync('d:\\_web\\autumn leaves\\app.js', 'utf8');

const oldRefresh = /refreshRhBtn\(running\)\{\s*let b=document\.getElementById\('btnRhStart'\);\s*b\.innerHTML=running\?`&#9209; \$\{t\('stop'\)\}`:`&#9654; \$\{t\('start'\)\}`;\s*b\.className=running\?'btn btn-red':'btn btn-grn';\s*\}/;

const newRefresh = `refreshRhBtn(running){
    let b=document.getElementById('btnRhStart');
    b.innerHTML=running?\`&#9209; \${t('stop')}\`:\`&#9654; \${t('start')}\`;
    b.className=running?'btn btn-red':'btn btn-grn';
    if(!running) {
      document.getElementById('countinBg').style.opacity='0';
      document.getElementById('countinBg').style.pointerEvents='none';
    }
  }`;

app = app.replace(oldRefresh, newRefresh);
fs.writeFileSync('d:\\_web\\autumn leaves\\app.js', app, 'utf8');
console.log("Injected countin reset successfully");
