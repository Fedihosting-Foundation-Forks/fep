const name = 'Actor Objects must express signing key as assertionMethod Multikey'
const slug = 'fep-521a-actor-objects-must-express-signing-key-as-assertionmethod-multikey'
const uuid = '36f73f6e-8c14-4606-864d-32b9a74abc87'
const description = 'This rule checks whether a given Actor Object has a Multikey object in top-level assertionMethod property of the shape specified in FEP-521a.'

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
 * @property {unknown} assertionMethod
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
  description,
  testCases: [

    // # test cases from ./actor-....md

    {
      name: 'Missing assertionMethod',
      input: {
        actor: {
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox"
        }
      },
      result: {
        outcome: 'inapplicable',
      }
    },

    {
      name: 'Misshapen assertionMethod Array',
      input: {
        actor: {
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox"
        }
      },
      result: {
        outcome: 'inapplicable',
      }
    },

    {
      name: 'Misshapen assertionMethod Members',
      input: {
        actor: {
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "assertionMethod": [{
            "inappropriateKey": "z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2"
          }]
        }
      },
      result: {
        // warning (malformed assertionMethod member)
        outcome: 'inapplicable',
      }
    },

    {
      name: 'Valid Actor',
      input: {
        actor: {
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "id": "https://example.com/",
          "assertionMethod": [
            {
              "id": "https://example.com/#ed25519-key",
              "type": "Multikey",
              "controller": "https://example.com/",
              "publicKeyMultibase": "z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2"
            },
            {
              "inappropriateKey": "z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2"
            }
          ]
        },
      },
      result: {
        outcome: 'passed',
      },
      targets: [
        ['assertionMethod[0]', { outcome: 'passed' }],
        ['assertionMethod[1]', { outcome: 'inapplicable' }],
      ]
    },

    // # below are test cases not in spec

    {
      name: 'Valid Actor (as JSON string)',
      input: {
        actor: JSON.stringify({
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "id": "https://example.com/",
          "assertionMethod": [
            {
              "id": "https://example.com/#ed25519-key",
              "type": "Multikey",
              "controller": "https://example.com/",
              "publicKeyMultibase": "z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2"
            },
            {
              "inappropriateKey": "z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2"
            }
          ]
        }),
      },
      result: {
        outcome: 'passed',
      },
      targets: [
        ['assertionMethod[0]', { outcome: 'passed' }],
        ['assertionMethod[1]', { outcome: 'inapplicable' }],
      ]
    },

    {
      name: 'multikey has non multibase-base58btc encoded publicKeyMultibase',
      input: {
        actor: {
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "id": "https://example.com/",
          "assertionMethod": [
            {
              "id": "https://example.com/#ed25519-key",
              "type": "Multikey",
              "controller": "https://example.com/",
              // it should start with 'z'
              "publicKeyMultibase": "6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2"
            }
          ]
        },
      },
      result: {
        outcome: 'failed',
      },
      targets: [
        ['assertionMethod[0]', { outcome: 'failed' }],
      ]
    },

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

    {
      name: 'multikey missing id property',
      input: {
        actor: {
          type: ["Person"],
          assertionMethod: [{
            type: ["Foo", "Multikey"],
          }]
        }
      },
      result: { outcome: 'failed', },
    },
    {
      name: 'assertionMethod missing type',
      input: {
        actor: {
          type: ["Person"],
          assertionMethod: [{
            id: 'urn:uuid:foo',
          }]
        }
      },
      result: { outcome: 'inapplicable', },
    },
    {
      name: 'assertionMethod type missing Multikey',
      input: {
        actor: {
          type: ["Person"],
          assertionMethod: [{
            id: 'urn:uuid:foo',
            type: ["NewSigScheme"],
          }]
        }
      },
      result: { outcome: 'inapplicable', },
    },
    {
      name: 'multikey missing controller property',
      input: {
        actor: {
          type: ["Person"],
          assertionMethod: [{
            id: 'urn:uuid:foo',
            type: ["Multikey"],
          }]
        }
      },
      result: { outcome: 'failed', },
    },
    {
      name: 'multikey id is number',
      input: {
        actor: {
          type: ["Person"],
          assertionMethod: [{
            type: ["Multikey"],
            id: 1,
          }]
        }
      },
      result: { outcome: 'failed', },
    },
    {
      name: 'multikey controller is different than actor id',
      input: {
        actor: {
          type: ["Person"],
          id: "urn:foo",
          assertionMethod: [{
            id: 'urn:uuid:foo',
            type: ["Multikey"],
            controller: "urn:bar",
          }]
        }
      },
      result: { outcome: 'failed', },
    }
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

  if (!('assertionMethod' in actor)) return {
    result: {
      outcome: 'inapplicable',
      info: 'input.actor MUST have an assertionMethod property'
    }
  }

  const actorAssertionMethods = Array.isArray(actor.assertionMethod) ? actor.assertionMethod : [actor.assertionMethod]
  // gather only the assertionMethods that should be test targets
  /** @type {Array<{ assertionMethod: unknown }>} */
  const assertionMethodTargets = []
  for (const assertionMethod of actorAssertionMethods) {
    if (typeof assertionMethod !== 'object') {
      // "each entry that is not is inapplicable (warning)"
      // @todo emit a warning somehow
      console.warn('warning: assertionMethod is not an object', assertionMethod)
    }
    if (!assertionMethodHasType(assertionMethod, 'Multikey')) {
      // each entry not typed as `Multikey` is inapplicable (warning)
      // @todo emit a warning somehow
      console.warn('warning: assertionMethod does not have type "Multikey"', assertionMethod)
    } else {
      // it is typed as Multikey
      // "each entry typed as `Multikey` passes or fails the tests of its validity as a Multikey"
      assertionMethodTargets.push({ actor, assertionMethod })
    }
  }

  return {
    targets: assertionMethodTargets
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
  let isMultikey = false
  try {
    expectAssertionMethodIsFep521aMultikey(assertionMethod, actor)
    isMultikey = true
  } catch (error) {
    return {
      result: {
        outcome: "failed",
        info: "assertionMethod is not a valid fep-521a multikey",
        pointer: {
          assertionMethod,
          error,
        }
      }
    }
  }

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
    if (!target.actor) throw new Error(`got undefined target.actor. this should not happen`, { cause: target })
    // check expectations against targets
    const expectations = expect(target)
    if (expectations && 'result' in expectations) results.push({ result: expectations.result, target })
  }
  if (results.length) {
    return {
      outcome: results.every(r => r.result.outcome === "passed") ? "passed" : "failed",
      pointer: {
        results
      }
    }
  }
  throw Object.assign(new Error('unexpected input'), { input })
}

