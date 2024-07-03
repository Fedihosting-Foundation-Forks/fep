import { describe, it } from 'node:test';
import assert from "node:assert";

import testCase from "./fep-c551-actor-object-tombstone-syntax.js"

await describe(`activitypub-testing test ${testCase.slug}`, async () => {
  await describe('default export', async () => {
    await it('has a uuid', () => {
      assert.equal(typeof testCase.uuid, 'string')
    })
  })

  await it('has testCases', async () => {
    await testHasTestCases(testCase, { minimum: 1 })
  })

  await it('when inputs are {}, outcome is inapplicable', async () => {
    // @ts-expect-error - testing even though typechecker should prevent
    const result = await testCase.run({})
    assert.equal(result.outcome, 'inapplicable')
  })

  // @todo re-enable this
  // await it('when input.actor is a JSON string, outcome can be passed', async () => {
  //   const validActor = testCase.testCases.find(t => t.name === 'Valid Actor')?.input.actor
  //   // @ts-expect-error - testing even though typechecker should prevent
  //   const result = await testCase.run({
  //     actor: JSON.stringify(validActor)
  //   })
  //   assert.equal(result.outcome, 'passed')
  // })
});

/**
 * @template Inputs
 * @template Outcome
 * @param {object} test
 * @param {Iterable<TestCaseExample<Inputs>>} [test.testCases]
 * @param {(input: Inputs) => Promise<TestResult<Outcome>>} test.run
 * @param {object} options
 * @param {number} [options.minimum=0] - minimum required testCases
 */
export async function testHasTestCases({ testCases = [], run }, { minimum = 0 } = {}) {
  let remainingForMinimum = minimum
  for (const testCase of testCases) {
    const result = await run(testCase.input)
    if (result.outcome !== testCase.result.outcome) {
      throw Object.assign(
        new Error(`expected result.outcome to be "${testCase.result.outcome}" but got '${result.outcome}'`),
        {
          name: 'UnexpectedOutcome',
          testCase,
          result
        }
      )
    }
    remainingForMinimum--
  }
  if (remainingForMinimum > 0) {
    throw new Error(`test had ${minimum - remainingForMinimum} testCases but failed to meet required minimum of ${minimum}`)
  }
}
