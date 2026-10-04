// Local Merge Play experiment. Scripts explain a decision, not every code line.
// Each phase is checked against the film model by the narration tests.
export const mergeNarration = [
  {
    phase: 'input',
    text: 'Start with six unsorted values. Merge sort makes this easier by splitting the problem, sorting each smaller part, then bringing the parts back together.',
  },
  {
    phase: 'split',
    text: 'The left half is seven, one, four. The right half is six, two, three. Neither half is sorted yet, so keep dividing them.',
  },
  {
    phase: 'singletons',
    text: 'Eventually, each range has just one value. A single value is already sorted. This is where the recursion stops, and merging begins.',
  },
  {
    phase: 'left-pair',
    text: 'Start with one and four. One comes first, so their pair is already ordered. Next, bring seven into this sorted pair.',
  },
  {
    phase: 'left-ready',
    text: 'Compare seven with one. Take one, then four, then the remaining seven. The left half is now sorted: one, four, seven.',
  },
  {
    phase: 'right-pair',
    text: 'Now work on the right half. Two comes before three, so that pair is ordered. Six still needs to be merged into it.',
  },
  {
    phase: 'right-ready',
    text: 'Take two, then three, then six. Now both halves are sorted. That gives us the shortcut for the final merge.',
  },
  {
    phase: 'merge',
    text: 'Only compare the first unused value in each half. Each half is sorted, so nothing hiding behind its front can be smaller. Choose the smaller front.',
  },
  {
    phase: 'place',
    text: 'One beats two. Copy one into output slot zero, the first position. Move only i, the left pointer. The right pointer stays put.',
  },
  {
    phase: 'place',
    text: 'Now compare four with two. Two is smaller. Copy two into slot one, then move only j, the right pointer.',
  },
  {
    phase: 'place',
    text: 'Four versus three. Three is smaller, so it goes into slot two. Advance the right pointer again. Four waits at the left front.',
  },
  {
    phase: 'place',
    text: 'Four versus six. This time, four wins. Copy it into slot three, and advance the left pointer to seven.',
  },
  { phase: 'place', text: 'Seven versus six. Take six for slot four. Now the right half has no unused values left.' },
  {
    phase: 'place',
    text: 'Only seven remains. Copy it into the last slot. No comparison is needed when the other half is exhausted.',
  },
  {
    phase: 'done',
    text: 'The output is sorted: one, two, three, four, six, seven. Split into easy pieces, then repeatedly take the smaller front. That is merge sort.',
  },
];
