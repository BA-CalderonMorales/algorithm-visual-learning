export function implementationNote(id: string, language: string) {
  const typed = language === 'python-typed';
  const inPlace = typed && ['quick', 'insertion', 'selection', 'shell'].includes(id);
  const notes = [inPlace ? 'Updates the input list in place.' : 'Returns a sorted copy; leaves the input unchanged.'];
  if (id === 'quick')
    notes.push(
      typed
        ? 'Median-of-three partitioning with an insertion-sort cutoff.'
        : 'A simpler allocating partition version, not the in-place cutoff version in the walkthrough.',
    );
  if (id === 'counting')
    notes.push(
      typed
        ? 'Stable cumulative-position placement.'
        : 'Tally and rebuild: a simpler value-only version, not stable record placement.',
    );
  if (id === 'tim') notes.push('Educational run-and-merge version, not CPython’s production Timsort.');
  if (id === 'shell') notes.push('Uses halving gaps.');
  return notes.join(' ');
}
