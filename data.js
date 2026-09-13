/* ================================================================
   ★ I18N & TEXTS
   ================================================================ */
const I18N={
  ja:{
    startMic:'Mic 開始', stopMic:'Mic 停止', listening:'検出中',
    currentChord:'現在のコード', pitchDetection:'ピッチ検出',
    sessionScore:'セッションスコア', progression:'プログレッション',
    practice:'練習', test:'テスト', start:'スタート', stop:'ストップ',
    fretConstraint:'フレット制約', missionTargetOnly:'Mission Target Only (課題音のみ表示)',
    degreeBase:'度数基準 (Degree Base)',
    customProg:'カスタム進行', customProgTitle:'カスタム進行', customParseError:'認識できないコードがあります',
    factoryResetConfirm:'すべての設定とスコア履歴を完全に初期化します。よろしいですか？',
    excellent:'EXCELLENT ✓', good:'GOOD ✓', late:'LATE', miss:'MISS ✗', wrong_pos:'WRONG POS',
    missionWait:'TestモードにしてStartを押してください',
    helpUsage:'使い方', helpShortcuts:'ショートカット', barsChord:'小節 / コード',
    helpBody:`
      <h3>1. Concept (コンセプト)</h3>
      <p>Jazz Guitar Trainerは、単なるメトロノームやバッキングトラックではありません。「指板の視覚化（インターバルの把握）」と「シビアなタイム感」を同時に鍛えるための、実践的なトレーニングツールです。</p>

      <h3>2. Basic Usage (基本操作)</h3>
      <ul>
        <li><strong>Start Mic</strong>: マイクを許可し、ギターの単音ピッチ検出を開始します。</li>
        <li><strong>Rhythm Engine</strong>: Startを押すと、指定した進行（Progression）とBPMでクリックが再生されます。さらに自動的に「Play Mode（没入型全画面モード）」に移行し、設定項目が隠れて視認性が最大化されます（元の設定画面に戻るにはEscキーを押してください）。</li>
        <li><strong>Test Mode</strong>: 現在のコードに対して「弾くべき度数（ターゲット）」がNOWパネルに出題されます。正しいタイミング・正しい音程・正しいポジションで弾くとスコアが加算されます。</li>
      </ul>

      <h3>3. Difficulty Levels (難易度について)</h3>
      <ul>
        <li><strong>Beginner (初級)</strong>: 各コードの「3度 (3rd)」のみが出題されます。コードの響きを決定づける最重要音（ガイドトーン）を瞬時に見つける基礎を作ります。</li>
        <li><strong>Intermediate (中級)</strong>: 「3度」と「7度」がランダムに出題されます。ジャズアドリブの核となる2つのガイドトーンを確実に行き来する力を養います。</li>
        <li><strong>Advanced (上級)</strong>: 9th, 11th, 13th などの「テンションノート」がターゲットに加わります。高度な色彩感を持つ音を正確に狙い撃ちする難易度です。</li>
      </ul>
      <p style="color:var(--tx2);font-size:11px;margin-top:-8px;">※タイミング判定の厳しさは全レベル共通です。</p>

      <h3>4. Advanced Settings (高度な設定)</h3>
      <ul>
        <li><strong>Fret Constraint (ポジション縛り)</strong>: 指定したフレット範囲（例: 5F〜8F）でのみ正解判定とする機能です。実践における「ポジション移動を最小限に抑えたスムーズなボイシング/アドリブ」を強制的に鍛えることができます。</li>
        <li><strong>Degree Base (Chord / Key)</strong>: 度数の計算基準を切り替えます。
          <br>・<em>Chord (デフォルト)</em>: 現在のコードのルートを「R」として度数を表示します。コードトーンの把握に最適です。
          <br>・<em>Key</em>: 曲全体のキー（主音）を「R」として表示します。進行全体を通じたダイアトニックな和声機能（例：Dm7のF音を、Dに対するb3ではなく、Cメジャーキーに対する11th/4thとして捉える）の認識力が劇的に向上します。</li>
        <li><strong>Latency Offset / Calibration</strong>: OSやハードウェアの音声遅延を補正します。「Calibrate」ボタンを押すと、クリック音をマイクで拾い、スピーカーとマイク間の往復遅延を自動計測して補正値を設定します（※スピーカー使用時のみ有効です。ヘッドホンの場合は手動でスライダーを調整してください）。</li>
      </ul>

      <h3>5. Practice Tips (おすすめの練習法)</h3>
      <ul>
        <li><strong>CAGEDシステム × Fret Constraint</strong>: Fret Constraintを特定のブロック（例: 5〜8F）に固定し、コードが変わっても絶対にそのポジションから手を動かさずにターゲット音を探す練習をしてください。指板上の暗闇が徐々に晴れていくはずです。</li>
        <li><strong>シビアなタイム感の育成 (Click: 4-1)</strong>: Click Patternを「4-1 (4拍目の裏のみ)」に設定し、BPMを60以下に落としてみてください。極端に少ないガイド音の中で自分の体内時計だけでビートをキープする、プロレベルのタイム感が養われます。</li>
      </ul>
    `,
    retroMsgs:[
      "Nice try! その調子で続けましょう",
      "Good job! リズムキープが安定してきましたね",
      "Great! 次は少しBPMを上げてみましょう",
      "素晴らしい！ミッションへの反応が早くなっています",
      "お疲れ様！反復練習が確実に力になっていますよ",
      "ガイドトーンは見えていますか？意識するだけで変わりますよ",
      "裏拍（2拍目・4拍目）のクリックを感じて弾いてみましょう",
      "息をするのを忘れないで！リラックスが上達の鍵です",
      "メトロノームは親友です。音をよく聴きましょう",
      "たまにはコーヒーブレイクも必要ですよ",
      "指板の形（CAGED）が見えてきましたね！",
      "ミスを恐れないで！ジャズはミスから新しいフレーズが生まれます",
      "ポジション縛り練習は、実践で必ず活きてきます",
      "コードの「度数」で考える癖がついてきましたね",
      "テンションノートの響きを楽しみましょう",
      "毎日5分の練習が、週末の1時間の練習より効果的です",
      "焦らなくて大丈夫。着実に耳と指が繋がってきています",
      "頭で考える前に、指が動くようになるまで反復あるのみ！",
      "1拍目（ダウンビート）を確実に捉える感覚を研ぎ澄ませて",
      "弾いた音の響き（色彩）をしっかり味わってください",
      "今日の練習は裏切りません。Good play!"
    ]
  },
  en:{
    startMic:'Start Mic', stopMic:'Stop Mic', listening:'Listening',
    currentChord:'Current Chord', pitchDetection:'Pitch Detection',
    sessionScore:'Session Score', progression:'Progression',
    practice:'Practice', test:'Test', start:'Start', stop:'Stop',
    fretConstraint:'Fret Constraint', missionTargetOnly:'Mission Target Only',
    degreeBase:'Degree Base',
    customProg:'Custom Progression', customProgTitle:'Custom Progression', customParseError:'Unrecognized chord(s)',
    factoryResetConfirm:'Are you sure you want to completely reset all settings and score history?',
    excellent:'EXCELLENT ✓', good:'GOOD ✓', late:'LATE', miss:'MISS ✗', wrong_pos:'WRONG POS',
    missionWait:'Switch to Test mode and press Start',
    helpUsage:'How to use', helpShortcuts:'Shortcuts', barsChord:'Bars / Chord',
    helpBody:`
      <h3>1. Concept</h3>
      <p>Jazz Guitar Trainer is not just a metronome or backing track. It is a practical training tool designed to simultaneously train your "fretboard visualization (interval recognition)" and "strict time feel."</p>

      <h3>2. Basic Usage</h3>
      <ul>
        <li><strong>Start Mic</strong>: Enable your microphone for real-time pitch detection.</li>
        <li><strong>Rhythm Engine</strong>: Press Start to play the click track along with the chord progression. This will automatically transition into "Play Mode" (immersive fullscreen) to maximize visibility by hiding all settings. (Press Esc to return to the setup screen).</li>
        <li><strong>Test Mode</strong>: The NOW panel will dictate a target interval for the current chord. Play the correct pitch, at the right time, in the right position to score points.</li>
      </ul>

      <h3>3. Difficulty Levels</h3>
      <ul>
        <li><strong>Beginner</strong>: Only the "3rd" of each chord is targeted. This builds the fundamental skill of instantly locating the most crucial note (guide tone) that determines the chord's quality.</li>
        <li><strong>Intermediate</strong>: Targets alternate randomly between the "3rd" and "7th". This trains your ability to navigate the two most essential guide tones, which form the core of jazz improvisation.</li>
        <li><strong>Advanced</strong>: Introduces "tension notes" (9th, 11th, 13th) to the target pool. This is a professional-level challenge where you must nail colorful, complex intervals.</li>
      </ul>
      <p style="color:var(--tx2);font-size:11px;margin-top:-8px;">* Timing tolerance is consistent across all levels.</p>

      <h3>4. Advanced Settings</h3>
      <ul>
        <li><strong>Fret Constraint</strong>: Restricts valid answers to a specific fret range (e.g., 5th-8th fret). This forces you to practice smooth voice leading and improvisation without relying on familiar root shapes, minimizing hand movement.</li>
        <li><strong>Degree Base (Chord vs. Key)</strong>: Toggles how intervals are calculated.
          <br>・<em>Chord (Default)</em>: Calculates intervals relative to the current chord's root. Great for basic chord tone memorization.
          <br>・<em>Key</em>: Calculates intervals relative to the song's global key. This drastically improves your understanding of diatonic harmonic function (e.g., seeing the F note in Dm7 not just as a b3, but as the 4th/11th of the global C major key).</li>
        <li><strong>Latency Offset / Calibration</strong>: Compensates for hardware audio latency. Press "Calibrate" to automatically measure and set the round-trip delay between your speakers and microphone using a test click (Note: requires speakers, will not work with headphones. Adjust the slider manually if using headphones).</li>
      </ul>

      <h3>5. Practice Tips</h3>
      <ul>
        <li><strong>CAGED System × Fret Constraint</strong>: Lock the Fret Constraint to a specific block (like frets 5-8) and force yourself to find all target notes without shifting your hand when the chords change. This will rapidly illuminate the "dark areas" of your fretboard.</li>
        <li><strong>Building Professional Time Feel (Click: 4-1)</strong>: Set the Click Pattern to "4-1 (the 'and' of beat 4)" and lower the BPM to 60 or below. Playing accurately with such sparse metronome guidance will develop an ironclad internal clock.</li>
      </ul>
    `,
    retroMsgs:[
      "Nice try! Keep up the good work.",
      "Good job! Your rhythm is getting very stable.",
      "Great! Try raising the BPM a little bit next time.",
      "Awesome! Your reaction time to the missions is getting faster.",
      "Well done! Repetition is definitely paying off.",
      "Can you see the guide tones? Just visualizing them helps.",
      "Try to feel the click on the backbeat (beats 2 & 4).",
      "Don't forget to breathe! Relaxation is key to improvement.",
      "The metronome is your best friend. Listen to it closely.",
      "Sometimes a coffee break is just what you need.",
      "The CAGED fretboard shapes are starting to connect!",
      "Don't fear mistakes! In jazz, mistakes are just new phrases waiting to happen.",
      "Position constraint practice will pay huge dividends in real sessions.",
      "You're getting used to thinking in scale degrees. Keep it up!",
      "Enjoy the colorful sound of those tension notes.",
      "5 minutes of practice every day beats 1 hour on the weekend.",
      "No need to rush. Your ears and fingers are steadily connecting.",
      "Repetition is the key until your fingers move before you even think!",
      "Sharpen your sense of locking into the downbeat.",
      "Savor the unique 'color' and resonance of each note you play.",
      "Today's practice will never betray you. Good play!"
    ]
  }
};
let currentLang='en';
function t(key){ return (I18N[currentLang]||I18N.en)[key]||key; }

