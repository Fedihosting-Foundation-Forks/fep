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

/**
 * @typedef {any} TestResult
 */

export default {
  attributedTo,
  testCases: [

    {
      name: 'valid module',
      input: {
        module: `
        export default {
          name: 'invalid script module name',
          run: () => ({ outcome: 'passed' }),
        };
        `
      },
      result: {
        outcome: 'passed',
      }
    },

    {
      name: 'invalid module, run is not a function',
      input: {
        module: `
        export default {
          name: 'invalid script module name',
        };
        `
      },
      result: {
        outcome: 'failed',
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
 * @param {Input & {console?:globalThis.console}} input
 */
function getTarget({ module, console = globalThis.console }) {
  if (typeof module !== 'string') {
    return {
      result: {
        outcome: 'inapplicable',
        info: 'input.module MUST be a string',
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
 */
async function expect({ module }) {
  if (typeof module !== 'string') return { result: { outcome: 'failed', info: 'input.module MUST be a string' } }
  const moduleUri = `data:text/javascript;charset=utf-8;base64,${btoa(module)}`
  const test = await import(moduleUri).then(m => m.default)
  if (typeof test?.run !== 'function') return { result: { outcome: 'failed', info: 'exported test.run MUST be a function', pointer: { run: test.run } } }
  // @todo check requirements per FEP
  return { result: { outcome: "passed" } }
}

/**
 * @param {Input} input
 */
async function run(input) {
  // check input for whether this test applies
  const applicability = await checkApplicability(input)
  if ('outcome' in applicability && applicability.outcome === "inapplicable") {
    return applicability
  }

  // get test targets
  const targeting = getTarget(input)
  if ('result' in targeting) return targeting.result
  /** @type {Array<{ target: Target, result: TestResult}>} */
  const results = []
  for (const target of targeting.targets) {
    if (!target) throw new Error(`got undefined target. this should not happen`)
    // check expectations against targets
    const expectations = await expect(target)
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
