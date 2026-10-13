import { lesson } from './lesson.ts';
const make = (...args: Parameters<typeof lesson> extends [string, ...infer Rest] ? Rest : never) =>
  lesson('matrices', ...args);
export const lessons = [
  make(
    'Spiral Matrix',
    'Consume the top, right, bottom, and left boundaries, shrinking them after each side.',
    'The remaining rectangle contains exactly the unvisited cells.',
    '[[1,2,3],[4,5,6]]',
    [
      'top row → 1,2,3 :: Advance the top boundary.',
      'right side → 6 :: Move the right boundary inward.',
      'bottom → 5,4 :: Stop when the rectangle becomes empty; result [1,2,3,6,5,4].',
    ],
    'O(rows × columns)',
    'O(1) working boundaries plus output',
    'Recheck boundaries before the bottom and left sides to avoid revisiting a single remaining row or column.',
    'Why recheck boundaries between sides?',
    ['An earlier side may consume the remaining rectangle', 'To sort the output', 'To find zero cells'],
    'Thin rectangles can become empty halfway through a round.',
  ),
  make(
    'Rotate Image',
    'For a square matrix, transpose then reverse each row to rotate clockwise.',
    'Transpose exchanges row and column coordinates; row reversal completes the rotation.',
    '[[1,2],[3,4]]',
    [
      'transpose → [[1,3],[2,4]] :: Swap only one side of the diagonal.',
      'reverse rows → [[3,1],[4,2]] :: Complete a 90-degree clockwise turn.',
      'old (r,c) → new (c,n−1−r) :: The coordinate mapping explains both operations.',
    ],
    'O(n²)',
    'O(1) in place',
    'A rectangular matrix changes dimensions and cannot use the same square in-place procedure.',
    'What if both sides of the diagonal are swapped?',
    ['Each pair is swapped twice, undoing the transpose', 'The matrix rotates twice', 'Nothing can go wrong'],
    'Visit each off-diagonal pair exactly once.',
  ),
  make(
    'Set Matrix Zeroes',
    'Record original zero rows/columns using boundary markers, then apply those markers.',
    'Markers reflect original zeroes, not zeroes introduced during the update.',
    '[[1,0],[3,4]]',
    [
      'original zero at (0,1) :: Row 0 and column 1 must become zero.',
      'save first-row and first-column flags :: Boundary marker cells also belong to the input.',
      'result [[0,0],[3,0]] :: Apply interior markers before clearing the boundaries.',
    ],
    'O(rows × columns)',
    'O(1) using first row/column markers',
    'Immediate propagation can make new zeroes incorrectly trigger additional rows.',
    'Why separate marking from applying?',
    ['New zeroes must not create new obligations', 'The matrix needs sorting', 'Only diagonals can contain zeroes'],
    'Only original zero positions determine the affected rows and columns.',
  ),
];
