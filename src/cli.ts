#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { calculateGear, calculatePair, getWarnings, STANDARD_MODULES } from './geometry.js';

const help = `Usage:
  spur-gear --m 2 --z 20 [--alpha 20] [--json]
  spur-gear --m 2 --z1 20 --z2 45 [--alpha 20] [--json]

Standard external involute gears; lengths in mm, pressure angle in degrees.
--m       Positive module (mm)
--z       Positive integer tooth count for a single gear
--z1/--z2 Positive integer tooth counts for a gear pair (ratio = z2/z1)
--alpha   Pressure angle, 0 < alpha < 90; default 20
--json    Print JSON; warnings remain on stderr
--modules List standard first-series modules
--help    Show this help

Standard first-series modules (mm): ${STANDARD_MODULES.join(', ')}
`;

export function main(args: string[]): void {
  if (args.length === 0 || (args.length === 1 && args[0] === '--help')) {
    console.log(help); return;
  }
  if (args.length === 1 && args[0] === '--modules') {
    console.log(STANDARD_MODULES.join(', ')); return;
  }
  const values = new Map<string, number>();
  let json = false;
  for (let i = 0; i < args.length; i++) {
    const option = args[i];
    if (option === '--json') {
      if (json) throw new Error('Duplicate option --json.');
      json = true; continue;
    }
    if (!['--m', '--z', '--z1', '--z2', '--alpha'].includes(option)) throw new Error(`Unknown option: ${option}. Use --help.`);
    if (values.has(option)) throw new Error(`Duplicate option ${option}.`);
    const raw = args[++i];
    if (raw === undefined || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) throw new Error(`${option} requires a numeric value.`);
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error(`${option} must be finite.`);
    values.set(option, value);
  }
  const m = values.get('--m');
  if (m === undefined) throw new Error('Missing required --m.');
  const z = values.get('--z');
  const z1 = values.get('--z1');
  const z2 = values.get('--z2');
  const alpha = values.get('--alpha') ?? 20;
  if (z !== undefined && (z1 !== undefined || z2 !== undefined)) throw new Error('Use either --z or both --z1 and --z2.');
  if (z === undefined && (z1 === undefined || z2 === undefined)) throw new Error('Provide --z or both --z1 and --z2.');
  const result = z !== undefined ? calculateGear(m, z, alpha) : calculatePair(m, z1!, z2!, alpha);
  const warnings = getWarnings(m, z !== undefined ? [z] : [z1!, z2!], alpha);
  if ('contactRatio' in result && result.contactRatio < 1) warnings.push('Contact ratio is below 1; continuous tooth contact is not assured.');
  for (const warning of warnings) console.error(`Warning: ${warning}`);
  if (json) console.log(JSON.stringify(result, null, 2));
  else {
    const print = (object: object, indent = ''): void => {
      for (const [key, value] of Object.entries(object)) {
        if (typeof value === 'object') { console.log(`${indent}${key}:`); print(value, `${indent}  `); }
        else console.log(`${indent}${key} = ${Number.isInteger(value) ? value : value.toFixed(6)}`);
      }
    };
    console.log('Spur gear geometry (lengths: mm; alpha: degrees)');
    print(result);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
try { main(process.argv.slice(2)); }
catch (error) { console.error(`Error: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }

}
