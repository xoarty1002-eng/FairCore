import test from "node:test";
import assert from "node:assert/strict";

import { findAlignedTriplets } from "./solarSystem";

test("finds a triplet aligned at the same angle and keeps speed values as double precision numbers", () => {
  const triplets = findAlignedTriplets(
    [
      { name: "Mercury", speed: 0.5, orbitRadius: 100, color: "#d9d4c5", size: 7 },
      { name: "Earth", speed: 0.25, orbitRadius: 180, color: "#56a7ff", size: 14 },
      { name: "Mars", speed: 0.1666666667, orbitRadius: 240, color: "#ff7a59", size: 11 },
    ],
    1,
    5,
  );

  assert.ok(triplets.length >= 1);
  const first = triplets[0];
  assert.ok(first.planets.length === 3);
  assert.equal(first.planets.every((planet) => typeof planet.speed === "number"), true);
  assert.equal(first.planets.every((planet) => Number.isFinite(planet.speed)), true);
});

test("different starting angles produce different aligned angles", () => {
  const basePlanets = [
    { name: "Mercury", speed: 0.5, orbitRadius: 100, color: "#d9d4c5", size: 7 },
    { name: "Earth", speed: 0.5, orbitRadius: 180, color: "#56a7ff", size: 14 },
    { name: "Mars", speed: 0.5, orbitRadius: 240, color: "#ff7a59", size: 11 },
  ];

  const zeroFrame = findAlignedTriplets(
    basePlanets.map((planet) => ({ ...planet, startAngle: 0 })),
    1,
    0,
  );

  const ninetyFrame = findAlignedTriplets(
    basePlanets.map((planet) => ({ ...planet, startAngle: 90 })),
    1,
    0,
  );

  assert.ok(zeroFrame.length >= 1);
  assert.ok(ninetyFrame.length >= 1);
  assert.equal(zeroFrame[0].angle, 0);
  assert.equal(ninetyFrame[0].angle, 90);
  assert.notEqual(zeroFrame[0].angle, ninetyFrame[0].angle);
});
