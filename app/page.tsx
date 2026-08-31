"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  findAlignedTriplets,
  getPlanetAngle,
  PlanetConfig,
} from "@/lib/solarSystem";
import styles from "./page.module.css";
import logo from './logo.png';

export default function Home() {
  const [alignmentNotification, setAlignmentNotification] = useState<{
    angle: number;
    planets: Array<{ name: string; speed: number }>;
    multiplier: number;
  } | null>(null);

  const [boost, setBoost] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);

  // 1. Correctly memoized base values generated exactly once
  const initialPlanets: PlanetConfig[] = useMemo(() => [
    { name: "Mercury", orbit: 45, size: 4, color: "#d9d4c5" },
    { name: "Venus", orbit: 70, size: 7, color: "#f4c56d" },
    { name: "Earth", orbit: 100, size: 8, color: "#56a7ff" },
    { name: "Mars", orbit: 135, size: 6, color: "#ff7a59" },
    { name: "Jupiter", orbit: 180, size: 14, color: "#d08b5a" },
    { name: "Saturn", orbit: 225, size: 12, color: "#e8d39c" },
    { name: "Uranus", orbit: 265, size: 10, color: "#89d9f5" },
    { name: "Neptune", orbit: 305, size: 9, color: "#5d7dff" },
  ].map((planet) => ({
    ...planet,
    speed: Math.random() * 10,
    angle: Math.random() * 365,
  })), []);

  // 2. Pre-calculates positions cleanly for the UI layouts
  const movingPlanets: PlanetConfig[] = useMemo(() => {
    return initialPlanets.map((planet) => ({
      ...planet,
      speed: planet.speed * boost,
      angle: getPlanetAngle(planet, elapsedTime),
    }));
  }, [initialPlanets, boost, elapsedTime]);

  // 3. Engine loop combining clock steps and active alignment validation
useEffect(() => {
  if (boost === 0) return; // Completely freeze loop if system is paused

  const intervalId = setInterval(() => {
    setElapsedTime((prevTime) => {
      // 1. Determine sub-steps dynamically based on our boost configuration
      // If boost is 7, we scan 7 distinct micro-increments inside this single interval execution
      const substeps = boost > 1 ? Math.round(boost) : 1;
      const stepIncrement = 0.01; // Base time step constant

      let currentCheckTime = prevTime;

      for (let step = 0; step < substeps; step++) {
        // Increment our target evaluation clock by a micro-slice fraction
        currentCheckTime += stepIncrement;

        // 2. Sample math configurations directly from constant base values
        const triplets = findAlignedTriplets(initialPlanets, currentCheckTime, 1.0);

        if (triplets && triplets.length > 0) {
          const firstMatch = Array.isArray(triplets) ? triplets[0] : triplets;

          // CRITICAL STEP: Kill the running clock execution sequence immediately
          clearInterval(intervalId);
          setBoost(0);

          setAlignmentNotification({
            angle: firstMatch.angle,
            planets: firstMatch.planets.map((p: any) => ({
              name: p.name,
              speed: p.speed,
            })),
            multiplier: boost,
          });

          // FREEZE DIRECTLY ON THE MATCH COORDINATES: 
          // Stops the clock right on the sub-step time where the alignment was caught
          return currentCheckTime;
        }
      }

      // If no alignments were found across the sub-steps, commit the full tick step forward
      return prevTime + 0.01 * boost;
    });
  }, 10);

  return () => clearInterval(intervalId);
}, [boost, initialPlanets]);
  const handleSunClick = () => {
    if (boost === 0 || alignmentNotification) {
      setAlignmentNotification(null);
      setBoost(1);
    } else if (boost === 1) {
      setBoost(7);
    } else {
      setBoost(1);
    }
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

      {/* Main Split Interface Area */}
      <div className={styles.dashboardContainer}>
        
        {/* Left Side: System View Engine */}
        <div className={styles.viewSection}>
          <header className={styles.header}>
            <img src={logo.src} alt="FairAI Core Logo" className={styles.logo} />
            <div className={styles.kicker}>FairAI Core</div>
          </header>
          <div className={styles.timer}>System Time: {elapsedTime.toFixed(1)}s</div>

          <div className={styles.system} aria-label="Animated solar system">
            <button
              type="button"
              onClick={handleSunClick}
              className={styles.sunButton}
            >
              {boost === 0 || alignmentNotification ? "Resume" : "Boost"}
            </button>

            {movingPlanets.map((planet) => {
              const orbitStyle = {
                width: `${planet.orbit * 2}px`, 
                height: `${planet.orbit * 2}px`,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${planet.angle}deg)`,
                ["--planet-size" as string]: `${planet.size}px`,
                ["--planet-color" as string]: planet.color,
              } as CSSProperties;

              return (
                <div key={planet.name} className={styles.orbit} style={orbitStyle}>
                  <div className={styles.planet} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Panel: Telemetry Metrics Sidebar */}
        <aside className={styles.sidebarSection}>
          <h2 className={styles.sidebarTitle}>System Telemetry</h2>
          <div className={styles.legend} aria-label="Planet data metrics">
            {movingPlanets.map((planet) => {
              return (
                <div key={planet.name} className={styles.legendItem}>
                  <span className={styles.dot} style={{ backgroundColor: planet.color }} />
                  <div className={styles.itemData}>
                    <strong>{planet.name}</strong>
                    <div>Speed: {planet.speed.toFixed(1)}x</div>
                    <div>Angle: {(planet.angle ?? 0).toFixed(1)}°</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

      </div>
    </main>
  );
}
