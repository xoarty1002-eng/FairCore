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
export function findAlignedTriplets(
  planets: PlanetConfig[],
  elapsedTime: number,
  toleranceDegrees = 0.5, // Tight tolerance for clean pixel rows
): AlignmentMatch[] {
  const matches: AlignmentMatch[] = [];
  const normalizedTolerance = Math.max(0, toleranceDegrees);

  // CRITICAL ONE-TIME SNAPSHOT: Calculate every planet's angle once at a stable timestamp.
  // This completely stops elapsedTime from drifting between pair evaluations.
  const stableAngles = planets.map(p => getPlanetAngle(p, elapsedTime));

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        
        // Read directly from the locked stable array
        const angle1 = stableAngles[i];
        const angle2 = stableAngles[j];
        const angle3 = stableAngles[k];

        // Map angles onto a unified 0-180° line axis vector cutting across the sun
        const axis1 = angle1 >= 180 ? angle1 - 180 : angle1;
        const axis2 = angle2 >= 180 ? angle2 - 180 : angle2;
        const axis3 = angle3 >= 180 ? angle3 - 180 : angle3;

        // Compute absolute shortest distances between folded line axes
        const d12 = Math.min(Math.abs(axis1 - axis2), 180 - Math.abs(axis1 - axis2));
        const d23 = Math.min(Math.abs(axis2 - axis3), 180 - Math.abs(axis2 - axis3));
        const d13 = Math.min(Math.abs(axis1 - axis3), 180 - Math.abs(axis1 - axis3));

        // ALL 3 points must sit securely on the exact same mutual row coordinate line
        if (d12 <= normalizedTolerance && d23 <= normalizedTolerance && d13 <= normalizedTolerance) {
          const sharedAxisAngle = Number(((axis1 + axis2 + axis3) / 3).toFixed(2));

          matches.push({
            angle: sharedAxisAngle, 
            planets: [
              { ...planets[i], angle: Number(angle1.toFixed(2)), speed: Number(planets[i].speed) },
              { ...planets[j], angle: Number(angle2.toFixed(2)), speed: Number(planets[j].speed) },
              { ...planets[k], angle: Number(angle3.toFixed(2)), speed: Number(planets[k].speed) },
            ],
          });
        }
      }
    }
  }
  return matches;
}