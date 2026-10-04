import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { mergeNarration } from '../src/algorithms/merge/browser-narration.ts';
import { playFilms, sceneAt } from '../src/app/film-catalog.ts';
import { createSceneNarration, narratedTime } from '../src/shared/playback/scene-narration.ts';

assert.equal(mergeNarration.length, playFilms.merge.frames.length);
assert.deepEqual(playFilms.merge.frames[0].merge.input.map(v=>Number(v.value)),[7,1,4,6,2,3],'Update the conversational script when its example changes');
mergeNarration.forEach((script, index) => {
  assert.equal(script.phase, playFilms.merge.frames[index].merge.phase);
  assert.ok(script.text.split(' ').length < 45, 'Keep narration conversational and brief');
});
const synth = { last:null, cancels:0, resume(){}, cancel(){this.cancels++;}, speak(u){this.last=u;} };
class Utterance { constructor(text){this.text=text;} }
const events=[];
const narrator=createSceneNarration(synth,Utterance,state=>events.push(state));
narrator.start('0','A short explanation.',{rate:1.5});
assert.equal(narrator.started,false);
synth.last.onstart();
assert.equal(narrator.started,true);
const staleEnd=synth.last.onend;
narrator.stop();
narrator.start('1','The next explanation.');
staleEnd();
assert.equal(narrator.finished,false,'A cancelled speech callback must not release a new scene');
synth.last.onstart();
synth.last.onend();
assert.equal(narrator.finished,true);
const unchanged=synth.last;
narrator.start('1','Never queue this twice.');
assert.equal(synth.last,unchanged);
const position=sceneAt(playFilms.merge,0);
assert.ok(narratedTime(position,10,false)<position.scene.duration);
assert.equal(narratedTime(position,10,true),position.scene.duration);
narrator.destroy();
console.log('Narration model, stale callback protection, and scene gating passed.');

