# FairCore

A minimal animated solar system built with Next.js, featuring orbiting planets and a starfield background.

## Live demo

https://xoarty1002-eng.github.io/FairCore/

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build for GitHub Pages

This project is configured for static export so it can be hosted on GitHub Pages.

```bash
npm run build
```

The generated static site is written to the `out/` directory and is ready to be published from the GitHub Pages branch or deployed through the included workflow.

## GitHub Pages deployment

The repository includes a Pages workflow that builds and deploys the app automatically on pushes to the main branch.

1. In GitHub, open the repository settings.
2. Go to Pages.
3. Select GitHub Actions as the source.
4. Push to main and the workflow will publish the site.

## Project structure

- `app/page.tsx` — solar system layout and planet data
- `app/page.module.css` — animation and styling
- `next.config.ts` — static export and GitHub Pages base path config
