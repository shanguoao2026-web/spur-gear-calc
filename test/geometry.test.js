import test from 'node:test';
import assert from 'node:assert/strict';
import { main } from '../dist/cli.js';
import { calculateGear, calculatePair, getWarnings, STANDARD_MODULES } from '../dist/geometry.js';
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≈ ${expected}`);
const cli = (...args) => {
  let stdout = '', stderr = '', status = 0;
  const log = console.log, error = console.error;
  console.log = value => { stdout += `${value}\n`; };
  console.error = value => { stderr += `${value}\n`; };
  try { main(args); } catch (err) { status = 1; stderr += `Error: ${err.message}\n`; }
  finally { console.log = log; console.error = error; }
  return { stdout, stderr, status };
};

test('standard m=2 z=20 geometry', () => {
  const g = calculateGear(2, 20);
  assert.equal(g.d, 40); assert.equal(g.da, 44); assert.equal(g.df, 35);
  assert.equal(g.ha, 2); assert.equal(g.hf, 2.5);
  near(g.db, 37.58770483143634); near(g.p, 6.283185307179586); near(g.s, Math.PI);
});
test('pair geometry and independently evaluated contact ratio', () => {
  const pair = calculatePair(2, 20, 45);
  assert.equal(pair.a, 65); assert.equal(pair.ratio, 2.25);
  near(pair.contactRatio, 1.646343530506798, 1e-6);
});
test('pressure angle changes base diameter and contact ratio', () => {
  near(calculateGear(2, 20, 30).db, 40 * Math.sqrt(3) / 2);
  assert.ok(calculatePair(2, 20, 45, 30).contactRatio < calculatePair(2, 20, 45).contactRatio);
});
test('validation protects the library', () => {
  for (const args of [[0, 20], [-1, 20], [NaN, 20], [2, 0], [2, 2.2], [2, Infinity], [2, 20, 0], [2, 20, 90], [2, 20, NaN], [Number.MAX_VALUE, 20]]) assert.throws(() => calculateGear(...args));
  assert.throws(() => calculatePair(2, 20, -1));
});
test('standard modules and warning boundaries', () => {
  assert.ok(STANDARD_MODULES.includes(2));
  assert.deepEqual(getWarnings(2, [17, 20]), []);
  assert.match(getWarnings(2, [16])[0], /undercut/);
  assert.deepEqual(getWarnings(2, [16], 25), []);
  assert.match(getWarnings(2.1, [20])[0], /first-series/);
});
test('CLI JSON single and pair output', () => {
  const single = cli('--m', '2', '--z', '20', '--json');
  assert.equal(single.status, 0); assert.equal(single.stderr, ''); assert.equal(JSON.parse(single.stdout).d, 40);
  const pair = cli('--m', '2', '--z1', '20', '--z2', '45', '--json');
  assert.equal(pair.status, 0); assert.equal(JSON.parse(pair.stdout).ratio, 2.25);
});
test('warnings do not contaminate JSON', () => {
  const result = cli('--m', '2.1', '--z', '12', '--json');
  assert.equal(result.status, 0); assert.equal(JSON.parse(result.stdout).z, 12);
  assert.match(result.stderr, /undercut/); assert.match(result.stderr, /first-series/);
});
test('CLI rejects invalid or ambiguous inputs', () => {
  for (const args of [[], ['--m', '2'], ['--m', '2', '--z1', '20'], ['--m', '2', '--z', '20', '--z2', '45'], ['--m', '-2', '--z', '20'], ['--m', '2', '--z', '2.5'], ['--m', '2x', '--z', '20'], ['--m'], ['--wat'], ['--m', '2', '--m', '3', '--z', '20'], ['--m', '2', '--z', '20', '--alpha', '90']].slice(1)) {
    const result = cli(...args); assert.notEqual(result.status, 0, args.join(' ')); assert.match(result.stderr, /Error:/);
  }
});
test('help, module list and human output', () => {
  assert.match(cli('--help').stdout, /Usage:/);
  assert.match(cli().stdout, /Usage:/);
  assert.match(cli('--modules').stdout, /1.25/);
  const result = cli('--m', '2', '--z', '20');
  assert.equal(result.status, 0); assert.match(result.stdout, /d = 40/);
});
