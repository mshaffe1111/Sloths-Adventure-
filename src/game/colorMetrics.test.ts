import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deltaE00, deltaE00Lab, toLab, FUR, furDistance, lightness, type Lab } from './colorMetrics.ts';

// pairs from the CIEDE2000 reference data of Sharma, Wu and Dalal (2005): [Lab1, Lab2, expected dE00]
const SHARMA: Array<[Lab, Lab, number]> = [
  [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
  [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
  [[50, 2.8361, -74.02], [50, 0, -82.7485], 3.4412],
  [[50, -1.3802, -84.2814], [50, 0, -82.7485], 1.0],
  [[50, 0, 0], [50, -1, 2], 2.3669],
  [[50, 2.5, 0], [50, 0, -2.5], 4.3065],
  [[50, 2.5, 0], [73, 25, -18], 27.1492],
  [[50, 2.5, 0], [61, -5, 29], 22.8977],
  [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  [[63.0109, -31.0961, -5.8663], [62.8187, -29.7946, -4.0864], 1.263],
  [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],
];

test('CIEDE2000 reproduces the published reference pairs', () => {
  for (const [a, b, want] of SHARMA) {
    assert.ok(Math.abs(deltaE00Lab(a, b) - want) < 5e-4, `${a} vs ${b}: ${deltaE00Lab(a, b)} should be ${want}`);
  }
});

test('the distance is symmetric, zero for the same colour and grows with the gap', () => {
  assert.equal(deltaE00('#a66b43', '#a66b43'), 0);
  assert.ok(Math.abs(deltaE00('#336699', '#aa8855') - deltaE00('#aa8855', '#336699')) < 1e-9);
  assert.ok(deltaE00('#808080', '#8a8a8a') < deltaE00('#808080', '#b0b0b0'));
});

test('hex, short hex and rgb() all read the same colour', () => {
  assert.deepEqual(toLab('#ffffff'), toLab('rgb(255,255,255)'));
  assert.deepEqual(toLab('#fa0'), toLab('#ffaa00'));
  assert.ok(Math.abs(lightness('#000000')) < 1e-6);
  assert.ok(Math.abs(lightness('#ffffff') - 100) < 0.01);
});

test("Pokey's fur is far from white and black and near itself", () => {
  assert.equal(furDistance(FUR), 0);
  assert.ok(furDistance('#ffffff') > 25);
  assert.ok(furDistance('#000000') > 25);
  assert.ok(furDistance('#b07848') < 8, 'a slightly lighter brown is still fur');
});
