import { sceneAt } from '../model.ts';
import { renderFilm } from '../renderers/concept.js';
import { stageBounds } from './model.ts';

const surfaces = new WeakMap();

// Reuse the tested diagram drawings, not the exported film's duplicated chrome.
// UI-only presentation changes never invalidate already-rendered video assets.
export function renderPlayerFilm(canvas, film, seconds, { compact = false, reduced = false } = {}) {
  let surface = surfaces.get(canvas);
  if (!surface) {
    surface = document.createElement('canvas');
    surfaces.set(canvas, surface);
  }
  const width = compact ? 560 : 1000;
  const sorting = ['selection', 'insertion', 'shell', 'quick', 'merge', 'tim', 'counting'].includes(film.id);
  const sourceHeight = sorting ? (compact ? 510 : 500) : compact ? 610 : 560;
  const scale = canvas.width / width;
  if (surface.width !== canvas.width || surface.height !== Math.round(sourceHeight * scale)) {
    surface.width = canvas.width;
    surface.height = Math.round(sourceHeight * scale);
  }
  renderFilm(surface, film, seconds, { compact, reduced });
  const { scene } = sceneAt(film, seconds);
  const { top, height, cropHeight = height } = stageBounds(film.id, scene, compact);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#11151b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Merge's first array and later three-row diagrams share a stable stage:
  // controls don't jump when the animation starts splitting the input.
  const destinationHeight = (canvas.height * cropHeight) / height;
  ctx.drawImage(
    surface,
    0,
    top * scale,
    surface.width,
    cropHeight * scale,
    0,
    (canvas.height - destinationHeight) / 2,
    canvas.width,
    destinationHeight,
  );
}
