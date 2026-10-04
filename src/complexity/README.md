# Complexity

`time/`, `space/`, and `asymptotic/` own their authored lesson models.
Time and space own their films; asymptotic bounds own the ratio visualization
component, its reactive view-model, and its single CSS module.

The domain's `model.ts` owns the topic directory and cross-domain links. App
registries assemble these topics into navigation/search; they do not author the
lessons. The shared study shell supplies consistent tabs and bounded scrolling.

Keep bounds separate from input cases: O/Ω/Θ/o/ω describe relationships between
functions; best/average/worst describe which inputs are considered. Growth plots
are dominant-term theoretical models, not benchmark results. Algorithm-specific
complexity and Growth tabs share their case definitions under Algorithms.

Preserve meaningful chart axes, readable labels, selectable examples, centered
math on narrow screens, and plain-language explanations beside visuals. Run
architecture/build checks and `test:study`/`test:play` with the server running.
See [source conventions](../README.md) for stylesheet ownership and size limits.
