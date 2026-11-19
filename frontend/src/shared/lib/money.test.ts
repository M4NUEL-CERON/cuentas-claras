import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseAmount } from './money.ts'

test('pesos: thousands separators, no decimals', () => {
  assert.equal(parseAmount('90.000', 'COP'), 90000)
  assert.equal(parseAmount('90,000', 'COP'), 90000)
  assert.equal(parseAmount('1.250.000', 'COP'), 1250000)
  assert.equal(parseAmount('$ 45000', 'COP'), 45000)
  assert.equal(parseAmount('1500,5', 'COP'), null)
  assert.equal(parseAmount('12.34', 'COP'), null)
})

test('two-decimal currencies: comma or dot decimals', () => {
  assert.equal(parseAmount('12.50', 'USD'), 12.5)
  assert.equal(parseAmount('12,50', 'EUR'), 12.5)
  assert.equal(parseAmount('1.234,50', 'EUR'), 1234.5)
  assert.equal(parseAmount('1,234.50', 'USD'), 1234.5)
  assert.equal(parseAmount('1,000', 'USD'), 1000)
  assert.equal(parseAmount('7', 'MXN'), 7)
  assert.equal(parseAmount('12.345', 'USD'), 12345)
  assert.equal(parseAmount('1.2.3,4', 'USD'), 123.4)
})

test('rejects what is not a positive amount', () => {
  for (const bad of ['', '0', '-5', 'abc', '12.505,5x', '1,2345.5.']) assert.equal(parseAmount(bad, 'USD'), null, bad)
  assert.equal(parseAmount('0', 'COP'), null)
})
