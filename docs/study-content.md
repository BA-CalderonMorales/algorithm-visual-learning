# Maintaining the study views

Keep explanations in the models and presentation in the shared components. No new framework or page-specific tab system is needed.

- `src/study-lessons.js`: Discrete Mathematics and Complexity lessons, examples, checks, and related-topic links.
- `src/StudyLesson.svelte`: the bounded Understand / Visualize / Examples / Practice workspace.
- `src/StudyTabs.svelte`: shared tabs for lessons, algorithms, implementation languages, and home. Preserve native deep links, keyboard navigation, and the document’s scroll position when switching views.
- `src/StudyLibrary.svelte`: home, resources, author’s note, and domain directories.
- `src/play-models.js`: concept scenes and example choices. `conceptVariants` supplies each lesson’s selector.
- `src/play-renderer.js`: deterministic canvas rendering, shared with the exported videos.

## Add or revise an explanation

1. State one question and its underlying idea. Keep the first view focused; put worked examples in Examples and self-checks in Practice.
2. Write trusted MathML using the existing helpers. Keep formulas centered, and use matching colors only when terms actually match. Include the assumptions and bounds needed for the result.
3. Give each visualization a specific learning purpose. Retain item identities between scenes and leave enough space between rows. Do not replace algorithm Play films when revising a concept lesson.
4. Link the idea to a useful topic in another domain, rather than adding an unrelated recommendation.

## Verify locally

```sh
npm run build
npm run test:study
npm run test:play
npm run test:walkthroughs
```

These browser checks cover desktop, tablet, and phone widths. If bundled Chromium is unavailable on Windows, set `PLAYWRIGHT_CHANNEL=msedge`. Visually inspect the generated study screenshots too: an overflow check cannot establish that a fraction or diagram is readable.

After changing a film, regenerate its local video with `node scripts/render-films.mjs <film-id>`, then build again. Example IDs are defined in `conceptVariants`. The live player and exported video must tell the same story.

Check external resource access labels against official sources; avoid maintaining prices. Preview changes locally before following the repository’s release process.
