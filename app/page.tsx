"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  calculatePlanetSpeed,
  findAlignedTriplets,
  logAlignedTriplets,
} from "@/lib/solarSystem";
import styles from "./page.module.css";

const initialPlanets = [
  { name: "Mercury", orbit: 88, baseDuration: 6, size: 7, color: "#d9d4c5" },
  { name: "Venus", orbit: 130, baseDuration: 9, size: 12, color: "#f4c56d" },
  { name: "Earth", orbit: 180, baseDuration: 12, size: 14, color: "#56a7ff" },
  { name: "Mars", orbit: 240, baseDuration: 15, size: 11, color: "#ff7a59" },
  { name: "Jupiter", orbit: 310, baseDuration: 20, size: 22, color: "#d08b5a" },
  { name: "Saturn", orbit: 380, baseDuration: 26, size: 19, color: "#e8d39c" },
  { name: "Uranus", orbit: 450, baseDuration: 32, size: 16, color: "#89d9f5" },
  { name: "Neptune", orbit: 520, baseDuration: 38, size: 15, color: "#5d7dff" },
].map((planet) => ({
  ...planet,
  speed: calculatePlanetSpeed(planet.orbit),
  range: `${Math.round(planet.orbit * 0.8)}–${Math.round(planet.orbit * 1.2)} px`,
}));

logAlignedTriplets(
  initialPlanets.map((planet) => ({
    name: planet.name,
    orbitRadius: planet.orbit,
    size: planet.size,
    color: planet.color,
    speed: planet.speed,
  })),
);