/**
 * check expectations that the provided object meets FEP-521as
 * requirements for a valid Multikey object.
 * @param {object} actor
 * @param {unknown} assertionMethod
 */
function expectAssertionMethodIsFep521aMultikey(assertionMethod, actor) {
  // MUST be an object
  if (typeof assertionMethod !== 'object' || !assertionMethod) {
    throw new Error(`assertionMethod MUST be an object`)
  }

  if (!(('id' in assertionMethod) && typeof assertionMethod.id === 'string')) {
    throw new Error(`assertionMethod MUST have an id string`)
  }

  // type MUST be Multikey or an Array containing Multikey
  if (!('type' in assertionMethod)) throw new Error(`assertionMethod MUST have a type property`)
  const expectedMultikeyTypeString = "Multikey"
  if (!assertionMethodHasType(assertionMethod, expectedMultikeyTypeString)) {
    throw new Error(`assertionMethod type MUST be Multikey or an Array containing Multikey`)
  }

  // `assertionMethod[x].publicKeyMultibase` - MUST be a [base58btc-encoded](https://www.w3.org/TR/controller-document/#multibase-0) and appropriately-prefixed (in this case, beginning with `z`) expression of a binary public key expression
  if (!(
    ('publicKeyMultibase' in assertionMethod) &&
    (typeof assertionMethod.publicKeyMultibase === 'string') && (assertionMethod.publicKeyMultibase[0] === 'z')
  )) {
    throw new Error(`assertionMethod.publicKeyMultibase MUST be a string startwith with 'z' (i.e. multibase-base58btc)`, {
      cause: {
        assertionMethod
      }
    })
  }
  // MUST have a controller property
  if (!('controller' in assertionMethod)) {
    throw new Error(`assertionMethod MUST have a controller property`)
  }

  // assertionMethod.controller - MUST match the id property, if present, of the parent object, e.g. the actor object
  checkControllerMatches(assertionMethod.controller, actor)
}

/**
 * check an assertionMethod's controller. error if there's a problem
 * @param {unknown} controller 
 * @param {object} actor 
 * @returns 
 */
function checkControllerMatches(controller, actor) {
  if (!('id' in actor)) {
    // no error. actor has no 'id' property to compare controller to
    return
  }
  // controller MUST match the id property, if present, of the parent object, e.g. the actor object
  if (actor.id !== controller) {
    throw new Error(`assertionMethod controller MUST match the id property of the actor ("${actor.id}")`, { cause: { actor } })
  }
}
