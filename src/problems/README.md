# Problems

Start with `model.ts`: the pattern catalog, routes, and search entries. The domain
directory uses the same library shell as Home. `two-pointers/lessons.ts` owns
original explanations, common traps, practice questions, and external references.

The first review covers Two Sum on a sorted array, Container With Most Water,
and 3-Sum. No other pattern buckets or empty lessons are created yet. This is not
a claim that the collection is a complete Blind 75 curriculum.

Each problem owns `two-pointers/<problem>/implementations/<approach>/` with
`python-simple.py`, `python-typed.py`, `javascript.js`, and `typescript.ts`.
The bucket's `implementations/model.ts` describes Brute / Better / Best,
contracts, examples, and costs; `source-loader.ts` lazily imports source as
text, never executable browser code. The shared Algorithms code viewer provides
highlighting and line numbers. Do not duplicate that renderer per problem.

Approaches are a vertical tab rail; languages stay horizontal. Both selections
are linkable routes and retain the other selection. These are solution
approaches, not best/average/worst input cases: Container's pruning remains
quadratic in the worst case; 3-Sum's two improved approaches mainly differ in
deduplication and memory. All current problem examples preserve input and Two
Sum returns zero-based indices. No personal notes editor or code runner is
implied by the implementation viewer.

Each pure story builder snapshots its states. `renderer.ts` animates pointer
positions, never reorders the array during a scan, and supports deterministic
seeking/reverse and reduced motion. The shared player owns transport controls;
the problem view owns layout, and its small view-model owns tab-scroll state.

These local live animations are intentionally outside the production film-export
registry until reviewed. They have no new recorded narration or downloadable
video yet. Personal notebook storage is not implemented: written reasoning is
shared study content, not notes attributed to the author without their input.

Hello Interview is credited as a pattern reference and linked for deeper study.
Do not copy their course text, implementations, diagrams, or proprietary assets.

Run `npm run test:problems`, the architecture checks, and shared navigation/domain
regressions before expanding the pattern. Keep new hand-maintained files at most
500 lines and all presentation surfaces square.
Run `npm run test:implementation-models` for actual source correctness and
`npm run test:implementations` after building for responsive dev/Pages-base
loading, tab keyboard navigation, history, and scroll preservation.
