import type { CSSProperties } from "react";
import styles from "./page.module.css";

const planets = [
  { name: "Mercury", orbit: 88, duration: "6s", size: 7, color: "#d9d4c5" },
  { name: "Venus", orbit: 130, duration: "9s", size: 12, color: "#f4c56d" },
  { name: "Earth", orbit: 180, duration: "12s", size: 14, color: "#56a7ff" },
  { name: "Mars", orbit: 240, duration: "15s", size: 11, color: "#ff7a59" },
  { name: "Jupiter", orbit: 310, duration: "20s", size: 22, color: "#d08b5a" },
  { name: "Saturn", orbit: 380, duration: "26s", size: 19, color: "#e8d39c" },
  { name: "Uranus", orbit: 450, duration: "32s", size: 16, color: "#89d9f5" },
  { name: "Neptune", orbit: 520, duration: "38s", size: 15, color: "#5d7dff" },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Living cosmos</p>
        <h1>Solar System</h1>
      </header>

      <div className={styles.system} aria-label="Animated solar system">
        <div className={styles.sun} aria-label="Sun" />

        {planets.map((planet) => {
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
    </main>
  );
}