export default function Home() {
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [statusMessage, setStatusMessage] = useState(
    "Orbit speed is stable. Three-planet alignment is being monitored.",
  );

  const animatedPlanets = useMemo(
    () =>
      initialPlanets.map((planet) => ({
        ...planet,
        adjustedSpeed: Number((planet.speed * speedMultiplier).toFixed(4)),
        duration: `${Math.max(1.2, Number((planet.baseDuration / speedMultiplier).toFixed(2)))}s`,
      })),
    [speedMultiplier],
  );

  useEffect(() => {
    const alignedTriplets = findAlignedTriplets(
      animatedPlanets.map((planet) => ({
        name: planet.name,
        orbitRadius: planet.orbit,
        size: planet.size,
        color: planet.color,
        speed: planet.adjustedSpeed,
      })),
      1,
      0,
    );

    if (alignedTriplets.length > 0) {
      const details = alignedTriplets[0].planets
        .map(
          (planet) =>
            `${planet.name}=${planet.speed.toFixed(4)}x`,
        )
        .join(", ");

      setStatusMessage(
        `Aligned triplet at ${alignedTriplets[0].angle.toFixed(2)}°: ${details}`,
      );
      return;
    }

    const speeds = animatedPlanets
      .map((planet) => `${planet.name}=${planet.adjustedSpeed.toFixed(4)}x`)
      .join(", ");

    setStatusMessage(
      `No alignment at ${speedMultiplier.toFixed(2)}x. Current speeds: ${speeds}`,
    );
  }, [animatedPlanets, speedMultiplier]);

  const handleSpeedUp = () => {
    const nextMultiplier = Number((speedMultiplier + 0.5).toFixed(2));
    setSpeedMultiplier(nextMultiplier);
  };

  const handleSpeedUpUntilAligned = () => {
    let nextMultiplier = Number((speedMultiplier + 0.5).toFixed(2));
    let found = false;

    while (!found) {
      const trial = initialPlanets.map((planet) => ({
        ...planet,
        speed: Number((planet.speed * nextMultiplier).toFixed(4)),
      }));

      const triplets = findAlignedTriplets(
        trial.map((planet) => ({
          name: planet.name,
          orbitRadius: planet.orbit,
          size: planet.size,
          color: planet.color,
          speed: planet.speed,
        })),
        1,
        0,
      );

      if (triplets.length > 0) {
        found = true;
        const details = triplets[0].planets
          .map((planet) => `${planet.name}=${planet.speed.toFixed(4)}x`)
          .join(", ");

        setSpeedMultiplier(nextMultiplier);
        setStatusMessage(
          `Alignment found at ${nextMultiplier}x speed! Aligned triplet at ${triplets[0].angle.toFixed(2)}°: ${details}`,
        );
        window.alert(
          `Alignment found at ${nextMultiplier}x speed!\n${details}\n\nRestoring to default speed...`,
        );

        // Restore to default after 3 seconds
        setTimeout(() => {
          setSpeedMultiplier(1);
          setStatusMessage("Orbit speed restored to 1x (default). Three-planet alignment is being monitored.");
        }, 3000);
        return;
      }

      nextMultiplier = Number((nextMultiplier + 0.5).toFixed(2));

      // Safety limit to prevent infinite loop
      if (nextMultiplier > 20) {
        setStatusMessage(
          "No alignment found within reasonable speed range. Try again.",
        );
        window.alert("No alignment found. Try again.");
        return;
      }
    }
  };

  const handleSpeedUpUntilUnaligned = () => {
    let nextMultiplier = Number((speedMultiplier + 0.5).toFixed(2));
    let aligned = true;

    while (aligned) {
      const trial = initialPlanets.map((planet) => ({
        ...planet,
        speed: Number((planet.speed * nextMultiplier).toFixed(4)),
      }));

      const triplets = findAlignedTriplets(
        trial.map((planet) => ({
          name: planet.name,
          orbitRadius: planet.orbit,
          size: planet.size,
          color: planet.color,
          speed: planet.speed,
        })),
        1,
        0,
      );

      if (triplets.length === 0) {
        aligned = false;
        const details = trial
          .map((planet) => `${planet.name}=${planet.speed.toFixed(4)}x`)
          .join(", ");

        setSpeedMultiplier(nextMultiplier);
        setStatusMessage(
          `Three planets are no longer aligned. Current speeds: ${details}`,
        );
        window.alert(
          `Three planets are no longer aligned. Current speeds: ${details}`,
        );
        return;
      }

      nextMultiplier = Number((nextMultiplier + 0.5).toFixed(2));
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <img
          src="https://private-user-images.githubusercontent.com/287196754/643088478-040f63a8-1f9e-4b4a-87c2-916cb8c816de.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODgwODc2ODUsIm5iZiI6MTc4ODA4NzM4NSwicGF0aCI6Ii8yODcxOTY3NTQvNjQzMDg4NDc4LTA0MGY2M2E4LTFmOWUtNGI0YS04N2MyLTkxNmNiOGM4MTZkZS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwODMwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDgzMFQxMDU2MjVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02M2Q5YTMzNzA1MTE4OTQyYzcyMjVkMjA0MjU5NDgzZmEwZGJlNjU0YWUzODYzYzBlYTBhNDYwYjEzMGM0NGU0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.qIlqwepckTjugX-iW3OQfl9xl6RdWDbZQv48pRKWp48"
          alt="FairAI Core Logo"
          className={styles.logo}
        />
        <p className={styles.kicker}>FairAI Core</p>
        <h1>Solar System</h1>
      </header>

      <div className={styles.controls}>
        <button type="button" className={styles.primaryButton} onClick={handleSpeedUpUntilAligned}>
          Find Alignment
        </button>
      </div>

      <div className={styles.status} role="status" aria-live="polite">
        {statusMessage}
      </div>

      <div className={styles.system} aria-label="Animated solar system">
        <button
          type="button"
          onClick={handleSpeedUpUntilAligned}
          className={styles.sunButton}
          aria-label="Find alignment button"
        >
          ⏱️
        </button>

        {animatedPlanets.map((planet) => {
          const orbitStyle = {
            width: `${planet.orbit}px`,
            height: `${planet.orbit}px`,
            animationDuration: planet.duration,
            ["--planet-size" as string]: `${planet.size}px`,
            ["--planet-color" as string]: planet.color,
          } as CSSProperties;

          return (
            <div
              key={planet.name}
              className={styles.orbit}
              style={orbitStyle}
              aria-label={`${planet.name} orbit`}
            >
              <div className={styles.planet} />
            </div>
          );
        })}

        <div className={styles.comet} aria-hidden="true" />
      </div>

      <section className={styles.legend} aria-label="Planet speeds and ranges">
        {animatedPlanets.map((planet) => (
          <div key={planet.name} className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ backgroundColor: planet.color }}
              aria-hidden="true"
            />
            <div>
              <strong>{planet.name}</strong>
              <div>Speed: {planet.adjustedSpeed.toFixed(4)}x</div>
              <div>Range: {planet.range}</div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
