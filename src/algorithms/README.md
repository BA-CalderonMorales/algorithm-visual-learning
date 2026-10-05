# Algorithms

`model.ts` owns catalog metadata. `lessons.ts` owns Understand, Practice, and
complexity explanations. `view-model.svelte.ts` owns catalog filtering and
sorting; `view.svelte` presents the catalog.

```text
algorithms/
  components/
    lesson/           # Shared algorithm page and its local styles
    walkthrough/      # Legacy iframe loading/recovery and motion bridge
    implementation/   # Sorting-specific language tabs and version notes
    growth/           # Case models, Chart.js state, and presentation
  implementations/   # Lazy source adapter and implementation version notes
  selection/
    film.ts           # Original scenes; same convention for other sorts
    implementations/
      python-simple.py
      python-typed.py
      javascript.js
      typescript.ts
  merge/             # Merge scenes and the optional browser-voice adapter
  play/              # Sorting renderer, narration scripts, and clip validation
```

Keep algorithm-specific decisions in models, not Svelte markup. All sorting
pages reuse the same lesson, playback, tabs, and walkthrough-loading components.
Source examples live beside their owning algorithm, not in catalog filename
fields. Add the four conventionally named files to a new algorithm's
`implementations/` folder; the lazy raw-source adapter discovers them. Code
loading, syntax highlighting, and line-number presentation are shared with
Problems in `shared/ui/code-view/`. App state owns routes, not fetched code.

Edit only these canonical sources. `npm run sync:implementations` maintains
the old `public/walkthroughs/*_sort.*` source URLs for existing links (also run
automatically before dev/build). They are compatibility copies, not a second
authoring location. `npm run test:implementation-models` rejects stale copies
and executes every example against independent correctness checks; set
`PYTHON` to your Python executable if it is not on PATH.

Simple and typed versions are not always identical algorithms or mutation
contracts. Keep their visible version notes accurate; don't assume a typed
example merely adds annotations. Sorting routes retain their existing URLs.
The static HTML traces are still separately delivered documents in
`public/walkthroughs/`; preserve their shared layout, legends, and i/j markers.

Recorded Echo audio remains opt-in and lazily fetched one scene at a time. Do
not place API keys in source or the browser bundle. Clip validation must stay
aligned with the exact story before recordings are offered.

Run the architecture, walkthrough, Play, narration, and film-cache checks after
changes. Preserve tablet controls, mobile readability, sharp edges, focused-step
scrolling, and the distinction between theoretical growth and measured timing.
See [source conventions](../README.md) for CSS ownership and the 500-line limit.
