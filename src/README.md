# Source map

Start with the feature you want to change, not a global component directory.

```text
src/
  app/          # Routing, search, navigation, and composition registries
  explore/      # Study home, resource links, and author's note
  algorithms/   # Catalog, algorithm lessons, growth, walkthroughs, and films
  discrete/     # Induction, telescoping, and Master theorem content
  complexity/   # Time, space, and asymptotic-bound content
  problems/     # Interview patterns, original reasoning, and live visual stories
  shared/       # Reused study shells, MathML, tabs, playback, and foundations
  main.ts       # Application entry and the one global stylesheet import
```

## Feature anatomy

| File | Responsibility |
| --- | --- |
| `view.svelte` | Markup, bindings, and callbacks to actions |
| `view.module.css` | The presenter's one stylesheet; CSS Module isolation |
| `view-model.svelte.ts` | Reactive state, derived display data, browser actions |
| `model.ts` | Pure data and framework-independent rules |

Only create files a feature needs. Pure presenters do not need a view-model.
Do not add a second `view-model.ts`, empty `interfaces/` folders, or boilerplate
README files for every component. App registries compose domain content; topic
authors edit their domain files rather than a shared content dump.

## Styling

Each view imports `./view.module.css`. `classNames()` adds module-local classes
while retaining stable semantic DOM hooks used by browser checks and scrolling.
Shared global CSS is imported only in `main.ts`: tokens, reset, typography, and
the small set of intentionally shared study primitives. Do not place feature
selectors in the global sheet or override a child's internals from its parent.
Parents arrange their children; children own appearance and responsive rules.

UI surfaces use `border-radius: 0`: tab frames, panels, buttons, badges, fields,
menus, and embedded walkthroughs. Keep this in each owning stylesheet rather
than adding global overrides. Architecture checks reject nonzero corner radii;
Quick Sort's circular phase markers are an explicit diagram-shape exception.

Home and core-domain directories share `shared/ui/library-layout` for the
collapsed intro, tabs, padding, and bounded scroll panel. Topic links share
`library-entry`; cross-domain pointers share `domain-connections`. The sorting
catalog keeps its own comparison table inside that same shell. Adjust shared
presentation once instead of introducing a different directory layout per domain.

## Guardrails and checks

Keep hand-maintained source/CSS files at 500 physical lines or fewer, including
comments and blank lines. Split by responsibility, not arbitrary line chunks.
Generated narration metadata is explicitly exempt; formatting must not be
compressed to get around the limit. Legacy standalone walkthrough documents
remain in `public/walkthroughs/` and have their own browser regression checks.

```sh
npm run format
npm run test:architecture
npm run build
npm run test:walkthroughs
npm run test:play
npm run test:study
npm run test:domain-landings
npm run test:narration
npm run test:film-cache
```

Browser tests require an installed Playwright browser and a running local server
where indicated. On a machine using installed Chrome, set `PLAYWRIGHT_CHANNEL`
to `chrome`. A production build is not a substitute for responsive interaction
checks. Moving source and redesigning visuals are separate review steps.

The rationale and accepted tradeoffs live in
[ADR 0001](../docs/adr/0001-feature-owned-mvvm-and-styles.md).
