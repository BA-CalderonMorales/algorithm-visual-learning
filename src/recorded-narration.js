// One same-origin recording per scene, independent of the operating system.
// Generation happens offline; this adapter only plays published static assets.
export function createRecordedNarration(Audio, onState = () => {}) {
  let key = null, status = 'idle', generation = 0, audio, timeout;
  const state = value => { status = value; onState(value); };
  const clear = () => { clearTimeout(timeout); timeout = undefined; };
  function stop() {
    generation++; clear();
    if (audio) {
      audio.onplaying = audio.onended = audio.onerror = audio.onwaiting = audio.onloadedmetadata = null;
      audio.pause(); audio.removeAttribute('src'); audio.load();
    }
    audio = undefined; key = null; state('idle');
  }
  function play() {
    const token = generation;
    state('loading');
    timeout = setTimeout(() => fail(token), 12000);
    try { Promise.resolve(audio.play()).catch(() => { if (status !== 'paused') fail(token); }); } catch { fail(token); }
  }
  function fail(token) {
    if (token !== generation) return;
    stop(); state('error');
  }
  function watchdog() {
    clear();
    const token = generation;
    timeout = setTimeout(() => fail(token), (Number.isFinite(audio.duration) ? Math.max(0, audio.duration - audio.currentTime) / audio.playbackRate : 60) * 1000 + 15000);
  }
  function start(sceneKey, url, { rate = 1 } = {}) {
    if (key === sceneKey && ['speaking', 'loading', 'done'].includes(status)) return;
    if (key === sceneKey && status === 'paused') { setRate(rate); play(); return; }
    stop(); key = sceneKey;
    const token = generation, valid = () => token === generation && key === sceneKey;
    audio = new Audio(url);
    audio.preload = 'auto';
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    audio.onplaying = () => { if (valid() && status !== 'paused') { state('speaking'); watchdog(); } };
    audio.onloadedmetadata = () => { if (valid() && status === 'speaking') watchdog(); };
    audio.onwaiting = () => { if (valid() && status !== 'paused') { clear(); state('loading'); timeout = setTimeout(() => fail(token), 12000); } };
    audio.onended = () => { if (valid()) { clear(); state('done'); } };
    audio.onerror = () => { if (valid()) fail(token); };
    play();
  }
  function pause() { if (audio && ['speaking', 'loading'].includes(status)) { clear(); audio.pause(); state('paused'); } }
  function setRate(rate) { if (audio) { audio.playbackRate = rate; if (status === 'speaking') watchdog(); } }
  return {
    start, stop, pause, setRate, destroy: stop,
    get key() { return key; },
    get status() { return status; },
    get elapsed() { return audio?.currentTime ?? 0; },
    get started() { return status === 'speaking' || status === 'done'; },
    get finished() { return status === 'done'; },
  };
}

export function withNarrationTiming(film, clips) {
  const frames = film.frames.map((scene, index) => ({ ...scene, duration: Math.max(scene.duration, clips[index].duration + 0.25) }));
  return { ...film, frames, duration: frames.reduce((sum, scene) => sum + scene.duration, 0) };
}
