// Display facts stay separate from the scene data and its recorded narration.
export function describeScene(scene, index, count) {
  const pointer = (name) => scene.tokens.find((token) => token.pointer?.split(' · ').includes(name));
  const boundary = pointer('i');
  const minimum = scene.tokens.find((token) => token.role === 'key');
  const complete = index === count - 1;
  return {
    phase: complete ? 'Sorted' : scene.chapter === 'Place' ? 'Place once' : 'Scan for the minimum',
    progress: `${index + 1} / ${count}`,
    boundary: complete ? 'Every position is fixed' : `Fill index ${boundary?.index ?? 0}`,
    minimum: complete ? null : (minimum?.value ?? boundary?.value),
  };
}
