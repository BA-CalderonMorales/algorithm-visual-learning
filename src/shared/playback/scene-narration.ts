// Browser voice adapter. No microphone, API key, or generated media is needed.
// A single scene owns a single utterance; stale callbacks cannot affect a seek.
export function createSceneNarration(synth, Utterance, onState = () => {}) {
  let key = null,
    status = 'idle',
    generation = 0,
    timeout,
    utterance;
  const state = (value) => {
    status = value;
    onState(value);
  };
  const clearWatchdog = () => {
    clearTimeout(timeout);
    timeout = undefined;
  };
  function stop() {
    generation++;
    clearWatchdog();
    if (utterance) {
      utterance.onstart = utterance.onend = utterance.onerror = null;
      synth.cancel();
    }
    utterance = null;
    key = null;
    state('idle');
  }
  function start(sceneKey, text, { voice, rate = 1 } = {}) {
    if (key === sceneKey && ['speaking', 'loading', 'done'].includes(status)) return;
    stop();
    key = sceneKey;
    const token = generation,
      valid = () => token === generation && key === sceneKey;
    utterance = new Utterance(text);
    utterance.lang = voice?.lang || 'en-US';
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    const failed = () => {
      if (!valid()) return;
      clearWatchdog();
      utterance.onstart = utterance.onend = utterance.onerror = null;
      synth.cancel();
      state('error');
    };
    utterance.onstart = () => {
      if (!valid()) return;
      clearWatchdog();
      state('speaking');
      // A broken speech service must not trap the visual player indefinitely.
      timeout = setTimeout(failed, Math.max(20000, (text.split(/\s+/).length * 1400) / rate + 10000));
    };
    utterance.onend = () => {
      if (valid()) {
        clearWatchdog();
        state('done');
      }
    };
    utterance.onerror = failed;
    state('loading');
    timeout = setTimeout(failed, 8000);
    try {
      synth.resume();
      synth.speak(utterance);
    } catch {
      failed();
    }
  }
  return {
    start,
    stop,
    destroy: stop,
    get key() {
      return key;
    },
    get status() {
      return status;
    },
    get started() {
      return status === 'speaking' || status === 'done';
    },
    get finished() {
      return status === 'done';
    },
  };
}

// Hold the scene until motion AND speech finish. The epsilon keeps the current
// scene visible at its end instead of leaking into the next scene's caption.
export function narratedTime(position, delta, finished) {
  const end = position.start + position.scene.duration;
  return Math.min(position.start + position.local + delta, finished ? end : end - 0.01);
}
