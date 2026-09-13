const fs = require('fs');
let data = fs.readFileSync('d:\\_web\\autumn leaves\\data.js', 'utf8');

const jaOld = `Startを押すと、指定した進行（Progression）とBPMでクリックが再生されます。`;
const jaNew = `Startを押すと、指定した進行（Progression）とBPMでクリックが再生されます。さらに自動的に「Play Mode（没入型全画面モード）」に移行し、設定項目が隠れて視認性が最大化されます（元の設定画面に戻るにはEscキーを押してください）。`;
data = data.replace(jaOld, jaNew);

const enOld = `Press Start to play the click track along with the chord progression.`;
const enNew = `Press Start to play the click track along with the chord progression. This will automatically transition into "Play Mode" (immersive fullscreen) to maximize visibility by hiding all settings. (Press Esc to return to the setup screen).`;
data = data.replace(enOld, enNew);

fs.writeFileSync('d:\\_web\\autumn leaves\\data.js', data, 'utf8');
console.log("Injected I18N successfully");
