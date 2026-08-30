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

export function calculatePlanetSpeed(orbitRadius: number): number {
  return Number((Math.max(orbitRadius / 18, 2.4) / 1000).toFixed(4));
}

export function normalizeAngle(angle: number): number {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function getPlanetAngle(planet: PlanetConfig): number {
  const orbitFactor = Number(planet.orbitRadius) * Number(planet.speed);
  const startAngle = Number(planet.startAngle ?? 0);
  return normalizeAngle(startAngle + (orbitFactor * 360) % 360);
}

function circularDifference(a: number, b: number): number {
  const raw = Math.abs(a - b);
  return Math.min(raw, 360 - raw);
}

export function findAlignmentSpeedMultiplier(
  planets: PlanetConfig[],
  startMultiplier: number = 1,
  maxMultiplier: number = 100,
  tolerance: number = 1,
): number | null {
  const step = 0.1;
  let multiplier = startMultiplier;

  while (multiplier <= maxMultiplier) {
    const trial = planets.map((planet) => ({
      ...planet,
      speed: Number((planet.speed * multiplier).toFixed(4)),
    }));

    const alignments = findAlignedTriplets(trial, tolerance, 0);
    if (alignments.length > 0) {
      return multiplier;
    }

    multiplier = Number((multiplier + step).toFixed(2));
  }

  return null;
}

export function findAlignedTriplets(
  planets: PlanetConfig[],
  toleranceDegrees = 1,
  _minAngleStep = 5,
): AlignmentMatch[] {
  const matches: AlignmentMatch[] = [];
  const normalizedTolerance = Math.max(0, toleranceDegrees);

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i];
        const p2 = planets[j];
        const p3 = planets[k];

        const angle1 = getPlanetAngle(p1);
        const angle2 = getPlanetAngle(p2);
        const angle3 = getPlanetAngle(p3);

        const sameAngle =
          circularDifference(angle1, angle2) <= normalizedTolerance &&
          circularDifference(angle2, angle3) <= normalizedTolerance &&
          circularDifference(angle1, angle3) <= normalizedTolerance;

        if (sameAngle) {
          const avgAngle = (angle1 + angle2 + angle3) / 3;
          matches.push({
            angle: avgAngle,
            planets: [
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

export function logAlignedTriplets(planets: PlanetConfig[]): void {
  const matches = findAlignedTriplets(planets, 1, 0);

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
