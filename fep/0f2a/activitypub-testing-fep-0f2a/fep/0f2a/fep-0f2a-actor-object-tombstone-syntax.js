const name = 'Actor Object Tombstone Syntax'
const slug = 'fep-0f2a-actor-object-tombstone-syntax'
const uuid = '73257c1a-70da-42df-9698-579940c7065a'
const description = 'This rule checks whether a given Actor Object has used valid `movedTo` or `copiedTo` values and exclusively.'
const attributedTo = [
  'https://bumblefudge.com',
]

/**
 * Expected input to the test rule.
 * This will be checked for test applicability.
 * If the test is applicable, the rule will derive a test target from the Input,
 * then check expectations against the Target
 * returning a result with Outcomes
 * @typedef Input
 * @property {unknown} actor
 */

/**
 * The test will check expectations against test Target derived from Input
 * @typedef Target
 * @property {object} actor
 */

/** 
 * Outcome - every test Target has an outcome
 * @typedef {import("../../test-utils").Outcome} Outcome
 */

/**
 * TestCase
 * @typedef {import("../../test-utils").TestCase<I,O>} TestCase
 * @template I
 * @template {string} O
 */

/**
 * @type {TestCase<Input,Outcome>}
 */
export default {
  attributedTo,
  description,
  testCases: [

    // # test cases from ./fep-0f2a-test-case.md:

    {
      name: 'Missing `@context values`',
      input: {
        actor: {
          "@context": "https://www.w3.org/ns/activitystreams",
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox"
        }
      },
      result: {
        outcome: 'inapplicable',
      }
    },

    // @todo add remaining test cases from ./fep-0f2a-test-case.md

    // # below are test cases not in spec

    {
      name: 'undefined input actor',
      input: {
        actor: undefined
      },
      result: {
        outcome: 'inapplicable'
      }
    },

    // If `actor` JSON does not have a `type` property, the outcome MUST be `inapplicable`.
    {
      name: 'input actor has no type property',
      input: {
        actor: {},
      },
      result: {
        outcome: 'inapplicable'
      }
    },

  ],
  input: {
    actor: {
      help: 'the actor object that should be tested',
      required: true,
      rangeIncludes: ["https://www.w3.org/ns/activitystreams#Actor"],
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
 *          |{ actor: object }}
 */
function checkApplicability(input) {
  let actor
  if (typeof input.actor === "string") {
    // if a string, it must be a JSON string
    actor = JSON.parse(input.actor)
  } else {
    actor = input.actor
  }
  if (typeof actor !== 'object' || !actor) return {
    outcome: "inapplicable",
    info: 'applicability requires input.actor MUST be an object'
  }
  if (!('type' in actor)) return {
    outcome: 'inapplicable',
    info: 'applicability requires input.actor MUST have a type property',
  }
  if (!('assertionMethod' in actor)) return {
    outcome: 'inapplicable',
    info: 'applicability requires input.actor MUST have an assertionMethod'
  }
  if (!(Array.isArray(actor.assertionMethod))) return {
    outcome: 'inapplicable',
    info: 'applicability requires input.actor.assertionMethod MUST be an Array'
  }
  if (!actor.assertionMethod.find(m => assertionMethodHasType(m, 'Multikey'))) return {
    outcome: 'inapplicable',
    info: 'actor.assertionMethod array MUST contain at least one entry with type "Multikey"',

  }
  return {
    actor,
  }
}

/**
 * given test rule inputs, return test targets.
 * (does some checks from 'Applicability' section of test rule)
 * @param {Input} input
 * @returns {{result: import("../../test-utils").TestResult<import("../../test-utils").Outcome>} 
 *          |{targets: Iterable<Target>}}}
 */
function getTarget({ actor, console = globalThis.console }) {
  if (typeof actor === "string") {
    // if actor is a string, it must be JSON
    actor = JSON.parse(actor)
  }
  if (typeof actor !== 'object' || !actor) {
    return {
      result: {
        outcome: 'inapplicable',
        info: 'input.actor MUST be an object',
      }
    }
  }

  return {
    targets: [actor]
  }
}

// @ts-expect-error todo
function assertionMethodHasType(assertionMethod, t) {
  if (Array.isArray(assertionMethod.type)) {
    return assertionMethod.type.includes(t)
  }
  return assertionMethod.type === t
}

/**
 * run expectations against target
 * @param {Target} target
 * @returns {{result:import("../../test-utils").TestResult<import("../../test-utils").Outcome>}
 *           |undefined}
 */
function expect({ actor, assertionMethod }) {
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
    return results[0]
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
