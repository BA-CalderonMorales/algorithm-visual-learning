import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { playFilms } from '../src/app/film-catalog.ts';

const origin=process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
const ids=['selection','insertion','shell','quick','merge','tim','counting'];
const errors=[];
await mkdir(new URL('../screenshots/play-review/',import.meta.url),{recursive:true});
try {
  for(const width of [1440,900,390]) {
    const page=await browser.newPage({viewport:{width,height:1000}});
    page.on('pageerror',error=>errors.push(error.message));
    for(const id of ids) {
      await page.goto(`${origin}/#/algorithms/${id}/play`);
      await page.locator('.film-stage.sorting').waitFor();
      assert.ok(await page.locator('.film-scene-caption').isVisible());
      assert.ok(await page.locator('.film-scene-caption').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=14),'Explanations must stay readable on phones');
      const clipped=await page.evaluate(async id=>{
        const {playFilms}=await import('/src/app/film-catalog.ts');
        const {renderFilm}=await import('/src/shared/playback/renderers/concept.js');
        const film=playFilms[id],canvas=document.querySelector('.film-stage canvas'),ctx=canvas.getContext('2d');
        const compact=document.querySelector('.film-stage').classList.contains('compact');
        const width=compact?560:1000;
        let height=compact?510:500;
        const original=ctx.fillText,failures=[];
        ctx.fillText=function(value,x,y){
          const textWidth=this.measureText(String(value)).width;
          const left=x-(this.textAlign==='center'?textWidth/2:this.textAlign==='right'?textWidth:0);
          const metrics=this.measureText(String(value));
          if(left< -1 || left+textWidth>width+1 || y-metrics.actualBoundingBoxAscent<0 || y+metrics.actualBoundingBoxDescent>height)failures.push({value,x,y});
          original.call(this,value,x,y);
        };
        try {
          for(const exportVideo of [false,true]) {
            height=exportVideo?(compact?610:560):(compact?510:500);
            let time=0;
            for(const scene of film.frames){for(const local of [0,0.8,2.1])renderFilm(canvas,film,time+local,{compact,exportVideo});time+=scene.duration;}
          }
          if (id === 'selection') {
            const { renderSelection } = await import('/src/algorithms/selection/components/play/renderer.ts');
            height = compact ? 280 : 260;
            let time = 0;
            for (const scene of film.frames) {
              for (const local of [0, 0.8, 2.1]) renderSelection(canvas, film, time + local, { compact });
              time += scene.duration;
            }
          }
        }
        finally{ctx.fillText=original;}
        return failures;
      },id);
      assert.deepEqual(clipped,[],`${id}: clipped drawing labels at ${width}px`);
      let time=0;
      const sample=playFilms[id].frames.find(scene=>scene.merge?.phase==='place' || scene.chapter==='Shift' || scene.chapter==='Place' || scene.chapter==='Partition');
      for(const scene of playFilms[id].frames){if(scene===sample)break;time+=scene.duration;}
      const seek=page.getByLabel('Seek animation',{exact:true});
      await seek.evaluate((el,time)=>{el.value=String(time);el.dispatchEvent(new Event('input',{bubbles:true}));},time+2.2);
      await page.waitForTimeout(100);
      await page.locator('.film-stage').screenshot({path:fileURLToPath(new URL(`../screenshots/play-review/${id}-${width}.png`,import.meta.url))});
      await seek.evaluate((el,time)=>{el.value=String(time);el.dispatchEvent(new Event('input',{bubbles:true}));},playFilms[id].duration);
      await page.waitForTimeout(50);
      assert.ok((await page.locator('.film-scene-caption').innerText()).length>20);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false,`${id}: page overflow`);
    }
    console.log(`${width}px: all seven sorting films render, seek and keep readable captions without clipped labels`);
    await page.close();
  }
  assert.deepEqual(errors,[],'Browser runtime errors');
} finally {await browser.close();}
