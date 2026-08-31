export type PlanetConfig = {
  name: string;
  orbitRadius: number;
  size: number;
  color: string;
  speed: number;
  startAngle?: number;
};

export type AlignmentMatch = {
  angle: number;
  planets: Array<PlanetConfig & { angle: number; speed: number }>;
};

/**
 * Calculates a baseline relational speed based on orbit distance metrics.
 */
export function calculatePlanetSpeed(orbitRadius: number): number {
  return Number(((orbitRadius / 18) / 1000).toFixed(4));
}

/**
 * Normalizes any angle to stay strictly within a valid 0 to 360 degree boundary map.
 */
export function normalizeAngle(angle: number): number {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

/**
 * Computes the exact real-time angular coordinate mapping for a planet.
 */
export function getPlanetAngle(planet: PlanetConfig, elapsedTime: number): number {
  const baseSpeed = Number(planet.speed || 0);
  
  // Custom velocity multiplier mapping to scale visual simulation playback speeds smoothly
  const scaleFactor = 0.05; 
  
  const startAngle = Number(planet.startAngle ?? 0);
  const dynamicMovement = baseSpeed * elapsedTime * scaleFactor * 360;
  
  return normalizeAngle(startAngle + dynamicMovement);
}

/**
 * Computes the shortest circular angular difference between two tracking coordinates.
 */
function circularDifference(a: number, b: number): number {
  const raw = Math.abs(a - b);
  return Math.min(raw, 360 - raw);
}

/**
 * Searches for all unique three-body combinations satisfying maximum proximity limits.
 */
export function findAlignedTriplets(
  planets: PlanetConfig[],
  elapsedTime: number,         
  toleranceDegrees = 1,
): AlignmentMatch[] {
  const matches: AlignmentMatch[] = [];
  const normalizedTolerance = Math.max(0, toleranceDegrees);

  // Safeguard: Ignore the initial frozen state when time hasn't started moving yet
  if (elapsedTime === 0) {
    return [];
  }

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i];
        const p2 = planets[j];
        const p3 = planets[k];

        // 1. Calculate each planet's actual unique angle for this timestamp
        const angle1 = getPlanetAngle(p1, elapsedTime);
        const angle2 = getPlanetAngle(p2, elapsedTime);
        const angle3 = getPlanetAngle(p3, elapsedTime);

        const sameAngle =
          circularDifference(angle1, angle2) <= normalizedTolerance &&
          circularDifference(angle2, angle3) <= normalizedTolerance &&
          circularDifference(angle1, angle3) <= normalizedTolerance;

        if (sameAngle) {
          // Calculate the average angle purely for reference reporting or logs
          const avgAngle = (angle1 + angle2 + angle3) / 3;
          
          matches.push({
            angle: avgAngle,
            planets: [
              // CRITICAL FIX: Retain their individual dynamic orbital angles
              // instead of collapsing/overwriting them into the same exact value.
              { ...p1, angle: angle1, speed: Number(p1.speed) },
              { ...p2, angle: angle2, speed: Number(p2.speed) },
              { ...p3, angle: angle3, speed: Number(p3.speed) },
            ],
          });
        }
      }
    }
  }

  return matches;
}

export function logAlignedTriplets(planets: PlanetConfig[], elapsedTime = 0): void {
  const matches = findAlignedTriplets(planets, elapsedTime, 1);

  matches.forEach((match) => {
    const parts = match.planets
      .map(
        (planet) =>
          `${planet.name}: angle=${planet.angle.toFixed(2)}°, speed=${planet.speed.toFixed(4)}`,
      )
      .join(" | ");

    console.log(
      `[SolarSystem] Three planets aligned at ${match.angle.toFixed(2)}°: ${parts}`,
    );
  });
}
