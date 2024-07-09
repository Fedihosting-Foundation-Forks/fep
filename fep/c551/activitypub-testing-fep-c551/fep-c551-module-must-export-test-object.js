const name = 'fep-c551 module must export test object'
const slug = 'fep-c551-module-must-export-test-object'
const uuid = '14bab0ae-e682-4f4c-9474-ef65ca47d527'
const attributedTo = [
  'https://bengo.is',
]

/**
 * Expected input to the test rule.
 * This will be checked for test applicability.
 * If the test is applicable, the rule will derive a test target from the Input,
 * then check expectations against the Target
 * returning a result with Outcomes
 * @typedef Input
 * @property {unknown} module
 */

/**
 * The test will check expectations against test Target derived from Input
 * @typedef Target
 * @property {string} module
 */

/** 
 * Outcome - every test Target has an outcome
 * @typedef {"inapplicable"|"passed"|"failed"} Outcome
 */

export default {
  attributedTo,
  testCases: [

    {
      name: 'valid script',
      input: {
        module: `
        export const name = 'invalid script module name';
        export default { name };
        `
      },
      result: {
        outcome: 'passed',
      }
    },

  ],
  input: {
    module: {
      help: 'ECMAScript Module that exports a test object',
      required: true,
    }
  },
  name,
  run,
  slug,
  uuid,
}

/**
 * given test rule inputs, check for applicability.
 * If the input does not pass test rule applicability requirements,
 *   return a result with outcome "inapplicable".
 * (does some checks from 'Applicability' section of test rule)
 * @param {Input} input
 * @returns {{ outcome: "inapplicable", info: string }
 *          |{ module: string }}
 */
function checkApplicability(input) {
  if (typeof input.module !== 'string') return {
    outcome: "inapplicable",
    info: 'applicability requires input.module MUST be a string'
  }
  return {
    module: input.module,
  }
}

/**
 * given test rule inputs, return test targets.
 * (does some checks from 'Applicability' section of test rule)
 * @param {Input} input
 * @returns {{result: import("../../test-utils").TestResult<import("../../test-utils").Outcome>} 
 *          |{targets: Iterable<Target>}}}
 */
function getTarget({ module, console = globalThis.console }) {
  if (typeof module !== 'string') {
    return {
      result: {
        outcome: 'inapplicable',
        info: 'input.actor MUST be a string',
      }
    }
  }

  return {
    targets: [{ module }]
  }
}

/**
 * run expectations against target
 * @param {Target} target
 * @returns {{result:import("../../test-utils").TestResult<import("../../test-utils").Outcome>}
 *           |undefined}
 */
function expect({ module }) {
  if (typeof module !== 'string') return { result: { outcome: 'failed', info: 'input.module MUST be a string' } }
  // @todo check requirements per FEP
  return { result: { outcome: "passed" } }
}

/**
 * 
 * @param {Input} input
 * @returns {Promise<import("../../test-utils").TestResult<import("../../test-utils").Outcome>>}
 */
async function run(input) {
  // check input for whether this test applies
  const applicability = await checkApplicability(input)
  if (applicability?.outcome === "inapplicable") return applicability

  input = {
    ...input,
    actor: applicability.actor,
  }
  // get test targets
  const targeting = getTarget(input)
  if ('result' in targeting) return targeting.result
  /** @type {Array<{ target: Target, result: import("../../test-utils").TestResult<Outcome, unknown>}>} */
  const results = []
  for (const target of targeting.targets) {
    if (!target) throw new Error(`got undefined target. this should not happen`)
    // check expectations against targets
    const expectations = expect(target)
    if (expectations && 'result' in expectations) results.push({
      target,
      result: expectations.result,
    })
  }
  if (results.length === 1) {
    return results[0].result
  } else if (results.length) {
    return {
      outcome: results.every(r => r.result.outcome === "passed") ? "passed" : "failed",
      pointer: {
        results
      }
    }
  }
  throw Object.assign(new Error('unexpected input'), { input })
}
