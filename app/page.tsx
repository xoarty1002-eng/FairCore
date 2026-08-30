"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  calculatePlanetSpeed,
  findAlignedTriplets,
  findAlignmentSpeedMultiplier,
  getPlanetAngle,
  logAlignedTriplets,
  normalizeAngle,
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
  const [alignmentNotification, setAlignmentNotification] = useState<{
    angle: number;
    planets: Array<{ name: string; speed: number }>;
    multiplier: number;
  } | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);

  const animatedPlanets = useMemo(
    () =>
      initialPlanets.map((planet) => {
        const alignmentMatch =
          isFrozen &&
          alignmentNotification &&
          alignmentNotification.planets.some((entry) => entry.name === planet.name);

        const adjustedSpeed = isFrozen
          ? Number((planet.speed * (alignmentNotification?.multiplier || 1)).toFixed(4))
          : Number((planet.speed * speedMultiplier).toFixed(4));

        const currentAngle = getPlanetAngle({
          name: planet.name,
          orbitRadius: planet.orbit,
          size: planet.size,
          color: planet.color,
          speed: adjustedSpeed,
        });

        const orbitShift = alignmentMatch
          ? normalizeAngle(alignmentNotification.angle - currentAngle)
          : 0;

        return {
          ...planet,
          adjustedSpeed,
          orbitShift,
          duration: `${Math.max(1.2, Number((planet.baseDuration / (isFrozen ? alignmentNotification?.multiplier || 1 : speedMultiplier)).toFixed(2)))}s`,
        };
      }),
    [speedMultiplier, isFrozen, alignmentNotification],
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

  const handleSpeedUpUntilAligned = () => {
    const planetsForAlignment = initialPlanets.map((planet) => ({
      name: planet.name,
      orbitRadius: planet.orbit,
      size: planet.size,
      color: planet.color,
      speed: planet.speed,
    }));

    // Always search from base speed (1x)
    const alignmentMultiplier = findAlignmentSpeedMultiplier(
      planetsForAlignment,
      1,
      100,
      1,
    );

    if (alignmentMultiplier !== null) {
      setSpeedMultiplier(alignmentMultiplier);
      setIsFrozen(true);

      // Get the alignment details at this multiplier
      const trial = planetsForAlignment.map((planet) => ({
        ...planet,
        speed: Number((planet.speed * alignmentMultiplier).toFixed(4)),
      }));

      const triplets = findAlignedTriplets(trial, 1, 0);

      if (triplets.length > 0) {
        const details = triplets[0].planets.map((planet) => ({
          name: planet.name,
          speed: planet.speed,
        }));

        setAlignmentNotification({
          angle: triplets[0].angle,
          planets: details,
          multiplier: alignmentMultiplier,
        });
        setStatusMessage(`Alignment found at ${alignmentMultiplier}x speed!`);
        return;
      }
    }

    setStatusMessage(
      "No alignment found within search range. Try clicking again.",
    );
  };

  return (
    <main className={styles.page}>
      {alignmentNotification && (
        <div className={styles.notification}>
          <div className={styles.notificationContent}>
            <h2>🎯 Alignment Found!</h2>
            <p>Angle: {alignmentNotification.angle.toFixed(2)}°</p>
            <p>Speed Multiplier: {alignmentNotification.multiplier}x</p>
            <div className={styles.planetDetails}>
              {alignmentNotification.planets.map((planet) => (
                <div key={planet.name} className={styles.planetRow}>
                  <strong>{planet.name}</strong>: {planet.speed.toFixed(4)}x
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setAlignmentNotification(null);
                setIsFrozen(false);
                setSpeedMultiplier(1);
                setStatusMessage("Orbit speed restored to 1x (default).");
              }}
              className={styles.closeButton}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <img
          src="https://private-user-images.githubusercontent.com/287196754/643088478-040f63a8-1f9e-4b4a-87c2-916cb8c816de.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODgwODc2ODUsIm5iZiI6MTc4ODA4NzM4NSwicGF0aCI6Ii8yODcxOTY3NTQvNjQzMDg4NDc4LTA0MGY2M2E4LTFmOWUtNGI0YS04N2MyLTkxNmNiOGM4MTZkZS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwODMwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDgzMFQxMDU2MjVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02M2Q5YTMzNzA1MTE4OTQyYzcyMjVkMjA0MjU5NDgzZmEwZGJlNjU0YWUzODYzYzBlYTBhNDYwYjEzMGM0NGU0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.qIlqwepckTjugX-iW3OQfl9xl6RdWDbZQv48pRKWp48"
          alt="FairAI Core Logo"
          className={styles.logo}
        />
        <p className={styles.kicker}>FairAI Core</p>
      </header>

      <div className={styles.system} aria-label="Animated solar system">
        <button
          type="button"
          onClick={handleSpeedUpUntilAligned}
          className={styles.sunButton}
          aria-label="Sun - Click to find alignment"
        />

        {animatedPlanets.map((planet) => {
          const orbitStyle = {
            width: `${planet.orbit}px`,
            height: `${planet.orbit}px`,
            animationDuration: planet.duration,
            animationPlayState: isFrozen ? "paused" : "running",
            ["--planet-size" as string]: `${planet.size}px`,
            ["--planet-color" as string]: planet.color,
            ["--orbit-shift" as string]: `${planet.orbitShift}deg`,
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
