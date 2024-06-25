import { fep521a } from "../index.js"
import { test } from "node:test"
import assert from 'node:assert'

test('exports fep521a', async () => {
  assert.ok(fep521a, 'fep521a export is truthy')
  assert.ok('tests' in fep521a, 'fep521a export has a tests prop')
  assert.ok(fep521a.tests.length >= 1, 'fep521a.tests has at least one test')
  const result1 = await fep521a.tests[0].run({})
  assert.equal(result1.outcome, 'inapplicable')
})
