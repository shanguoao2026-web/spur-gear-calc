/** Preferred first-series metric modules (mm). */
export const STANDARD_MODULES = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25, 32, 40, 50] as const;

export interface Gear {
  m: number; z: number; alpha: number;
  d: number; ha: number; hf: number; da: number; df: number;
  db: number; p: number; s: number;
}

function validate(m: number, z: number, alpha: number): void {
  if (!Number.isFinite(m) || m <= 0) throw new Error('m must be a finite positive module in mm.');
  if (!Number.isSafeInteger(z) || z <= 0) throw new Error('Tooth count must be a positive safe integer.');
  if (!Number.isFinite(alpha) || alpha <= 0 || alpha >= 90) throw new Error('alpha must be a finite pressure angle between 0 and 90 degrees (exclusive).');
}

export function calculateGear(m: number, z: number, alpha = 20): Gear {
  validate(m, z, alpha);
  const d = m * z;
  const p = Math.PI * m;
  const result = { m, z, alpha, d, ha: m, hf: 1.25 * m, da: d + 2 * m,
    df: d - 2.5 * m, db: d * Math.cos(alpha * Math.PI / 180), p, s: p / 2 };
  if (Object.values(result).some(value => !Number.isFinite(value))) throw new Error('Inputs exceed the supported numeric range.');
  return result;
}

export function calculatePair(m: number, z1: number, z2: number, alpha = 20) {
  const gear1 = calculateGear(m, z1, alpha);
  const gear2 = calculateGear(m, z2, alpha);
  const radians = alpha * Math.PI / 180;
  const a = (gear1.d + gear2.d) / 2;
  // sqrt(ra² - rb²), factored to reduce cancellation near small angles.
  const path = (g: Gear) => Math.sqrt((g.da / 2 - g.db / 2) * (g.da / 2 + g.db / 2));
  const contactRatio = (path(gear1) + path(gear2) - a * Math.sin(radians)) / (Math.PI * m * Math.cos(radians));
  const ratio = z2 / z1;
  if (![a, ratio, contactRatio].every(Number.isFinite)) throw new Error('Inputs exceed the supported numeric range.');
  return { m, alpha, gear1, gear2, a, ratio, contactRatio };
}

export function getWarnings(m: number, teeth: number[], alpha = 20): string[] {
  const warnings: string[] = [];
  if (!STANDARD_MODULES.some(value => Math.abs(value - m) <= value * 1e-10)) {
    warnings.push(`Module ${m} mm is not in the standard first-series list.`);
  }
  for (const z of new Set(teeth)) {
    if (alpha === 20 && z < 17) warnings.push(`z=${z}: undercut risk at 20 degrees (z < 17).`);
    if (z < 3) warnings.push(`z=${z}: non-positive root diameter; geometry is not physically usable.`);
  }
  return warnings;
}
