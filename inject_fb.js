const fs = require('fs');
let app = fs.readFileSync('d:\\_web\\autumn leaves\\app.js', 'utf8');

const oldFinalize = `    ScoreTracker.record(result);
    UI.showFeedback(result);`;
const newFinalize = `    ScoreTracker.record(result);
    UI.showFeedback(result);
    if(result.grade==='EXCELLENT' || result.grade==='GOOD'){
      document.body.classList.add('glow-success');
      setTimeout(()=>document.body.classList.remove('glow-success'), 150);
    }`;

app = app.replace(oldFinalize, newFinalize);
fs.writeFileSync('d:\\_web\\autumn leaves\\app.js', app, 'utf8');
console.log("Injected feedback successfully");
