"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  calculatePlanetSpeed,
  findAlignedTriplets,
  getPlanetAngle,
  logAlignedTriplets,
  normalizeAngle,
} from "@/lib/solarSystem";
import styles from "./page.module.css";
import logo from './logo.png'
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

function getAlignmentTrial(multiplier: number) {
  return initialPlanets.map((planet) => ({
    name: planet.name,
    orbitRadius: planet.orbit,
    size: planet.size,
    color: planet.color,
    speed: Number((planet.speed * multiplier).toFixed(4)),
  }));
}

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
  const [isBoosting, setIsBoosting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

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
    if (!isBoosting) {
      setElapsedTime((previous) => Number((previous + 0.1).toFixed(2)));
    }

    const intervalId = setInterval(() => {

      setSpeedMultiplier(() => {
        var next = 3;
       setElapsedTime((previous) => Number((previous + 0.1* next).toFixed(2)));
       const triplets = findAlignedTriplets(getAlignmentTrial(next), 1, 0);
        if (triplets.length > 0) {
          next = 1;
          const match = triplets[0];
          setAlignmentNotification({
            angle: match.angle,
            planets: match.planets.map((planet) => ({
              name: planet.name,
              speed: planet.speed*next,
            })),
            multiplier: next,
          });
          setStatusMessage(`Alignment found at ${next.toFixed(2)}x speed!`);
          setIsBoosting(false);
          setIsFrozen(true);
          return next;
        }

        return next;
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [isBoosting]);

  const handleSunClick = () => {
    if (!isBoosting)
      {
        setIsBoosting(true);
      }
      else
      {
         setIsBoosting(false);
      }
    if (isFrozen || alignmentNotification) {
      setAlignmentNotification(null);
      setIsFrozen(false);
      setIsBoosting(false);
      setStatusMessage(
        `Resuming orbit from ${speedMultiplier.toFixed(2)}x. Planet timer continues from the last alignment frame.`,
      );
      return;
    }
    setStatusMessage("Speed boosting until a three-planet alignment is reached.");
  };

  return (
    <main className={styles.page}>
      {alignmentNotification && (
        <div className={styles.notification}>
          <div className={styles.notificationContent}>
            <h2>Alignment Found!</h2>
            <p>Angle: {alignmentNotification.angle.toFixed(2)}°</p>
            <p>Speed Multiplier: {alignmentNotification.multiplier}x</p>
            <div className={styles.planetDetails}>
              {alignmentNotification.planets.map((planet) => (
                <div key={planet.name} className={styles.planetRow}>
                  <strong>{planet.name}</strong>: {planet.speed.toFixed(4)}x
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <img
          src={logo.src}
          alt="FairAI Core Logo"
          className={styles.logo}
        />
        <div className={styles.kicker}>FairAI Core  </div>
      </header>
       <div className={styles.timer}>System Time: {elapsedTime.toFixed(1)}s</div>
 
      <div className={styles.system} aria-label="Animated solar system">
      <button
        type="button"
        onClick={handleSunClick}
        className={styles.sunButton}
        aria-label={isFrozen || alignmentNotification ? "Sun - resume orbiting" : "Sun - click to boost and find alignment"}
      >
        {isFrozen || alignmentNotification ? "Resume" : "Boost"}
      </button>
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
