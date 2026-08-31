export type PlanetConfig = {
  name: string;
  orbit: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
};

export type AlignmentMatch = {
  angle: number;
  planets: Array<PlanetConfig & { angle: number; speed: number }>;
};


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
  
  const startAngle = Number(planet.angle ?? 0);
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

export function findAlignedTriplets(
  planets: PlanetConfig[],
  elapsedTime: number,
  toleranceDegrees = 5,
): AlignmentMatch[] {
  const matches: AlignmentMatch[] = [];
  const normalizedTolerance = Math.max(0, toleranceDegrees);

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i];
        const p2 = planets[j];
        const p3 = planets[k];

        const angle1 = getPlanetAngle(p1, elapsedTime);
        const angle2 = getPlanetAngle(p2, elapsedTime);
        const angle3 = getPlanetAngle(p3, elapsedTime);

        // Compute shortest circular distances for ALL three internal pairs
        const diff12 = circularDifference(angle1, angle2);
        const diff23 = circularDifference(angle2, angle3);
        const diff13 = circularDifference(angle1, angle3);

        // A pair is linear ONLY if they are together (0°) OR directly opposite (180°)
        const aligned12 = diff12 <= normalizedTolerance || Math.abs(diff12 - 180) <= normalizedTolerance;
        const aligned23 = diff23 <= normalizedTolerance || Math.abs(diff23 - 180) <= normalizedTolerance;
        const aligned13 = diff13 <= normalizedTolerance || Math.abs(diff13 - 180) <= normalizedTolerance;

        // CRITICAL FIX: All three pairs must satisfy the linear axis condition.
        // If p2 is 0° and p3 is 90°, diff23 will be 90°, failing aligned23 and rejecting the false match!
        if (aligned12 && aligned23 && aligned13) {
          // Normalize the base axis reporting angle to the 0-180 hemisphere
          const baseAxisAngle = angle1 >= 180 ? angle1 - 180 : angle1;

          matches.push({
            angle: Number(baseAxisAngle.toFixed(2)), 
            planets: [
              { ...p1, angle: Number(angle1.toFixed(2)), speed: Number(p1.speed) },
              { ...p2, angle: Number(angle2.toFixed(2)), speed: Number(p2.speed) },
              { ...p3, angle: Number(angle3.toFixed(2)), speed: Number(p3.speed) },
            ],
          });
        }
      }
    }
  }
  return matches;
}