// Headless browsers do not expose Windows voices. Control their speech events
// explicitly to test real UI synchronization, without pretending to audition it.
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
const origin=process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const errors=[];
await mkdir(new URL('../screenshots/narration-review/',import.meta.url),{recursive:true});
try {
  for(const width of [1440,900,390]) {
    const page=await browser.newPage({viewport:{width,height:1000}});
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      class FakeUtterance {constructor(text){this.text=text;}}
      const service=new EventTarget();
      service.requests=[];service.cancelCount=0;
      service.getVoices=()=>[{voiceURI:'test-voice-a',name:'Test narrator A',lang:'en-US',localService:true,default:true},{voiceURI:'test-voice-b',name:'Test narrator B',lang:'en-US',localService:true}];
      service.cancel=()=>{service.cancelCount++;};service.resume=()=>{};
      service.speak=u=>{service.requests.push(u);queueMicrotask(()=>u.onstart?.());};
      Object.defineProperty(window,'speechSynthesis',{value:service});
      Object.defineProperty(window,'SpeechSynthesisUtterance',{value:FakeUtterance});
    });
    await page.goto(`${origin}/#/algorithms/merge/play`);
    const voice=page.getByRole('button',{name:'Voice narration',exact:true});
    await voice.waitFor();
    assert.equal(await voice.getAttribute('aria-pressed'),'false');
    assert.equal(await page.evaluate(()=>speechSynthesis.requests.length),0,'No automatic speech');
    await voice.click();
    await page.getByLabel('Playback speed',{exact:true}).selectOption('3');
    await page.getByRole('button',{name:'Play animation',exact:true}).click();
    await page.waitForTimeout(2000);
    const time=Number(await page.getByLabel('Seek animation',{exact:true}).inputValue());
    assert.ok(time>4.6&&time<4.8,`Scene must remain visible while its voice continues; time was ${time}`);
    assert.equal(await page.evaluate(()=>speechSynthesis.requests.length),1,'Do not queue speech every frame');
    assert.equal(await page.evaluate(()=>speechSynthesis.requests[0].rate),3);
    assert.ok((await page.locator('.film-scene-caption').innerText()).includes('Start with six unsorted values'));
    await page.evaluate(()=>speechSynthesis.requests.at(-1).onend());
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>speechSynthesis.requests.length),2,'Finishing the narration releases the next scene');
    await page.getByRole('button',{name:'Pause animation',exact:true}).click();
    const count=await page.evaluate(()=>speechSynthesis.cancelCount);
    await page.getByLabel('Narrator voice',{exact:true}).selectOption('test-voice-b');
    await page.getByRole('button',{name:'Play animation',exact:true}).click();
    assert.equal(await page.evaluate(()=>speechSynthesis.requests.at(-1).voice.voiceURI),'test-voice-b');
    await page.getByLabel('Playback speed',{exact:true}).selectOption('2.5');
    assert.equal(await page.evaluate(()=>speechSynthesis.requests.at(-1).rate),2.5,'Rate changes restart the scene at the new rate');
    await page.getByRole('button',{name:'Next scene',exact:true}).click();
    assert.ok(await page.getByRole('button',{name:'Play animation',exact:true}).isVisible());
    assert.ok(await page.evaluate(()=>speechSynthesis.cancelCount)>count,'Step navigation cancels speech');
    await page.getByRole('button',{name:'Replay narration',exact:true}).click();
    await page.getByRole('button',{name:'Reverse playback',exact:true}).click();
    assert.ok((await page.locator('.film-voice-status').innerText()).includes('quiet during reverse'));
    const reverseRequests=await page.evaluate(()=>speechSynthesis.requests.length);
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>speechSynthesis.requests.length),reverseRequests,'Reverse must not narrate forward text');
    await page.getByRole('button',{name:'Reverse playback',exact:true}).click();
    await page.getByRole('button',{name:'Replay narration',exact:true}).click();
    await page.evaluate(()=>speechSynthesis.requests.at(-1).onerror());
    assert.equal(await voice.getAttribute('aria-pressed'),'false');
    assert.ok((await page.locator('.film-voice-status').innerText()).includes('could not play'));
    await voice.click();
    await page.getByRole('button',{name:'Replay narration',exact:true}).click();
    const seek=page.getByLabel('Seek animation',{exact:true});
    await seek.evaluate(el=>{el.value='38.4';el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.ok(await page.getByRole('button',{name:'Play animation',exact:true}).isVisible());
    await page.getByRole('button',{name:'Replay narration',exact:true}).click();
    await page.waitForTimeout(150);
    await page.getByRole('button',{name:'Pause animation',exact:true}).click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No narrow-screen overflow');
    await page.locator('.film-narration').screenshot({path:fileURLToPath(new URL(`../screenshots/narration-review/controls-${width}.png`,import.meta.url))});
    await page.locator('.concept-film').screenshot({path:fileURLToPath(new URL(`../screenshots/narration-review/player-${width}.png`,import.meta.url))});
    await page.getByRole('button',{name:'Replay narration',exact:true}).click();
    const beforeLeaving=await page.evaluate(()=>speechSynthesis.cancelCount);
    await page.evaluate(()=>{location.hash='/algorithms/selection/play';});
    await page.getByRole('tab',{name:'Play',exact:true}).waitFor();
    await page.waitForFunction(()=>!document.querySelector('.film-narration'));
    assert.ok(await page.evaluate(()=>speechSynthesis.cancelCount)>beforeLeaving,'Leaving Merge must stop its voice');
    for(const id of ['selection','insertion','shell','quick','tim','counting']){
      await page.goto(`${origin}/#/algorithms/${id}/play`);
      await page.locator('.concept-film').waitFor();
      assert.equal(await page.locator('.film-narration').count(),0,'Only Merge gets this local experiment');
    }
    console.log(`${width}px: Merge voice controls, timing, cancellation, speed, reverse and failure recovery passed.`);
    await page.close();
  }
  const unsupported=await browser.newPage();
  await unsupported.addInitScript(()=>{
    Object.defineProperty(window,'speechSynthesis',{value:undefined});
    Object.defineProperty(window,'SpeechSynthesisUtterance',{value:undefined});
  });
  await unsupported.goto(`${origin}/#/algorithms/merge/play`);
  await unsupported.getByRole('button',{name:'Voice narration',exact:true}).waitFor();
  assert.ok(await unsupported.getByRole('button',{name:'Voice narration',exact:true}).isDisabled());
  await unsupported.close();
  const server=await preview({preview:{host:'127.0.0.1',port:5189,strictPort:true}});
  try {
    const production=await browser.newPage();
    await production.goto('http://127.0.0.1:5189/algorithm-visual-learning/#/algorithms/merge/play');
    await production.locator('.concept-film').waitFor();
    assert.equal(await production.locator('.film-narration').count(),0,'Narration trial must not appear in a release build');
    await production.close();
  } finally {await new Promise(resolve=>server.httpServer.close(resolve));}
  assert.deepEqual(errors,[],'Browser errors');
} finally {await browser.close();}
