const fs = require('fs');

// --- 1. Modify HTML ---
let html = fs.readFileSync('d:\\_web\\autumn leaves\\index.html', 'utf8');
const oldModalRegex = /<div style="margin-bottom:10px; font-size:11px; color:var\(--tx2\);">[\s\S]*?<button class="btn btn-grn" id="btnCustomApply" style="width:100%;justify-content:center;">Apply<\/button>/;
const newModal = `<!-- Hidden textarea to keep compatibility with app.js settings logic -->
    <textarea id="customProgTxt" style="display:none;"></textarea>
    
    <div style="margin-bottom:8px; font-size:11px; color:var(--tx2);">Tap to add chord. Tap block to remove.</div>
    
    <!-- Timeline -->
    <div id="guiProgTimeline" style="display:flex; flex-wrap:wrap; gap:4px; padding:8px; background:var(--bg); border:1px solid var(--bd2); min-height:48px; border-radius:4px; margin-bottom:12px;"></div>
    
    <!-- Palette -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
      <div id="guiRoots" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:4px; align-content:start;"></div>
      <div id="guiQuals" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:4px; align-content:start;"></div>
    </div>
    
    <div style="display:flex; gap:8px; margin-bottom:12px;">
       <button class="btn btn-grn" id="btnCustomApply" style="flex:1;justify-content:center;">Apply / Play</button>
       <button class="btn" id="btnCustomSave" style="flex:1;justify-content:center;background:var(--accent);color:#000;border:none;">Save</button>
    </div>

    <!-- Saved List -->
    <div style="font-size:12px; font-weight:bold; margin-bottom:4px; color:var(--tx2);">Saved Progressions</div>
    <div id="guiSavedList" style="display:flex; flex-direction:column; gap:4px; max-height:120px; overflow-y:auto; border:1px solid var(--bd2); border-radius:4px; padding:4px;"></div>`;
html = html.replace(oldModalRegex, newModal);
fs.writeFileSync('d:\\_web\\autumn leaves\\index.html', html, 'utf8');

// --- 2. Modify JS ---
let app = fs.readFileSync('d:\\_web\\autumn leaves\\app.js', 'utf8');

const builderLogic = `
// --- GUI Builder Logic ---
const ProgBuilder = {
  state: [],
  selectedRoot: 'C',
  roots: ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'],
  quals: ['M7','m7','7','m7b5','dim7','6','m6','sus4','7sus4','add9'],
  STORAGE_KEY: 'jazz-degree-custom-saves',
  
  init() {
    let rHtml = '';
    this.roots.forEach(r => rHtml += \`<button class="btn btn-sm gui-btn-root" data-val="\${r}">\${r}</button>\`);
    document.getElementById('guiRoots').innerHTML = rHtml;
    
    let qHtml = '';
    this.quals.forEach(q => qHtml += \`<button class="btn btn-sm gui-btn-qual" data-val="\${q}">\${q}</button>\`);
    document.getElementById('guiQuals').innerHTML = qHtml;

    document.querySelectorAll('.gui-btn-root').forEach(b => {
      b.onclick = (e) => {
        this.selectedRoot = e.target.dataset.val;
        this.renderPalette();
      };
    });
    
    document.querySelectorAll('.gui-btn-qual').forEach(b => {
      b.onclick = (e) => {
        const q = e.target.dataset.val;
        this.state.push(this.selectedRoot + q);
        this.renderTimeline();
      };
    });
    
    document.getElementById('btnCustomSave').onclick = () => this.saveProg();
    
    // Load textarea content to state on open
    document.getElementById('btnCustomProg').addEventListener('click', () => {
      const t = document.getElementById('customProgTxt').value.trim();
      this.state = t ? t.split(/\\s+/) : [];
      this.renderPalette();
      this.renderTimeline();
      this.renderSavedList();
    });
  },
  
  renderPalette() {
    document.querySelectorAll('.gui-btn-root').forEach(b => {
      if(b.dataset.val === this.selectedRoot) {
        b.style.background = 'var(--accent)';
        b.style.color = '#000';
      } else {
        b.style.background = '';
        b.style.color = '';
      }
    });
  },
  
  renderTimeline() {
    let html = '';
    this.state.forEach((c, idx) => {
      html += \`<div class="prog-block" style="background:#444; color:#fff; padding:4px 8px; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="ProgBuilder.remove(\${idx})">\${c} <span style="font-size:10px; opacity:0.6">&times;</span></div>\`;
    });
    document.getElementById('guiProgTimeline').innerHTML = html;
    
    // Sync to hidden textarea
    document.getElementById('customProgTxt').value = this.state.join(' ');
  },
  
  remove(idx) {
    this.state.splice(idx, 1);
    this.renderTimeline();
  },
  
  getSaved() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  },
  
  saveProg() {
    if(this.state.length === 0) return;
    let s = this.getSaved();
    s.push(this.state.join(' '));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(s));
    this.renderSavedList();
  },
  
  removeSaved(idx) {
    let s = this.getSaved();
    s.splice(idx, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(s));
    this.renderSavedList();
  },
  
  loadSaved(idx) {
    let s = this.getSaved();
    if(s[idx]) {
      this.state = s[idx].split(' ');
      this.renderTimeline();
    }
  },
  
  renderSavedList() {
    let s = this.getSaved();
    let html = '';
    s.forEach((prog, idx) => {
      html += \`<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:4px;">
        <div style="flex:1; cursor:pointer;" onclick="ProgBuilder.loadSaved(\${idx})">\${prog}</div>
        <button class="btn btn-sm btn-red" onclick="ProgBuilder.removeSaved(\${idx})" style="padding:2px 6px;">&times;</button>
      </div>\`;
    });
    document.getElementById('guiSavedList').innerHTML = html;
  }
};
`;

// Inject into window.onload / DOMContentLoaded
const mountPoint = "document.addEventListener('DOMContentLoaded',()=>{";
app = app.replace(mountPoint, builderLogic + "\n" + mountPoint + "\n  ProgBuilder.init();\n");

fs.writeFileSync('d:\\_web\\autumn leaves\\app.js', app, 'utf8');
console.log("GUI builder injected");
