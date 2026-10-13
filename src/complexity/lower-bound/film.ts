import { film, frame, text } from '../../shared/playback/model.ts';
export const playFilms = {
  'lower-bound': film(
    'lower-bound',
    'Questions eliminate possible orders.',
    'Leaf capacity limits what comparisons can distinguish.',
    [
      frame(
        'Possibilities',
        'Three labeled items. Six possible orders.',
        'ABC, ACB, BAC, BCA, CAB, and CBA are all possible before comparing values.',
        [],
        { texts: [text('orders', 'ABC  ACB  BAC  BCA  CAB  CBA', 0.5, 0.4, 'group')] },
      ),
      frame(
        'First question',
        'Ask whether A < B.',
        'If yes, retain ABC, ACB, CAB. If no, retain BAC, BCA, CBA. One answer does not identify the complete order.',
        [],
        {
          texts: [
            text('yes', 'A < B: ABC  ACB  CAB', 0.5, 0.35, 'key'),
            text('no', 'A > B: BAC  BCA  CBA', 0.5, 0.65, 'compare'),
          ],
        },
      ),
      frame(
        'Capacity',
        'Two questions have only four outcome paths.',
        'Four leaves cannot distinguish six distinct orders. At least one execution requires a third comparison.',
        [],
        {
          texts: [
            text('capacity', '2² = 4 < 6 = 3!', 0.5, 0.4, 'compare'),
            text('bound', 'worst case ≥ ceil(log₂6) = 3', 0.5, 0.65, 'sorted'),
          ],
        },
      ),
    ],
    [{ title: 'Counting sort uses more than comparisons', href: '#/algorithms/counting/understand' }],
  ),
};
