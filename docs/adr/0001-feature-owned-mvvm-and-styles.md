# ADR 0001: Feature-owned MVVM and presentation styles

- Status: Accepted
- Date: 2026-10-04

## Context

The study site is growing beyond sorting algorithms. Routing, search, learning
content, playback, and presentation have accumulated in flat source files. CSS
overrides also make responsive changes harder to isolate. Contributors need to
find the owner of an explanation, diagram, behavior, or visual rule quickly.

We must preserve the established dark theme, sharp study controls, familiar tabs,
collapsed introductions, bounded scrolling, persistent legends, pointer colors,
responsive walkthroughs, and opt-in recorded narration.

## Decision

Organize source by domain and feature: `app`, `explore`, `algorithms`, `discrete`,
and `complexity`. Use `shared` only for foundations or genuinely reused behavior
and components. Share lesson shells rather than copying them per topic.

For each feature that needs these responsibilities:

```text
feature/
  view.svelte
  view.module.css
  view-model.svelte.ts
  model.ts
  components/
```

- Views contain presentation, bindings, and callback wiring, not business rules,
  fetching, search ranking, chart calculations, or playback orchestration.
- View-models own reactive state, derived presentation data, and actions. Use
  `.svelte.ts` for Svelte runes; do not add parallel `view-model.ts` files.
- Models own framework-independent content and rules. Browser integrations belong
  in dedicated adapters, not pure models.
- Every presentation component imports one colocated CSS module. Do not keep
  inline `<style>` blocks alongside a second feature stylesheet.
- Shared global CSS provides tokens, reset, and typography. Parents own layout;
  children own their internal appearance. Do not reach through child components
  with override selectors. Avoid `!important`; explain unavoidable exceptions.
- Responsive rules stay with the component they affect. Account for available
  component width, keyboard access, readable labels, and reduced motion.
- Create `interfaces`, `constants`, and additional view-models only when useful;
  do not generate empty folders or ceremonial files.
- Each hand-maintained source or CSS file must be at most 500 physical lines.
  Count comments and blank lines. Never compress formatting to evade the limit.
  Generated artifacts, media, lockfiles, and editable diagram assets are exempt.
- READMEs live only at the repository root, `src`, `src/algorithms`,
  `src/discrete`, and `src/complexity`. Do not scatter them through components.

Use original Excalidraw diagrams with editable source and SVG exports. Diagrams
should teach one relationship using consistent labels, semantic colors, and
accessible descriptions. Learn from Hello Interview's explanatory hierarchy,
not by copying its content, proprietary assets, branding, or commercial layout.

## Consequences

Ownership becomes discoverable and views remain small. CSS Modules add class
mapping in templates, but avoid global collisions without a new CSS framework.
The Svelte suffix identifies reactive compilation, not a presentation layer.

Refactor incrementally with responsive baselines. Moving code and changing its
appearance are separate reviewable steps. Preserve routes, DOM hooks, scroll
behavior, audio timing, and film rendering/cache dependencies. Embedded legacy
walkthroughs remain separate documents until explicitly migrated; they need
their own shared token/style delivery and must not be silently broken.

Enforce the source-size and presentation boundaries in checks. Existing legacy
exceptions must be listed explicitly and removed as their migration completes;
new files may not expand that exception list casually. A green build alone is
not sufficient: verify all algorithms and learning domains in desktop, tablet,
and phone views before publishing. Publication requires user approval.
