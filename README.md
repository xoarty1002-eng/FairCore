# FairCore

A polished Next.js solar system simulation that continuously orbits planets, speeds up on demand, and detects when three planets align on the same angle. The app is designed to be a lightweight interactive demo with a single button-driven flow: start orbiting, click the sun to boost, stop automatically on a three-planet alignment, and resume from the last alignment state on the next click.

## Live demo

https://xoarty1002-eng.github.io/FairCore/

## Features

- Animated planet orbits with layered orbit rings and a central sun
- Real-time speed and orbit range readouts for each planet
- Single-click boost behavior: the sun button starts or resumes speed acceleration
- Alignment detection for three planets sharing the same angular position
- Freeze on alignment and resume from the last alignment frame when clicked again
- Top-of-page time counter that increases during the boost phase
- Static export setup for GitHub Pages deployment

## How it works

1. The planets begin orbiting automatically when the page loads.
2. Clicking the sun begins a speed boost.
3. The simulation keeps accelerating until a triplet alignment is detected.
4. Once aligned, the system pauses and displays the angle and planet speeds.
5. Clicking the sun again resumes orbiting from the current speed/alignment state instead of resetting from the initial frame.

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

The project includes regression checks for the triplet-alignment logic and double-precision speed calculations.

## GitHub Pages deployment

This project is configured for static export and publishing through GitHub Pages.

```bash
npm run build
```

The generated static site is emitted to the `out/` directory and is ready for deployment via GitHub Actions or a Pages-compatible hosting flow.

## Project structure

- `app/page.tsx` — main solar system UI, speed-boost logic, freeze/resume behavior, and timer
- `app/page.module.css` — visual styling, layout, orbit animation, and UI treatment
- `lib/solarSystem.ts` — orbital angle math, speed calculations, and triplet alignment detection
- `lib/solarSystem.test.ts` — validation for alignment detection and precision-sensitive speed handling
- `next.config.ts` — static-export settings for Pages hosting

## Notes

GitHub Pages must be enabled in the repository settings before the site becomes publicly available. After enabling Pages with GitHub Actions as the source, pushes to the `main` branch will publish the live site automatically.
