import { fepc551 } from "../index.js"
import { test } from "node:test"
import assert from 'node:assert'

test('exports fepc551', async () => {
  assert.ok(fepc551, 'fepc551 export is truthy')
  assert.ok('tests' in fepc551, 'fepc551 export has a tests prop')
  assert.ok(fepc551.tests.length >= 1, 'fepc551.tests has at least one test')
  const result1 = await fepc551.tests[0].run({})
  assert.equal(result1.outcome, 'inapplicable')
})
