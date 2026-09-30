# DSA Study Studio

An offline-friendly study guide with interactive walkthroughs, Python examples, discrete-math lessons, and a dedicated complexity domain.

The Pages workflow in .github/workflows/pages.yml builds the site and publishes it on every push to the default branch (currently develop). In repository Settings → Pages, choose GitHub Actions as the publishing source. The hosted Pages site is public.

## Start here

1. Install Node.js 20.19+ or 22.12+.
2. Run npm install.
3. Run npm run dev to view the site locally.
4. Run npm run build to create a static site in dist/.

The algorithm walkthrough HTML pages and Python implementations live in public/walkthroughs/, separate from the Svelte learning hub. Algorithm facts and their search projection live in src/algorithms.js; src/App.svelte renders the navigation and domain lessons. The tab-like domain links are hash routes, so a selected lesson can be bookmarked or shared.

The Tim Sort Python file is a teaching implementation of run detection, short-run extension, and merging; it is not CPython's production Tim Sort.

