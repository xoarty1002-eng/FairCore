# FairCore

A Next.js solar system simulation with animated orbiting planets, orbital speed controls, and alignment detection for three planets sharing the same angle.

## Live demo

https://xoarty1002-eng.github.io/FairCore/

## Features

- Animated solar system with orbit rings
- Planet speed display and orbit range labels
- Speed Up controls for faster motion
- Alignment monitoring for three planets in the same angular position
- Notification when the triplet alignment breaks and current speeds are displayed

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Test and build

```bash
npm test
npm run build
```

The project includes a small logic test for the alignment detection and double-precision speed values.

## GitHub Pages deployment

This project is configured for static export and can be hosted on GitHub Pages.

```bash
npm run build
```

The generated static site is placed in the `out/` directory and is designed for deployment via GitHub Actions.

## Project structure

- `app/page.tsx` — main solar system UI and interaction logic
- `app/page.module.css` — layout, styling, and animation behavior
- `lib/solarSystem.ts` — alignment detection, speed calculations, and triplet logger
- `lib/solarSystem.test.ts` — verification for aligned-angle logic and speed values
- `next.config.ts` — static export setup for Pages hosting

## Notes

GitHub Pages must be enabled in the repository settings before the deployed site becomes available. After enabling Pages with GitHub Actions as the source, pushes to `main` will publish the live site automatically.
