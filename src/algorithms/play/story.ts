export function arrayStory(id, frames) {
  return frames.map((scene, index) => {
    const previous = frames[Math.max(0, index - 1)];
    const key = scene.tokens.find((t) => t.role === 'key');
    const atPointer = (pointer) => scene.tokens.find((t) => t.pointer?.split(' · ').includes(pointer));
    const i = atPointer('i'),
      j = atPointer('j');
    const moves = scene.tokens.flatMap((token) => {
      const old = previous.tokens.find((t) => t.id === token.id);
      return old && old.x !== token.x
        ? [{ value: token.value, from: old.index, to: token.index, key: token.role === 'key' }]
        : [];
    });
    let operation = scene.operation;
    if (!operation && moves.length) {
      const shifted = moves.find((move) => !move.key);
      operation =
        scene.held && shifted
          ? `${shifted.value} > key ${scene.held} → shift ${shifted.value} right`
          : `Swap ${moves[0].value} and ${moves[1]?.value} · indices ${moves[0].from} ↔ ${moves[0].to}`;
    }
    if (!operation && j) {
      const comparison = id === 'selection' ? (previous.tokens.find((t) => t.role === 'key') ?? i) : key;
      if (comparison)
        operation =
          id === 'selection'
            ? `${j.value} ${Number(j.value) < Number(comparison.value) ? '<' : '≥'} ${comparison.value} → ${Number(j.value) < Number(comparison.value) ? 'remember the smaller value' : 'keep the minimum'}`
            : `Compare ${j.value} at index ${j.index} with ${id === 'quick' ? 'pivot' : 'key'} ${comparison.value}`;
    }
    operation ??= scene.held
      ? `Key ${scene.held} belongs at index ${scene.open ?? key?.index ?? 'shown'}`
      : id === 'shell' && scene.group
        ? `Gap ${scene.gap}: only indices ${scene.group.join(' → ')} belong to this group`
        : id === 'quick'
          ? 'Only fixed pivots are finished; each side still needs sorting'
          : 'Green marks the part already in its final order';
    if (index === frames.length - 1) operation = 'Every position is now sorted';
    const fact = (label, value, role = 'group') => ({ label, value: String(value ?? '—'), role });
    const facts =
      id === 'selection'
        ? [
            fact('Fill index i', i?.index),
            fact('Scan index j', j?.index),
            fact('Minimum', key?.value ?? i?.value, 'key'),
          ]
        : id === 'insertion'
          ? [
              fact('Held key', scene.held, 'key'),
              fact('Compare index j', j?.index),
              fact('Key position', scene.open ?? key?.index, 'key'),
            ]
          : id === 'shell'
            ? [fact('Gap', scene.gap ?? 1), fact('Held key', scene.held, 'key'), fact('Compare index j', j?.index)]
            : [
                fact('Pivot', key?.value, 'key'),
                fact('Scan indices i / j', `${i?.index ?? '—'} / ${j?.index ?? '—'}`),
                fact('Active range', scene.range ?? '0–8'),
              ];
    if (index === frames.length - 1)
      facts.splice(
        0,
        3,
        fact('Sorted values', scene.tokens.length, 'sorted'),
        fact('Remaining', 0, 'sorted'),
        fact('Status', 'Complete', 'sorted'),
      );
    return { ...scene, duration: Math.max(4.2, scene.duration), operation, facts };
  });
}
