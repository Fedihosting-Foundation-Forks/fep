import { fep0f2a } from "../index.js"
import { test } from "node:test"
import assert from 'node:assert'

test('exports fep0f2a', async () => {
  assert.ok(fep0f2a, 'fep0f2a export is truthy')
  assert.ok('tests' in fep0f2a, 'fep0f2a export has a tests prop')
  assert.ok(fep0f2a.tests.length >= 1, 'fep0f2a.tests has at least one test')
  const result1 = await fep0f2a.tests[0].run({})
  assert.equal(result1.outcome, 'inapplicable')
})
