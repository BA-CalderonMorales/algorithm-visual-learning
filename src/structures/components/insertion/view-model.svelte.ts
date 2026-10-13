import geometry from '../../geometry/study-node.json';
import { insertionState } from './model.ts';
export function createViewModel() {
  let step = $state(0);
  let mode = $state('middle');
  const state = $derived(insertionState(step, mode));
  const faces = geometry.faces.map((face) => face.map((index) => geometry.points[index].join(',')).join(' '));
  const edgePath = $derived(
    state.links.map(([from, to]) => {
      const a = state.nodes.find((n) => n.id === from),
        b = state.nodes.find((n) => n.id === to);
      return {
        from,
        to,
        d: `M${a.x + 112} ${a.y + 35} Q${(a.x + b.x) / 2 + 60} ${a.y === b.y ? a.y + 35 : 140} ${b.x - 6} ${b.y + 35}`,
      };
    }),
  );
  return {
    faces,
    get state() {
      return state;
    },
    get step() {
      return step;
    },
    get mode() {
      return mode;
    },
    get edges() {
      return edgePath;
    },
    select(value) {
      mode = value;
      step = 0;
    },
    move(delta) {
      step = Math.max(0, Math.min(2, step + delta));
    },
  };
}
