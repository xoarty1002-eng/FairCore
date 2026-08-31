"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
  
  const [isFrozen, setIsFrozen] = useState(false);
  const [boosting, setBoosting] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);

  const lastTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);

  const initialPlanets = useMemo(() => [
    { name: "Mercury", orbit: 45, speed: 38, size: 4, color: "#d9d4c5" },
    { name: "Venus", orbit: 70, speed: 32, size: 7, color: "#f4c56d" },
    { name: "Earth", orbit: 100, speed: 26, size: 8, color: "#56a7ff" },
    { name: "Mars", orbit: 135, speed: 20, size: 6, color: "#ff7a59" },
    { name: "Jupiter", orbit: 180, speed: 15, size: 14, color: "#d08b5a" },
    { name: "Saturn", orbit: 225, speed: 12, size: 12, color: "#e8d39c" },
    { name: "Uranus", orbit: 265, speed: 9, size: 10, color: "#89d9f5" },
    { name: "Neptune", orbit: 305, speed: 6, size: 9, color: "#5d7dff" },
  ].map((planet) => ({
    ...planet,
    speed: planet.speed * boosting,
    range: `${Math.round(planet.orbit * 0.8)}–${Math.round(planet.orbit * 1.2)} px`,
  })), [boosting]);

  useEffect(() => {
    if (isFrozen) {
      lastTimeRef.current = null;
      return;
    }

    let animationFrameId: number;

    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaSeconds = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      accumulatedTimeRef.current += deltaSeconds * boosting;
      const nextTime = Number(accumulatedTimeRef.current.toFixed(4));
      setElapsedTime(nextTime);

      const currentTrialPlanets: PlanetConfig[] = initialPlanets.map((p) => ({
        name: p.name,
        orbitRadius: p.orbit,
        size: p.size,
        color: p.color,
        speed: p.speed,
        startAngle: 0,
      }));

      const triplets = findAlignedTriplets(currentTrialPlanets, nextTime, 1.5);

      if (triplets && triplets.length > 0) {
        const firstMatch = triplets[0];
        
        setAlignmentNotification({
          angle: firstMatch.angle,
          planets: firstMatch.planets.map((p: any) => ({
            name: p.name,
            speed: p.speed,
          })),
          multiplier: boosting,
        });

        setIsFrozen(true);
        setBoosting(0);
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [boosting, isFrozen, initialPlanets]);

  const handleSunClick = () => {
    if (isFrozen || alignmentNotification) {
      setAlignmentNotification(null);
      setIsFrozen(false);
      setBoosting(1);
    } else if (boosting === 1) {
      setBoosting(7);
    } else {
      setBoosting(1);
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
              {isFrozen || alignmentNotification ? "Resume" : "Boost"}
            </button>

            {initialPlanets.map((planet) => {
              const calculatedAngle = getPlanetAngle({
                name: planet.name,
                orbitRadius: planet.orbit,
                size: planet.size,
                color: planet.color,
                speed: planet.speed,
              }, elapsedTime);

              const orbitStyle = {
                width: `${planet.orbit * 2}px`, 
                height: `${planet.orbit * 2}px`,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${calculatedAngle}deg)`,
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
            {initialPlanets.map((planet) => {
              const currentAngle = getPlanetAngle({
                name: planet.name,
                orbitRadius: planet.orbit,
                size: planet.size,
                color: planet.color,
                speed: planet.speed,
              }, elapsedTime);

              return (
                <div key={planet.name} className={styles.legendItem}>
                  <span className={styles.dot} style={{ backgroundColor: planet.color }} />
                  <div className={styles.itemData}>
                    <strong>{planet.name}</strong>
                    <div>Speed: {planet.speed.toFixed(1)}x</div>
                    <div>Angle: {(currentAngle ?? 0).toFixed(1)}°</div>
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
