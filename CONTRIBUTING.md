# Contributing

Thanks for helping make Algorithm Visual Learning clearer and more useful for future students. Small, focused contributions are welcome: correcting an explanation, improving an example, fixing an accessibility or responsive issue, or adding a carefully scoped lesson.

## Get started

1. Fork the repository on GitHub and clone your fork.
2. Install dependencies with `npm ci`.
3. Start the local site with `npm run dev` and check the production build with `npm run build`.
4. Create a focused branch, make your change, and open a pull request against `develop` with a short explanation of the learner problem it solves.

GitHub Pages deploys automatically when changes are merged into `develop`. A fork can enable Pages in **Settings → Pages** and select **GitHub Actions** to publish its own copy; the existing workflow builds and deploys the site.

## Teaching and interface principles

- Explain the invariant, decision, or reason behind a step—not just the action.
- Prefer a small, readable example and explicit intermediate states over decorative complexity.
- Keep walkthroughs usable with keyboard, touch, narrow screens, and assistive technology.
- Preserve the site's shared visual language and keep algorithm-specific facts accurate.
- Treat implementations as teaching references; call out deliberate simplifications or assumptions.
- Avoid adding dependencies unless they solve a concrete problem that the existing stack cannot handle simply.

## Before opening a pull request

- Follow [the source map](src/README.md) and [ADR 0001](docs/adr/0001-feature-owned-mvvm-and-styles.md): feature-owned models and view-models, presentation-only views, one colocated CSS module per view, and a 500-line source-file limit.
- Run `npm run test:architecture` and `npm run format:check`.
- Run `npm run build` and resolve any errors.
- Check the affected page at desktop and narrow/tablet widths.
- For walkthrough changes, step forward and backward, reset, and try shuffle or presets when available.
- Include screenshots or a concise before/after note for visual changes.

If you are unsure whether an idea fits, open an issue first. Please do not include private student information, course materials you do not have permission to share, or copyrighted material without authorization.
