/** Local coords refers to the coordinates being used by this application. It is gotten relative to the true Geographic coordinate (Global heading) following an offset */

function normalizeDeg(difference: number) {
  return ((difference % 360) + 360) % 360;
}

// Measure once at your reference pose:
const theta0 = 90; // example: magnetometer said 90° when facing your “local north”

// Later, for any magnetometer/true heading:
export function toLocalHeading(trueHeading: number) {
  return normalizeDeg(trueHeading - theta0);
}
