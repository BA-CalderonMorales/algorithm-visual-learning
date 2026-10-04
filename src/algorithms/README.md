# Algorithms

`model.ts` owns catalog metadata. `lessons.ts` owns Understand, Practice, and
complexity explanations. `view-model.svelte.ts` owns catalog filtering and
sorting; `view.svelte` presents the catalog.

```text
algorithms/
  components/
    lesson/           # Shared algorithm page and its local styles
    walkthrough/      # Legacy iframe loading/recovery and motion bridge
    implementation/   # Source loading, tokenization, and code presentation
    growth/           # Case models, Chart.js state, and presentation
  selection/film.ts   # Original scene data; same convention for other sorts
  merge/             # Merge scenes and the optional browser-voice adapter
  play/              # Sorting renderer, narration scripts, and clip validation
```

Keep algorithm-specific decisions in models, not Svelte markup. All sorting
pages reuse the same lesson, playback, tabs, and walkthrough-loading components.
The static HTML traces are still separately delivered documents in
`public/walkthroughs/`; preserve their shared layout, legends, and i/j markers.

Recorded Echo audio remains opt-in and lazily fetched one scene at a time. Do
not place API keys in source or the browser bundle. Clip validation must stay
aligned with the exact story before recordings are offered.

Run the architecture, walkthrough, Play, narration, and film-cache checks after
changes. Preserve tablet controls, mobile readability, sharp edges, focused-step
scrolling, and the distinction between theoretical growth and measured timing.
See [source conventions](../README.md) for CSS ownership and the 500-line limit.
