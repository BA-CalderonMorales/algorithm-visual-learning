// Model: authored lesson content, separate from navigation and presentation.
// Math fragments are local, trusted MathML—not user input or scraped markup.
const n = value => `<mn>${value}</mn>`;
const v = value => `<mi>${value}</mi>`;
const o = value => `<mo>${value}</mo>`;
const r = (...parts) => `<mrow>${parts.join('')}</mrow>`;
const f = (top, bottom) => `<mfrac>${r(top)}${r(bottom)}</mfrac>`;
const p = (base, exponent) => `<msup>${base}${exponent}</msup>`;
const par = value => r(o('('), value, o(')'));
const next = variable => r(v(variable), o('+'), n(1));
const triangular = variable => f(r(v(variable), par(next(variable))), n(2));
const reciprocal = denominator => f(n(1), denominator);
const sigma = (index, lower, upper, term) => r(`<munderover>${o('∑')}${r(v(index), o('='), n(lower))}${v(upper)}</munderover>`, term);
const eq = (...parts) => parts.join(o('='));

export const lessonTabs = [
  { id: 'understand', label: 'Understand' }, { id: 'visualize', label: 'Visualize' },
  { id: 'examples', label: 'Examples' }, { id: 'practice', label: 'Practice' },
];

export const studyLessons = {
  induction: {
    id: 'induction', domain: 'discrete', slug: 'induction', title: 'Proof by induction',
    question: 'Why does a pattern keep working?',
    intro: 'Prove the first case. Then prove the bridge from any true case to the next.',
    idea: 'A few examples suggest a pattern. Induction proves that the pattern cannot break at the next step.',
    anchor: r(v('P'), par(n(1)), o('∧'), par(r(v('P'), par(v('k')), o('⇒'), v('P'), par(next('k'))))),
    anchorLabel: 'One starting case + a bridge for every k',
    flow: [
      { title: 'Start', body: 'State the claim P(n) and where n begins. Verify that first value directly.' },
      { title: 'Assume', body: 'For an arbitrary valid k, assume only P(k). This is the inductive hypothesis.' },
      { title: 'Bridge', body: 'Use P(k) to derive P(k + 1). Explain exactly where the hypothesis enters.' },
    ],
    facts: [
      { label: 'What the picture shows', body: 'Adding a row makes the next triangular sum. The algebra—not the picture alone—proves it for every k.' },
      { label: 'Why the chain starts', body: 'The base case supplies the first true statement. The bridge then carries truth through every later case.' },
    ],
    caution: 'Do not assume the statement at k + 1. That is the statement you still need to prove.',
    examples: [
      { title: 'Sum of the first n integers', intro: 'Claim: 1 + 2 + ··· + n = n(n + 1)/2 for every integer n ≥ 1.',
        steps: [
          { title: 'Base case', body: 'At n = 1, both sides are 1.', math: eq(n(1), f(r(n(1), o('×'), n(2)), n(2))) },
          { title: 'Hypothesis', body: 'Assume the formula at an arbitrary k ≥ 1.', math: eq(r(n(1), o('+'), o('⋯'), o('+'), v('k')), triangular('k')) },
          { title: 'Use the hypothesis', body: 'Separate the new last term; replace the old sum using the assumption.', math: r(triangular('k'), o('+'), par(next('k'))) },
          { title: 'Combine and factor', body: 'Give the added term denominator 2, then factor out k + 1.', math: eq(f(r(v('k'), par(next('k')), o('+'), n(2), par(next('k'))), n(2)), f(r(par(next('k')), par(r(v('k'), o('+'), n(2)))), n(2))) },
        ], result: 'This is exactly the claim at k + 1. The base case and bridge prove it for all n ≥ 1.' },
      { title: 'Powers of two', intro: 'Claim: 2ⁿ ≥ n + 1 for every integer n ≥ 0.', steps: [
        { title: 'Base case', body: 'At n = 0, 2⁰ = 1 and n + 1 = 1.' },
        { title: 'Hypothesis', body: 'Assume 2ᵏ ≥ k + 1 for an arbitrary k ≥ 0.' },
        { title: 'Bridge', body: 'Multiply the hypothesis by 2. Since k ≥ 0, 2(k + 1) ≥ k + 2.', math: r(p(n(2), next('k')), o('≥'), n(2), par(next('k')), o('≥'), v('k'), o('+'), n(2)) },
      ], result: 'The next power is at least the next required bound. The claim holds for all n ≥ 0.' },
      { title: 'An algorithm invariant', intro: 'Insertion sort grows a sorted prefix. This uses the same base-and-bridge structure.', steps: [
        { title: 'Base', body: 'A prefix containing one value is sorted.' },
        { title: 'Assume', body: 'Before the next insertion, assume the first k values are sorted.' },
        { title: 'Preserve', body: 'Move larger prefix values right, then insert the key after the last value no greater than it.' },
      ], result: 'The first k + 1 values are sorted. Repeating the bridge until the prefix covers the input proves the final array is sorted.' },
    ],
    checks: [
      { question: 'Where does the hypothesis enter the sum proof?', answer: 'Replace 1 + 2 + ··· + k with k(k + 1)/2. Then handle the new term k + 1.' },
      { question: 'Would checking n = 1, 2, and 3 prove the formula?', answer: 'No. Those checks establish only three cases. The arbitrary-k bridge covers every later case.' },
      { question: 'Why is assuming P(k + 1) a mistake?', answer: 'It assumes the result you are trying to establish, making the proof circular.' },
    ],
    connections: [{ title: 'See the sorted-prefix bridge', href: '#/algorithms/insertion/play' }, { title: 'Use the sum to count comparisons', href: '#/complexity/time/examples' }],
  },
  telescoping: {
    id: 'telescoping', domain: 'discrete', slug: 'telescoping', title: 'Telescoping sums',
    question: 'What survives when neighbors cancel?', intro: 'Rewrite a term as a difference. Match opposite copies. Keep the endpoints.',
    idea: 'Each interior value occurs twice: once positive and once negative. Their sum is zero. The first positive and last negative have no partners.',
    anchor: eq(sigma('k', 1, 'n', par(r(v('F'), par(v('k')), o('−'), v('F'), par(next('k'))))), r(v('F'), par(n(1)), o('−'), v('F'), par(next('n')))),
    anchorLabel: 'The endpoint rule, for n ≥ 1',
    flow: [
      { title: 'Rewrite', body: 'Look for a difference F(k) − F(k + 1). Verify your rewrite before canceling.' },
      { title: 'Match', body: 'The negative F(k + 1) cancels the positive F(k + 1) in the following term.' },
      { title: 'Keep', body: 'Keep F(1) and −F(n + 1). If the lower bound is a, the first endpoint is F(a).' },
    ],
    facts: [
      { label: 'Signs matter', body: 'Only equal magnitudes with opposite signs cancel. Crossing out two positive terms changes the sum.' },
      { label: 'Bounds matter', body: 'Write the actual first and last terms. Do not memorize the endpoints without checking the limits.' },
    ], caution: 'Not every sum telescopes. A shrinking term is not enough; you need matching opposite copies.',
    examples: [
      { title: 'A reciprocal product', intro: 'Evaluate ∑ from k = 1 to n of 1/[k(k + 1)], for n ≥ 1.', cancellation: true, steps: [
        { title: 'Verify the difference', body: 'Subtract over the common denominator. The numerator is (k + 1) − k = 1.', math: eq(r(reciprocal(v('k')), o('−'), reciprocal(next('k'))), reciprocal(r(v('k'), par(next('k'))))) },
        { title: 'Expand and cancel', body: 'Below, each matching color identifies one opposite pair. The green values are the endpoints.' },
        { title: 'Generalize', body: 'For n terms, the final negative term is −1/(n + 1).', math: eq(r(n(1), o('−'), reciprocal(next('n'))), f(v('n'), next('n'))) },
      ], result: 'For four terms, the sum is 1 − 1/5 = 4/5. In general it is n/(n + 1).' },
      { title: 'Change the lower bound', intro: 'Evaluate ∑ from k = 3 to 6 of (1/k − 1/(k + 1)).', steps: [
        { title: 'First term', body: 'At k = 3, write 1/3 − 1/4.', math: r(reciprocal(n(3)), o('−'), reciprocal(n(4))) },
        { title: 'Last term', body: 'At k = 6, write 1/6 − 1/7.', math: r(reciprocal(n(6)), o('−'), reciprocal(n(7))) },
        { title: 'Cancel the interior', body: 'The copies of 1/4, 1/5, and 1/6 cancel. Keep the actual endpoints.', math: eq(r(reciprocal(n(3)), o('−'), reciprocal(n(7))), f(n(4), n(21))) },
      ], result: 'The result is 4/21, not 1 − 1/7. The lower bound changes the first endpoint.' },
      { title: 'When it does not telescope', intro: 'Consider 1 + 1/2 + 1/3 + ··· + 1/n.', steps: [
        { title: 'Inspect the signs', body: 'Every displayed term is positive. There is no next negative copy to cancel.' },
        { title: 'Choose a different tool', body: 'This harmonic sum grows as Θ(log n). An integral bound is one way to establish that growth.' },
      ], result: 'Do not use the endpoint rule unless you have established a valid difference-and-cancellation identity.' },
    ],
    checks: [
      { question: 'For n = 3, which endpoints survive?', answer: '1 and −1/4. The sum is 1 − 1/4 = 3/4.' },
      { question: 'Can −1/3 cancel −1/3?', answer: 'No. They have the same sign. A matching pair must add to zero.' },
      { question: 'What changes if the sum starts at k = a?', answer: 'The first surviving positive term is F(a). The final surviving negative term is still −F(n + 1).' },
    ], connections: [{ title: 'Turn sums into operation counts', href: '#/complexity/time/examples' }, { title: 'Prove the endpoint identity', href: '#/discrete/induction/understand' }],
  },
  master: {
    id: 'master', domain: 'discrete', slug: 'master-theorem', title: 'Master theorem',
    question: 'Where does a recursion tree do its work?', intro: 'Compare the work between recursive calls with the tree’s branching benchmark.',
    idea: 'For equal-size recursive subproblems, the work can concentrate near the leaves, balance across levels, or concentrate near the root.',
    anchor: r(v('T'), par(v('n')), o('='), v('a'), v('T'), par(f(v('n'), v('b'))), o('+'), v('f'), par(v('n'))),
    anchorLabel: 'a ≥ 1 subproblems, shrink factor b > 1, outside work f(n)',
    flow: [
      { title: 'Read', body: 'Identify a, b, and f(n). These describe the branching, the shrinking, and the non-recursive work.' },
      { title: 'Compare', body: 'Compute n^(log_b a). Compare f(n) with this benchmark, not with a or b alone.' },
      { title: 'Check', body: 'Apply a case only when its conditions hold. Unequal splits need a different analysis.' },
    ], facts: [
      { label: 'Case 1 · leaves dominate', body: 'For some ε > 0, f(n) = O(n^(log_b a − ε)). Result: Θ(n^(log_b a)).' },
      { label: 'Case 2 · levels balance', body: 'In the basic matching case, f(n) = Θ(n^(log_b a)). Result: Θ(n^(log_b a) log n).' },
      { label: 'Case 3 · root dominates', body: 'For some ε > 0, f(n) = Ω(n^(log_b a + ε)), and a f(n/b) ≤ c f(n) for some c < 1 at sufficiently large n. Result: Θ(f(n)).' },
    ], caution: '“Smaller” and “larger” in Cases 1 and 3 require a polynomial gap. For example, n/log n is smaller than n, but does not satisfy basic Case 1 with benchmark n.',
    examples: [
      { title: 'Merge sort · balanced levels', intro: 'T(n) = 2T(n/2) + n, with constant-size base cases.', steps: [
        { title: 'Identify', body: 'a = 2, b = 2, and f(n) = n.' },
        { title: 'Benchmark', body: 'n^(log₂ 2) = n. The outside work matches it.' },
        { title: 'Count levels', body: 'Each level contributes Θ(n) work. There are Θ(log n) levels.' },
      ], result: 'Basic Case 2 gives Θ(n log n).', resultMath: r(v('T'), par(v('n')), o('='), v('Θ'), par(r(v('n'), v('log'), v('n')))) },
      { title: 'Constant outside work · leaves', intro: 'T(n) = 2T(n/2) + 1, with constant-size base cases.', steps: [
        { title: 'Compare', body: 'The benchmark is n. Constant work is polynomially smaller.' },
        { title: 'Sum the levels', body: 'For n = 8, the level costs are 1, 2, 4, and 8. Their geometric sum is 15.' },
      ], result: 'Case 1 gives Θ(n). The leaf count drives the growth.' },
      { title: 'Quadratic outside work · root', intro: 'T(n) = 2T(n/2) + n², with constant-size base cases.', steps: [
        { title: 'Compare', body: 'n² is polynomially larger than benchmark n.' },
        { title: 'Check regularity', body: '2(n/2)² = n²/2. Choose c = 1/2, which is less than 1.' },
        { title: 'Sum the levels', body: 'For n = 8, the level costs are 64, 32, 16, and 8. The root dominates.' },
      ], result: 'Case 3 gives Θ(n²).' },
      { title: 'Know when to stop', intro: 'T(n) = T(n/3) + T(2n/3) + n has unequal subproblem sizes.', steps: [
        { title: 'Check the form', body: 'There is no single b that describes both recursive calls.' },
        { title: 'Choose another method', body: 'Use a recursion tree, substitution, or an appropriate general theorem. Do not force this into the basic Master theorem.' },
      ], result: 'A theorem is useful only when its assumptions match the recurrence.' },
    ], checks: [
      { question: 'In 2T(n/2) + n, is f(n) the whole running time?', answer: 'No. f(n) = n is the outside work at one call. T(n) includes the recursive calls as well.' },
      { question: 'Why does the matching case gain log n?', answer: 'There are Θ(log n) levels, each with the same asymptotic total work.' },
      { question: 'Does “bigger than the benchmark” alone establish Case 3?', answer: 'No. You need the polynomial-gap and regularity conditions.' },
    ], connections: [{ title: 'See the merging work', href: '#/algorithms/merge/play' }, { title: 'Separate work from extra memory', href: '#/complexity/space/understand' }],
  },
  time: {
    id: 'time', domain: 'complexity', slug: 'time', title: 'Time complexity',
    question: 'How much more work does a larger input require?', intro: 'Choose an operation, count it, then describe how that count grows.',
    idea: 'Time complexity describes work as a function of input size. It is not a stopwatch measurement on one computer.',
    anchor: r(n(3), p(v('n'), n(2)), o('+'), n(8), v('n'), o('+'), n(12), o('∈'), v('Θ'), par(p(v('n'), n(2)))),
    anchorLabel: 'The dominant term controls large-input growth',
    flow: [
      { title: 'Choose', body: 'Define n and the basic operation: a comparison, a write, or another fixed-cost action.' },
      { title: 'Count', body: 'Add consecutive phases. For nested loops, count how many times the inner body actually executes.' },
      { title: 'Describe', body: 'State the input case and growth bound separately. Give an input distribution before claiming an average.' },
    ], facts: [
      { label: 'Inputs · best / average / worst', body: 'Minimum over size-n inputs; expectation under a stated distribution; maximum over size-n inputs.' },
      { label: 'Bounds · O / Ω / Θ', body: 'An asymptotic upper bound; lower bound; tight bound. Any one input case can have any of these bounds.' },
      { label: 'Common growth, slow to fast', body: '1 → log n → n → n log n → n² → 2ⁿ → n! (for sufficiently large n).' },
    ], caution: 'Nested loops are not automatically quadratic. A shrinking range or halving update changes the count.',
    examples: [
      { title: 'Selection’s shrinking scans', intro: 'Count comparisons with the current minimum for n values.', steps: [
        { title: 'First pass', body: 'The first value starts as the minimum. Compare the remaining n − 1 values.' },
        { title: 'Later passes', body: 'The unsorted suffix shrinks. Counts are n − 1, n − 2, …, 1.' },
        { title: 'Sum', body: 'At n = 5: 4 + 3 + 2 + 1 = 10. In general:', math: eq(r(par(r(v('n'), o('−'), n(1))), o('+'), o('⋯'), o('+'), n(1)), f(r(v('n'), par(r(v('n'), o('−'), n(1)))), n(2))) },
      ], result: 'The leading term is n²/2. Best, average, and worst comparison counts are all Θ(n²) for this selection-sort implementation.' },
      { title: 'A loop that halves', intro: 'Start with size = n. While size > 1, replace size with floor(size / 2).', steps: [
        { title: 'Trace n = 16', body: '16 → 8 → 4 → 2 → 1: four iterations.' },
        { title: 'Relate count to size', body: 'After t halvings, the size is about n/2ᵗ. Reaching 1 requires about log₂ n halvings.' },
      ], result: 'One constant-cost action per iteration gives Θ(log n) work.' },
      { title: 'Counting sort has two inputs', intro: 'Let n be the number of values and k = maximum − minimum + 1 be the bucket-range width.', steps: [
        { title: 'Count values', body: 'Read n input values to populate the buckets.' },
        { title: 'Process buckets', body: 'Visit k buckets. A stable version also places n output values.' },
      ], result: 'n + k + n has dominant growth Θ(n + k). A huge sparse value range can make k much larger than n.' },
      { title: 'An input case is not a bound', intro: 'Insertion sort runs on already sorted input versus reverse order.', steps: [
        { title: 'Sorted input', body: 'Each new key needs only the initial check. Best-case work is Θ(n).' },
        { title: 'Reverse order', body: 'Each new key crosses the whole sorted prefix. Worst-case work is Θ(n²).' },
      ], result: '“Worst” describes which input you choose; “Θ” describes how that input’s work grows.' },
    ], checks: [
      { question: 'Two consecutive loops each do n actions. Is the total Θ(n²)?', answer: 'No. Add their work: n + n = 2n, which is Θ(n).' },
      { question: 'Does O(n²) mean exactly n² operations?', answer: 'No. It is an asymptotic upper bound, up to constant factors for sufficiently large n.' },
      { question: 'What assumption is missing from “average-case time”?', answer: 'An input distribution. Expected work depends on how likely different inputs are.' },
    ], connections: [{ title: 'Compare the growth curves', href: '#/algorithms/selection/growth' }, { title: 'Analyze recursive work', href: '#/discrete/master-theorem/understand' }],
  },
  asymptotic: {
    id: 'asymptotic', domain: 'complexity', slug: 'asymptotic', title: 'Asymptotic bounds',
    question: 'What does a growth bound actually promise?',
    intro: 'Learn what O, o, Θ, Ω, and ω say about functions—without mixing bounds up with best, average, and worst input cases.',
    idea: 'A bound compares two functions after the input becomes large. It says how their growth relates; it does not name an input case or an exact operation count.',
    anchor: r(v('f'), o('∈'), v('O'), par(v('g')), o('⇔'), `<mtext>f(n) ≤ c · g(n) for all n ≥ n₀</mtext>`),
    anchorLabel: 'Big O: eventually, a constant multiple of g is enough to stay above f',
    flow: [
      { title: 'Name the functions', body: 'f(n) is the work or quantity you measured. g(n) is the comparison growth rate. Keep the variable and units consistent.' },
      { title: 'Ignore the small beginning', body: 'Asymptotic notation asks what happens for sufficiently large n. A finite prefix and constant factors do not decide the class.' },
      { title: 'Ask which relationship holds', body: 'Upper, lower, tight, or strict? Prove that relationship between f and g; do not infer it from the algorithm’s best or worst label.' },
    ],
    facts: [
      { label: 'O(g) · upper bound', body: 'There are constants c > 0 and n₀ such that 0 ≤ f(n) ≤ c·g(n) for every n ≥ n₀.' },
      { label: 'Ω(g) · lower bound', body: 'There are constants c > 0 and n₀ such that 0 ≤ c·g(n) ≤ f(n) for every n ≥ n₀.' },
      { label: 'Θ(g) · tight bound', body: 'Both O(g) and Ω(g) hold. f and g grow at the same asymptotic rate, up to constant factors.' },
      { label: 'o(g) · strict upper bound', body: 'f grows strictly slower than g: f(n)/g(n) → 0 as n → ∞. This is stronger than O(g).' },
      { label: 'ω(g) · strict lower bound', body: 'f grows strictly faster than g: f(n)/g(n) → ∞ as n → ∞. This is stronger than Ω(g).' },
    ],
    caution: '“Worst case” chooses which input’s work function to analyze; O, Ω, and Θ describe bounds on that function. Worst-case Θ(n²) is perfectly meaningful.',
    examples: [
      { title: 'A strict upper bound', intro: 'Compare f(n) = n log₂ n with g(n) = n².', steps: [
        { title: 'Form the ratio', body: 'Divide the actual growth by the proposed comparison: f(n)/g(n) = log₂(n)/n.' },
        { title: 'Take the limit', body: 'As n grows, log₂(n)/n approaches 0. The ratio does not merely stay bounded; it vanishes.' },
      ], result: 'n log n ∈ o(n²), and therefore also n log n ∈ O(n²). It is not Θ(n²).' },
      { title: 'A tight bound', intro: 'Compare f(n) = 3n² + 4n with g(n) = n².', steps: [
        { title: 'Form the ratio', body: 'f(n)/g(n) = 3 + 4/n.' },
        { title: 'Take the limit', body: 'The ratio approaches 3: a positive finite constant. So each function eventually stays within constant multiples of the other.' },
      ], result: '3n² + 4n ∈ Θ(n²). It is both O(n²) and Ω(n²), but neither o(n²) nor ω(n²).' },
      { title: 'A strict lower bound', intro: 'Compare f(n) = n² with g(n) = n.', steps: [
        { title: 'Form the ratio', body: 'f(n)/g(n) = n.' },
        { title: 'Take the limit', body: 'The ratio grows without limit. f eventually outruns every constant multiple of g.' },
      ], result: 'n² ∈ ω(n), and therefore also n² ∈ Ω(n). It is not O(n).' },
      { title: 'The same algorithm, different questions', intro: 'Suppose an algorithm has best-case work Θ(n) and worst-case work Θ(n²).', steps: [
        { title: 'Choose a case', body: 'Best and worst select different input families, producing different work functions.' },
        { title: 'Bound each function', body: 'You can then state a tight Θ bound, an upper O bound, or another valid relationship for either function.' },
      ], result: '“Worst case” and “Θ” are not competing labels: one picks the function; the other describes its growth.' },
    ],
    checks: [
      { question: 'If f(n) ∈ O(n²), must f(n) ∈ Θ(n²)?', answer: 'No. O gives only an eventual upper bound. n log n is O(n²), but it is not Θ(n²); its ratio to n² tends to zero.' },
      { question: 'What extra fact makes an upper bound tight?', answer: 'A matching lower bound: f ∈ O(g) and f ∈ Ω(g), together giving f ∈ Θ(g).' },
      { question: 'Is O notation synonymous with worst case?', answer: 'No. First choose the input case and define its work function. Then describe that function with an upper, lower, tight, or strict bound.' },
      { question: 'What limit distinguishes little-o from Big O?', answer: 'For nonnegative comparison functions, f ∈ o(g) when f(n)/g(n) tends to 0. Big O needs only that this ratio eventually stays bounded.' },
    ],
    comparisons: [
      { id: 'strict-upper', title: 'Strict upper · o(g)', fLabel: 'n log₂ n', gLabel: 'n²', f: n => n * Math.log2(n), g: n => n * n, conclusion: 'The ratio approaches 0: f is little-o of g, and also Big O of g.' },
      { id: 'tight', title: 'Tight · Θ(g)', fLabel: '3n² + 4n', gLabel: 'n²', f: n => 3 * n * n + 4 * n, g: n => n * n, conclusion: 'The ratio approaches 3: f and g bound each other within constants, so f is Θ(g).' },
      { id: 'strict-lower', title: 'Strict lower · ω(g)', fLabel: 'n²', gLabel: 'n', f: n => n * n, g: n => n, conclusion: 'The ratio grows without bound: f is little-omega of g, and also Ω(g).' },
    ],
    connections: [{ title: 'Apply bounds to algorithm cases', href: '#/complexity/time/understand' }, { title: 'See growth curves for sorting', href: '#/algorithms/sorting' }],
  },
  space: {
    id: 'space', domain: 'complexity', slug: 'space', title: 'Space complexity',
    question: 'What has to be stored at the same time?', intro: 'Separate the input from extra storage, then count the peak live memory.',
    idea: 'Memory complexity counts what is alive simultaneously. Repeatedly reusing one buffer does not multiply its size by the number of steps.',
    anchor: r(`<mtext>total space</mtext>`, o('='), `<mtext>input</mtext>`, o('+'), `<mtext>auxiliary space</mtext>`),
    anchorLabel: 'State which definition you are using',
    flow: [
      { title: 'Separate', body: 'Input storage already exists. Auxiliary storage is the extra memory used to perform the computation.' },
      { title: 'Find', body: 'Count temporary arrays, held values, maps, and live recursive-call frames.' },
      { title: 'Peak', body: 'Find the largest amount alive at one moment. Do not add allocations that have already been released or reused.' },
    ], facts: [
      { label: 'In place', body: 'Insertion and selection sorts here keep only a fixed number of extra values and indices: Θ(1) auxiliary space.' },
      { label: 'Recursion', body: 'A recursion stack counts as auxiliary space. Count depth, not the total number of calls ever made.' },
      { label: 'Time is separate', body: 'Two algorithms with similar runtime can use very different amounts of working memory.' },
    ], caution: 'Implementation choices matter: slices, copies, returned arrays, and unreused buffers can change the space bound.',
    examples: [
      { title: 'One held key', intro: 'An in-place insertion sort operates on an existing n-value array.', steps: [
        { title: 'Input', body: 'The array takes Θ(n) space. It is not auxiliary memory.' },
        { title: 'Extra', body: 'One key and a fixed number of indices do not grow with n.' },
      ], result: 'Auxiliary space is Θ(1); total space including the input is Θ(n).' },
      { title: 'One reusable merge buffer', intro: 'An efficient array merge sort allocates one n-cell buffer and uses recursive halves.', steps: [
        { title: 'Buffer', body: 'The shared buffer costs Θ(n), even when reused for many merges.' },
        { title: 'Stack', body: 'Balanced splitting has Θ(log n) simultaneous call frames.' },
        { title: 'Combine', body: 'The peak extra memory is Θ(n + log n), dominated by the buffer.' },
      ], result: 'Auxiliary space is Θ(n), not Θ(n log n) for this buffer-reuse implementation.' },
      { title: 'A quicksort stack', intro: 'Consider the standard recursive in-place partitioning version.', steps: [
        { title: 'Balanced partitions', body: 'The longest active call chain has Θ(log n) frames.' },
        { title: 'Repeatedly unbalanced partitions', body: 'The chain can reach Θ(n) frames. An implementation that always recurses on the smaller side can limit this stack growth.' },
      ], result: '“In-place partition” does not mean “no recursive stack.” State the implementation and the input case.' },
      { title: 'Counting buckets and output', intro: 'A stable counting sort has n values and a range of k bucket positions.', steps: [
        { title: 'Buckets', body: 'Counts need k cells.' },
        { title: 'Output', body: 'The output buffer needs n cells; holding both requires Θ(n + k) extra space.' },
      ], result: 'A frequency-only reconstruction may avoid a separate output array; that is a different implementation.' },
    ], checks: [
      { question: 'If you reuse one n-cell buffer 20 times, is auxiliary space 20n?', answer: 'No. The peak buffer storage is n cells. Reuse changes neither its size nor its asymptotic bound.' },
      { question: 'Does making n recursive calls always require Θ(n) stack space?', answer: 'No. The stack counts simultaneous active calls. A balanced recursion tree can have n total calls but only Θ(log n) depth.' },
      { question: 'Can an algorithm have Θ(1) auxiliary space and Θ(n) total space?', answer: 'Yes. An in-place algorithm can use constant extra storage while the input itself occupies n cells.' },
    ], connections: [{ title: 'See the merge buffer in context', href: '#/algorithms/merge/play' }, { title: 'Compare time and space', href: '#/complexity/time/understand' }],
  },
};

export const studyDomains = {
  discrete: { title: 'Discrete mathematics', intro: 'Three tools for explaining why a pattern holds and where a computation’s work comes from.', topics: ['induction', 'telescoping', 'master'], bridge: 'These are tools for algorithms, too: induction proves a sorted prefix, sums count comparisons, and recurrences explain merging.', links: [{ title: 'Sorting algorithms', href: '#/algorithms/sorting' }, { title: 'Time and space', href: '#/complexity' }] },
  complexity: { title: 'Complexity', intro: 'First learn how growth bounds compare functions. Then analyze how much work and memory an algorithm needs.', topics: ['asymptotic', 'time', 'space'], bridge: 'Bounds describe a function’s growth; best, average, and worst describe which input family produced that function. Time and space ask what resource is being counted.', links: [{ title: 'Compare sorting algorithms', href: '#/algorithms/sorting' }, { title: 'Proofs and recurrences', href: '#/discrete' }] },
};

export const lessonHref = (lesson, view = '') => `#/${lesson.domain}/${lesson.slug}${view ? `/${view}` : ''}`;
