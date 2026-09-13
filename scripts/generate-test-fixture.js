const fs = require('fs');
const path = require('path');

const sr = 44100, freq = 174.61, onMs = 150, offMs = 150, totalSec = 25;
const nTotal = sr * totalSec;
const period = Math.floor(sr * (onMs + offMs) / 1000);
const onSamples = Math.floor(sr * onMs / 1000);
const buf = Buffer.alloc(nTotal * 2);

for (let i = 0; i < nTotal; i++) {
  const pos = i % period;
  let val = 0;
  if (pos < onSamples) {
    const fade = Math.min(1, pos / 200, (onSamples - pos) / 200);
    val = Math.round(0.6 * 32767 * Math.sin(2 * Math.PI * freq * i / sr) * Math.max(0, fade));
  }
  buf.writeInt16LE(val, i * 2);
}

const header = Buffer.alloc(44);
header.write('RIFF', 0); header.writeUInt32LE(36 + buf.length, 4); header.write('WAVE', 8);
header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22); header.writeUInt32LE(sr, 24); header.writeUInt32LE(sr * 2, 28);
header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
header.write('data', 36); header.writeUInt32LE(buf.length, 40);

fs.mkdirSync(path.resolve(__dirname, '../tests/fixtures'), { recursive: true });
fs.writeFileSync(path.resolve(__dirname, '../tests/fixtures/tone-f3.wav'), Buffer.concat([header, buf]));
console.log('tests/fixtures/tone-f3.wav generated');
