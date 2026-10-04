// Offline authoring tool. The published app plays files; it never calls Lemonade.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { sortingNarration } from '../src/algorithms/play/narration.ts';

const root = new URL('../public/narration/echo/', import.meta.url);
const manifestPath = new URL('../src/algorithms/play/narration-clips.json', import.meta.url);
const model = 'kokoro-v1', voice = 'am_echo', speed = 0.98;
export function mp3Duration(bytes) {
  let seconds = 0, frames = 0, offset = 0;
  if (bytes.toString('ascii', 0, 3) === 'ID3') offset = 10 + ((bytes[6] & 127) * 2097152 + (bytes[7] & 127) * 16384 + (bytes[8] & 127) * 128 + (bytes[9] & 127));
  while (offset + 4 <= bytes.length) {
    const a = bytes[offset], b = bytes[offset + 1], c = bytes[offset + 2];
    const version = (b >> 3) & 3, layer = (b >> 1) & 3, bitIndex = c >> 4, rateIndex = (c >> 2) & 3;
    if (a !== 255 || (b & 224) !== 224 || version === 1 || layer !== 1 || !bitIndex || bitIndex === 15 || rateIndex === 3) { offset++; continue; }
    const bitRate = (version === 3 ? [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320] : [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160])[bitIndex] * 1000;
    const sampleRate = [44100,48000,32000][rateIndex] / (version === 3 ? 1 : version === 2 ? 2 : 4);
    const length = Math.floor((version === 3 ? 144 : 72) * bitRate / sampleRate) + ((c >> 1) & 1);
    if (offset + length > bytes.length) throw new Error('Truncated MP3 frame.');
    seconds += (version === 3 ? 1152 : 576) / sampleRate; frames++; offset += length;
  }
  if (frames < 10 || seconds < 1) throw new Error('Missing or unexpectedly short MP3 audio.');
  return Number(seconds.toFixed(3));
}
const manifest = { version: 1, model, voice, speed, generatedBy: 'Local Lemonade', algorithms: {} };
let total = 0;
for (const [id, scripts] of Object.entries(sortingNarration)) {
  await mkdir(new URL(`${id}/`, root), { recursive: true });
  manifest.algorithms[id] = [];
  for (const [index, script] of scripts.entries()) {
    const hash = createHash('sha256').update(JSON.stringify({ model, voice, speed, ...script })).digest('hex').slice(0, 16);
    const filename = `${String(index + 1).padStart(2, '0')}-${hash}.mp3`;
    const file = new URL(`${id}/${filename}`, root);
    let bytes;
    try { bytes = await readFile(file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (!bytes) {
      const response = await fetch('http://127.0.0.1:13305/v1/audio/speech', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(180000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, voice, speed, input: script.text, response_format: 'mp3' }),
      });
      if (!response.ok) throw new Error(`Local synthesis ${id}/${index + 1}: HTTP ${response.status}: ${(await response.text()).slice(0, 800)}`);
      bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 1000 || !(bytes.toString('ascii', 0, 3) === 'ID3' || bytes[0] === 255 && (bytes[1] & 224) === 224)) throw new Error('Invalid MP3 response; not saving it.');
      await writeFile(file, bytes, { flag: 'wx' });
    }
    manifest.algorithms[id].push({ ...script, url: `narration/echo/${id}/${filename}`, bytes: bytes.length, duration: mp3Duration(bytes) });
    total += bytes.length;
    console.log(`${id} ${index + 1}/${scripts.length}: ${bytes.length} bytes`);
  }
}
// The manifest is generated metadata, committed with the recordings after review.
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Ready: ${Object.values(sortingNarration).flat().length} Echo clips, ${(total / 1048576).toFixed(1)} MB. No cloud API or credentials used.`);
