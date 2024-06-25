import { describe, it } from 'node:test';
import assert from "node:assert";

import testCase from "./actor-objects-must-express-signing-key-as-assertionMethod-multikey.js"
//import { testHasTestCases } from '../../test-utils.js';

await describe(`activitypub-testing test ${testCase.slug}`, async () => {
  await describe('default export', async () => {
    await it('has a uuid', () => {
      assert.equal(typeof testCase.uuid, 'string')
    })
  })

  //await it('has testCases', async () => {
  //  await testHasTestCases(testCase, { minimum: 1 })
  //})

  await it('when inputs are {}, outcome is inapplicable', async () => {
    // @ts-expect-error - testing even though typechecker should prevent
    const result = await testCase.run({})
    assert.equal(result.outcome, 'inapplicable')
  })
});