/* ================================================================
   ★ MUSIC DATA & TRANSPOSITION
   ================================================================ */
const KEYS=['C','D\u266d','D','E\u266d','E','F','G\u266d','G','A\u266d','A','B\u266d','B'];
const CHORD_QUALITIES={
  'm7':   {tones:[0,3,7,10], tens:[2,5,9],   col:'#38d660'},
  '7':    {tones:[0,4,7,10], tens:[2,5,9],   col:'#4da8ff'},
  'M7':   {tones:[0,4,7,11], tens:[2,6,9],   col:'#e8c128'},
  'm7b5': {tones:[0,3,6,10], tens:[2,5,8],   col:'#f87a35'},
  'dim7': {tones:[0,3,6,9],  tens:[2,5,8,11],col:'#f055c0'},
  '6':    {tones:[0,4,7,9],  tens:[2,6,11],  col:'#e8c128'},
  'm6':   {tones:[0,3,7,9],  tens:[2,5,11],  col:'#38d660'},
  'sus4': {tones:[0,5,7],    tens:[2,9,10],  col:'#4da8ff'},
  '7sus4':{tones:[0,5,7,10], tens:[2,9],     col:'#4da8ff'},
  'add9': {tones:[0,2,4,7],  tens:[6,9,11],  col:'#e8c128'}
};
const SONG_DB=[
  {id:'autumn', title:'Autumn Leaves', key:'B\u266d', prog:['Cm7','F7','B\u266dM7','E\u266dM7','Am7b5','D7','Gm7','Gm7', 'Cm7','F7','B\u266dM7','E\u266dM7','Am7b5','D7','Gm7','Gm7', 'Am7b5','D7','Gm7','Gm7','Cm7','F7','B\u266dM7','E\u266dM7', 'Am7b5','D7','Gm7','Gm7'], sections:[{lbl:'A1',s:0,n:8},{lbl:'A2',s:8,n:8},{lbl:'B',s:16,n:8},{lbl:'A3',s:24,n:4}]},
  {id:'blues', title:'Jazz Blues', key:'F', prog:['F7','B\u266d7','F7','F7','B\u266d7','Bdim7','F7','D7','Gm7','C7','F7','C7'], sections:[{lbl:'Theme',s:0,n:12}]},
  {id:'ii_v_i_maj', title:'Major II-V-I', key:'C', prog:['Dm7','G7','CM7','CM7'], sections:[{lbl:'Loop',s:0,n:4}]},
  {id:'ii_v_i_min', title:'Minor II-V-I', key:'C', prog:['Dm7b5','G7','Cm7','Cm7'], sections:[{lbl:'Loop',s:0,n:4}]},
  {id:'fly_me', title:'Fly Me To The Moon', key:'C', prog:['Am7','Dm7','G7','CM7','FM7','Bm7b5','E7','Am7', 'Am7','Dm7','G7','CM7','FM7','Bm7b5','E7','Am7', 'Dm7','G7','CM7','FM7','Bm7b5','E7','Am7','A7', 'Dm7','G7','CM7','FM7','Bm7b5','E7','Am7','Am7'], sections:[{lbl:'A1',s:0,n:8},{lbl:'A2',s:8,n:8},{lbl:'B',s:16,n:8},{lbl:'C',s:24,n:8}]},
  {id:'all_things', title:'All The Things You Are', key:'A\u266d', prog:['Fm7','B\u266dm7','E\u266d7','A\u266dM7','D\u266dM7','G7','CM7','CM7', 'Cm7','Fm7','B\u266d7','E\u266dM7','A\u266dM7','D7','GM7','GM7', 'Am7','D7','GM7','GM7','F\u266fm7','B7','EM7','C7', 'Fm7','B\u266dm7','E\u266d7','A\u266dM7','D\u266dM7','D\u266dm7','Cm7','Bdim7','B\u266dm7','E\u266d7','A\u266dM7','A\u266dM7'], sections:[{lbl:'A1',s:0,n:8},{lbl:'A2',s:8,n:8},{lbl:'B',s:16,n:8},{lbl:'A3',s:24,n:12}]},
  {id:'blue_bossa', title:'Blue Bossa', key:'Cm', prog:['Cm7','Cm7','Fm7','Fm7','Dm7b5','G7','Cm7','Cm7', 'E\u266dm7','A\u266d7','D\u266dM7','D\u266dM7','Dm7b5','G7','Cm7','Cm7'], sections:[{lbl:'Theme',s:0,n:16}]},
  {id:'a_train', title:'Take The A Train', key:'C', prog:['CM7','CM7','D7','D7','Dm7','G7','CM7','CM7', 'CM7','CM7','D7','D7','Dm7','G7','CM7','CM7', 'FM7','FM7','FM7','FM7','D7','D7','Dm7','G7', 'CM7','CM7','D7','D7','Dm7','G7','CM7','CM7'], sections:[{lbl:'A1',s:0,n:8},{lbl:'A2',s:8,n:8},{lbl:'B',s:16,n:8},{lbl:'A3',s:24,n:8}]},
  {id:'satin_doll', title:'Satin Doll', key:'C', prog:['Dm7','G7','Em7','A7', 'Am7','D7','CM7','A7', 'Dm7','G7','Em7','A7', 'Am7','D7','CM7','CM7', 'Gm7','C7','FM7','FM7', 'Am7','D7','G7','G7', 'Dm7','G7','Em7','A7', 'Am7','D7','CM7','CM7'], sections:[{lbl:'A1',s:0,n:8},{lbl:'A2',s:8,n:8},{lbl:'B',s:16,n:8},{lbl:'A3',s:24,n:8}]},
  {id:'summertime', title:'Summertime', key:'Am', prog:['Am7','Bm7b5','Am7','Bm7b5','Am7','Am7','Dm7','E7', 'Am7','Bm7b5','Am7','Bm7b5','CM7','F7','E7','E7'], sections:[{lbl:'A1',s:0,n:8},{lbl:'A2',s:8,n:8}]},
  {id:'wine_roses', title:'Days of Wine and Roses', key:'F', prog:['FM7','E\u266d7','D7','D7','Gm7','Gm7','B\u266dm7','E\u266d7', 'FM7','Am7','Dm7','Gm7','Em7b5','A7','Dm7','G7', 'FM7','E\u266d7','D7','D7','Gm7','Gm7','B\u266dm7','E\u266d7', 'FM7','Am7','Dm7','Gm7','Gm7','C7','FM7','FM7'], sections:[{lbl:'A',s:0,n:16},{lbl:'B',s:16,n:16}]},
  {id:'another_you', title:'There Will Never Be Another You', key:'E\u266d', prog:['E\u266dM7','E\u266dM7','Dm7b5','G7','Cm7','Cm7','B\u266dm7','E\u266d7', 'A\u266dM7','D\u266d7','E\u266dM7','Cm7','F7','F7','Fm7','B\u266d7', 'E\u266dM7','E\u266dM7','Dm7b5','G7','Cm7','Cm7','B\u266dm7','E\u266d7', 'A\u266dM7','D\u266d7','E\u266dM7','Am7b5','Fm7','B\u266d7','E\u266dM7','E\u266dM7'], sections:[{lbl:'A',s:0,n:16},{lbl:'B',s:16,n:16}]},
  {id:'prince', title:'Someday My Prince Will Come', key:'B\u266d', prog:['B\u266dM7','D7','E\u266dM7','G7','Cm7','G7','Cm7','F7', 'Dm7','D\u266ddim7','Cm7','F7','Dm7','G7','Cm7','F7', 'B\u266dM7','D7','E\u266dM7','G7','Cm7','G7','Cm7','F7', 'Dm7','D\u266ddim7','Cm7','F7','Cm7','F7','B\u266dM7','B\u266dM7'], sections:[{lbl:'A1',s:0,n:16},{lbl:'A2',s:16,n:16}]},
  {id:'orpheus', title:'Black Orpheus', key:'Am', prog:['Am7','Bm7b5','Am7','Am7','Dm7','G7','CM7','CM7', 'Dm7','G7','CM7','FM7','Bm7b5','E7','Am7','E7', 'Am7','Bm7b5','Am7','Am7','Dm7','G7','CM7','Em7b5', 'Dm7','Dm7','Am7','Am7','Bm7b5','E7','Am7','Am7'], sections:[{lbl:'A1',s:0,n:16},{lbl:'A2',s:16,n:16}]},
  {id:'cantaloupe', title:'Cantaloupe Island', key:'Fm', prog:['Fm7','Fm7','Fm7','Fm7','D\u266d7','D\u266d7','D\u266d7','D\u266d7','Dm7','Dm7','Dm7','Dm7','Fm7','Fm7','Fm7','Fm7'], sections:[{lbl:'Theme',s:0,n:16}]},
  {id:'watermelon', title:'Watermelon Man', key:'F', prog:['F7','F7','F7','F7','B\u266d7','B\u266d7','F7','F7','C7','B\u266d7','C7','B\u266d7','C7','B\u266d7','F7','F7'], sections:[{lbl:'Theme',s:0,n:16}]}
];
function keyToPc(kStr){ return Math.max(0,KEYS.indexOf(kStr)); }
function parseChordStr(str){
  let m=str.match(/^([A-G][\u266d#b\u266f]?)(.*)$/);
  if(!m)return {root:0,q:'M7'};
  let rtStr=m[1].replace('b','\u266d').replace('#','\u266f');
  const SM={'C\u266f':'D\u266d', 'D\u266f':'E\u266d', 'F\u266f':'G\u266d', 'G\u266f':'A\u266d', 'A\u266f':'B\u266d'};
  if(SM[rtStr]) rtStr=SM[rtStr];
  let q=m[2]||'M7';
  if(!CHORD_QUALITIES[q]) q='M7';
  return {root:keyToPc(rtStr), q};
}

const NOTE_TO_PC={C:0,'D\u266d':1,'C#':1,D:2,'E\u266d':3,'D#':3,E:4,F:5,'G\u266d':6,'F#':6,G:7,'A\u266d':8,'G#':8,A:9,'B\u266d':10,'A#':10,B:11};
function parseCustomChord(str){
  const m=str.match(/^([A-G][b#\u266d\u266f]?)(.*)$/);
  if(!m)return null;
  let rt=m[1].replace('#','\u266f').replace('b','\u266d');
  const SM={'C\u266f':'D\u266d','D\u266f':'E\u266d','F\u266f':'G\u266d','G\u266f':'A\u266d','A\u266f':'B\u266d'};
  if(SM[rt])rt=SM[rt];
  const root=NOTE_TO_PC[rt];
  if(root===undefined)return null;
  let q=m[2]||'M7';
  if(!CHORD_QUALITIES[q])return null;
  return {label:str, root, q, obj:CHORD_QUALITIES[q]};
}
function applyCustomProgression(text){
  const tokens=text.trim().split(/\s+/).filter(Boolean);
  const parsed=[]; const errors=[];
  for(const tok of tokens){
    const c=parseCustomChord(tok);
    if(c)parsed.push(c); else errors.push(tok);
  }
  if(errors.length){
    alert(t('customParseError')+': '+errors.join(', '));
    return false;
  }
  if(parsed.length===0)return false;
  AppSong={id:'custom',title:t('customProgTitle'),key:'C',prog:parsed.map(c=>c.label),sections:[{lbl:'Custom',s:0,n:parsed.length}]};
  AppKey='C';
  buildProg();UI.buildProgStrip();Settings.loadScore();App.onChordChange({idx:0});Settings.saveGen();
  return true;
}
function applySingleChordDrill(rootPc, quality){
  const q=CHORD_QUALITIES[quality]; if(!q)return;
  const label=KEYS[rootPc]+quality;
  AppSong={id:'single:'+label,title:label,key:KEYS[rootPc],prog:[label],sections:[{lbl:'Drill',s:0,n:1}]};
  AppKey=KEYS[rootPc];
  buildProg();UI.buildProgStrip();Settings.loadScore();App.onChordChange({idx:0});Settings.saveGen();
}

let AppSong=SONG_DB[0];
let AppKey='B\u266d';
let activeProg=[]; 
function buildProg(){
  const delta=(keyToPc(AppKey)-keyToPc(AppSong.key)+12)%12;
  activeProg=AppSong.prog.map(cStr=>{
    let {root,q}=parseChordStr(cStr);
    let nRoot=(root+delta)%12;
    return {label:KEYS[nRoot]+q, root:nRoot, q, obj:CHORD_QUALITIES[q]};
  });
}
function getIvLabel(iv){
  const MAP={0:'R',1:'\u266d9',2:'9',3:'\u266d3',4:'3',5:'11',6:'\u266d5',7:'5',8:'\u266d13',9:'13',10:'\u266d7',11:'\u03947'};
  return MAP[iv]||iv;
}