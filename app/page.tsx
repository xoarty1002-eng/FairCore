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



export default function Home() {
  const [alignmentNotification, setAlignmentNotification] = useState<{
    angle: number;
    planets: Array<{ name: string; speed: number }>;
    multiplier: number;
  } | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [Boosting, setBoosting] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const initialPlanets = [
   { name: "Mercury", orbit: 88, speed: 6 , size: 7, color: "#d9d4c5" },
   { name: "Venus", orbit: 130, speed: 9, size: 12, color: "#f4c56d" },
   { name: "Earth", orbit: 180, speed: 12, size: 14, color: "#56a7ff" },
   { name: "Mars", orbit: 240, speed: 15, size: 11, color: "#ff7a59" },
   { name: "Jupiter", orbit: 310, speed: 20, size: 22, color: "#d08b5a" },
   { name: "Saturn", orbit: 380, speed: 26, size: 19, color: "#e8d39c" },
   { name: "Uranus", orbit: 450, speed: 32, size: 16, color: "#89d9f5" },
   { name: "Neptune", orbit: 520, speed: 38, size: 15, color: "#5d7dff" },
  ].map((planet) => ({
  ...planet,
  speed: planet.speed * Boosting,
}));
  useEffect(() => {
    setElapsedTime((previous) => Number((previous + 0.1*Boosting).toFixed(2)));
      });
  const handleSunClick = () => {
   if (isFrozen || alignmentNotification) {
      setAlignmentNotification(null);
      setIsFrozen(false);
      setBoosting(1);
    }
    else if (Boosting == 1 &&!isFrozen)
      {
        setBoosting(7);
      }
      else 
      {
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
        {initialPlanets.map((planet) => {
          const orbitStyle = {
            width: `${planet.orbit}px`,
            height: `${planet.orbit}px`,
            animationDuration: planet.speed > 0 ? `${Math.max(1.2, Number((360 / planet.speed).toFixed(2)))}s` : "0s",
            animationPlayState: isFrozen ? "paused" : "running",
            ["--planet-size" as string]: `${planet.size}px`,
            ["--planet-color" as string]: planet.color,
            ["--orbit-shift" as string]: `${planet.orbit}deg`,
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

      </div>

      <section className={styles.legend} aria-label="Planet speeds and ranges">
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
             <span
               className={styles.dot}
                style={{ backgroundColor: planet.color }}
               aria-hidden="true"
             />
              <div>
                <strong>{planet.name}</strong>
                <div>Speed: {planet.speed.toFixed(4)}x</div>
               <div>Angle: {(currentAngle ?? 0).toFixed(2)}°</div>
             </div>
            </div>
          );
       })}
      </section>
    </main>
  );
}
