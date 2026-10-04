// The player owns presentation; films retain their authored scenes and timing.
export function describePlayerScene(scene, index, count) {
  return {
    phase: scene.chapter,
    progress: `${index + 1} / ${count}`,
    boundary: scene.operation ?? countingOperation(scene.counting),
    facts: scene.merge ? [] : (scene.facts ?? []).filter((fact) => fact.value !== '—'),
    minimum: null,
  };
}

function countingOperation(state) {
  if (!state) return null;
  if (state.phase === 'setup') return `n = ${state.input.length} items · k = ${state.counts.length} buckets`;
  if (state.phase === 'count')
    return `input[${state.activeInput}] = ${state.activeBucket} → bucket[${state.activeBucket}]: ${state.before} + 1 = ${state.after}`;
  if (state.phase === 'prefix')
    return `bucket[${state.activeBucket}]: ${state.before} + ${state.addend} = ${state.after} values`;
  if (state.phase === 'place')
    return `bucket[${state.activeBucket}]: ${state.before} − 1 = ${state.target} → output[${state.target}]`;
  return null;
}

// Logical diagram boundaries in the existing export renderer. Headers, fact
// cards and captions are presented as accessible HTML instead of tiny canvas text.
export function stageBounds(id, scene, compact) {
  if (id === 'selection') return { top: 0, height: compact ? 280 : 260 };
  if (scene.counting) return { top: 125, height: 370 };
  if (scene.merge)
    return {
      top: scene.merge.phase === 'input' ? 130 : 125,
      height: 340,
      cropHeight: scene.merge.phase === 'input' ? (compact ? 240 : 260) : 340,
    };
  if (['insertion', 'shell', 'quick', 'merge', 'tim'].includes(id)) return { top: 130, height: compact ? 240 : 260 };
  return { top: compact ? 115 : 105, height: compact ? 296 : 299 };
}

export function narrationStatus(player) {
  const notice = (message) => ({ message, attention: true });
  if (!player.audioSupported) return notice('Audio is unavailable here. You can still play the animation.');
  if (!player.voiceAvailable) return notice('Recordings are unavailable. You can still play the animation.');
  if (player.voiceStatus === 'error') return notice('Audio could not play. Visuals continue; try Voice again.');
  if (player.voiceOn && player.reverse) return notice('Echo is quiet during reverse.');
  if (player.voiceOn && player.voiceStatus === 'loading') return notice('Loading voice…');
  return {
    message: player.voiceOn
      ? player.playing
        ? 'Listening · AI-generated Echo voice.'
        : 'Play to hear this scene.'
      : 'Voice is off. Enable it, then press Play.',
    attention: false,
  };
}
