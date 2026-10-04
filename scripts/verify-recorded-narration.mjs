import assert from 'node:assert/strict';
import { createRecordedNarration, withNarrationTiming } from '../src/shared/playback/recorded-narration.ts';
import { narratedTime } from '../src/shared/playback/scene-narration.ts';
import { playFilms, sceneAt } from '../src/app/film-catalog.ts';

class FakeAudio {
  static instances = [];
  constructor(url) { this.url = url; this.duration = 8; this.currentTime = 0; this.playCalls = 0; FakeAudio.instances.push(this); }
  play() { this.playCalls++; return Promise.resolve(); }
  pause() { this.paused = true; }
  removeAttribute() {}
  load() {}
}
const states = [];
const narrator = createRecordedNarration(FakeAudio, state => states.push(state));
narrator.start('one', '/one.mp3');
const first = FakeAudio.instances[0];
assert.equal(narrator.status, 'loading');
first.onplaying();
first.currentTime = 2;
narrator.pause();
assert.equal(narrator.status, 'paused');
first.onplaying();
assert.equal(narrator.status, 'paused', 'Late playing event cannot undo a pause');
narrator.start('one', '/one.mp3', { rate: 2.5 });
first.onplaying();
assert.equal(FakeAudio.instances.length, 1, 'Resume the same recording, do not repeat the scene');
assert.equal(first.currentTime, 2);
assert.equal(first.playbackRate, 2.5);
narrator.setRate(3);
assert.equal(first.playbackRate, 3);
assert.equal(first.currentTime, 2, 'Speed changes preserve the audio position');
first.onwaiting();
assert.equal(narrator.started, false, 'Buffering must hold the visual too');
first.onplaying();
const staleEnd = first.onended, staleError = first.onerror;
narrator.start('two', '/two.mp3');
staleEnd(); staleError();
assert.equal(narrator.status, 'loading', 'Stale recording events cannot release or disable a new scene');
const second = FakeAudio.instances[1];
second.onplaying(); second.onended();
assert.equal(narrator.finished, true);
narrator.start('two', '/two.mp3');
assert.equal(FakeAudio.instances.length, 2, 'A completed scene must not requeue every frame');
narrator.start('missing', '/missing.mp3');
FakeAudio.instances.at(-1).onerror();
assert.equal(narrator.status, 'error', 'Missing audio must release the visual player');
narrator.destroy();

const film = withNarrationTiming(playFilms.merge, playFilms.merge.frames.map(() => ({ duration: 9 })));
assert.equal(film.frames[0].duration, 9.25);
assert.equal(playFilms.merge.frames[0].duration, 4.8, 'Silent film timing stays unchanged');
assert.equal(narratedTime(sceneAt(film, 0), 20, false), 9.24);
assert.equal(narratedTime(sceneAt(film, 0), 20, true), 9.25);
console.log('Recorded narration: pause/resume, speed, buffering, stale events, failures and scene timing passed.');
