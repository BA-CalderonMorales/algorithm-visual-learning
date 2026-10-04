// Pure scene primitives and timeline calculations; domain stories live with their topics.
export const item = (value, index) => ({ id: `v${index}`, value: String(value) });

export const row = (values, roles = {}, pointers = {}, y = 0.42) =>
  values.map((value, index) => ({
    ...value,
    x: (index + 0.5) / values.length,
    y,
    role: roles[index] || 'neutral',
    index: String(index),
    pointer: pointers[index] || '',
  }));

export const frame = (chapter, title, caption, tokens = [], extra = {}) => ({
  chapter,
  title,
  caption,
  tokens,
  duration: Math.max(3.2, caption.split(' ').length / 4.8),
  ...extra,
});

export const text = (id, value, x, y, role = 'neutral', size = 1) => ({ id, text: value, x, y, role, size });

export const lane = (id, label, start, end, y, role = 'sorted') => ({ id, label, start, end, y, role });

export const sortedRoles = (count) => Object.fromEntries(Array.from({ length: count }, (_, i) => [i, 'sorted']));

export const film = (id, title, takeaway, frames, connections, note = '') => ({
  id,
  title,
  takeaway,
  frames,
  connections,
  note,
  duration: frames.reduce((sum, scene) => sum + scene.duration, 0),
});

export function sceneAt(film, seconds) {
  let start = 0;
  for (let index = 0; index < film.frames.length; index++) {
    const scene = film.frames[index];
    if (seconds < start + scene.duration || index === film.frames.length - 1) {
      return {
        scene,
        previous: film.frames[Math.max(0, index - 1)],
        index,
        start,
        local: Math.max(0, seconds - start),
      };
    }
    start += scene.duration;
  }
}

export function chaptersFor(film) {
  let time = 0;
  return film.frames.flatMap((scene, index) => {
    const result = !index || scene.chapter !== film.frames[index - 1].chapter ? [{ title: scene.chapter, time }] : [];
    time += scene.duration;
    return result;
  });
}
