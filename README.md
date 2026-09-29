# Sorting Algorithm Walkthroughs

An offline-friendly study guide with seven interactive walkthroughs and matching Python examples.

The Pages workflow in .github/workflows/pages.yml builds the site and publishes it on every push to the default branch (currently develop). In repository Settings → Pages, choose GitHub Actions as the publishing source. The hosted Pages site is public.

## Start here

1. Install Node.js 20.19+ or 22.12+.
2. Run npm install.
3. Run npm run dev to view the site locally.
4. Run npm run build to create a static site in dist/.

The algorithm walkthrough HTML pages and Python implementations live in public/walkthroughs/, separate from the Svelte catalogue UI. The catalogue facts and filtering projection are in src/algorithms.js; src/App.svelte renders that model. This keeps algorithm content, display, and interaction logic easy to update independently.

The Tim Sort Python file is a teaching implementation of run detection, short-run extension, and merging; it is not CPython's production Tim Sort.
