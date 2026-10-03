<div align="center">

# Algorithm Visual Learning

**A visual study guide for understanding algorithms, discrete mathematics, and complexity.**

[![Live site](https://img.shields.io/badge/site-live-1f9d8b?style=flat-square)](https://ba-calderonmorales.github.io/algorithm-visual-learning/)
[![Pages build](https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/algorithm-visual-learning/pages.yml?branch=develop&label=build&style=flat-square)](https://github.com/BA-CalderonMorales/algorithm-visual-learning/actions)

![The study home page with Explore, Resources, and Author’s note tabs](screenshots/study-home.png)

</div>

## Quick Start

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To verify the production build:

```bash
npm run build
```

Before publishing, check the rendered walkthroughs in a browser:

```bash
npx playwright install chromium
npm run test:walkthroughs
```

These checks cover every sorting walkthrough at desktop, tablet, and phone widths, including navigation, reloads, animations, and recovery from a failed load. They run against development and the production preview; GitHub Pages deployment waits for them to pass.

## Publish to GitHub Pages

Publishing is automatic: push or merge changes to `develop`. The Pages workflow builds the site and deploys it. Check the [Actions runs](https://github.com/BA-CalderonMorales/algorithm-visual-learning/actions) for the result; the live site updates after a successful run.

To deploy the current `develop` branch again without a new change, open **Actions → Build and publish Sorting Walkthroughs → Run workflow**. GitHub Pages should use **GitHub Actions** as its source under **Settings → Pages**. No release tag is needed for a site deployment.

## Project Layout

```text
src/                    # Svelte learning hub and algorithm catalogue
public/walkthroughs/    # walkthroughs plus simple/typed Python, JS, and TS examples
public/study-mark.svg   # site favicon
.github/workflows/      # GitHub Pages build and deployment
```

The walkthrough pages are standalone HTML so they also work independently. Tim Sort's Python file is an educational implementation, not CPython's production sort.

Each algorithm page starts with a plain Python version for learning the core idea, then offers typed Python, JavaScript, and TypeScript examples. These are teaching references; some, including Tim Sort, intentionally favor clarity over production-level optimizations.

## Recorded narration

Sorting Play tabs offer optional Echo narration, loaded one scene at a time. Students need no speech service or API key. To regenerate the recordings locally with Lemonade, see [the narration guide](public/narration/echo/README.md).

## Contributing

This project is designed to be forked, adapted for future classes, and improved by students. See [CONTRIBUTING.md](CONTRIBUTING.md) for the small local workflow and teaching-focused guidelines, and [CONTRIBUTORS.md](CONTRIBUTORS.md) for attribution. The project is licensed under the [MIT License](LICENSE).
