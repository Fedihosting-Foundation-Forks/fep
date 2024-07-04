const name = 'Actor Object Tombstone Syntax'
const slug = 'fep-0f2a-actor-object-tombstone-syntax'
const uuid = '73257c1a-70da-42df-9698-579940c7065a'
const description = 'This rule checks whether a given Actor Object has used valid `movedTo` or `copiedTo` values and exclusively.'

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

    {
      name: 'both `movedTo` and `copiedTo` present',
      input: {
        actor: {
          "@context": [
              "https://www.w3.org/ns/activitystreams",
              "https://w3id.org/fep/7628"
          ],
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "movedTo": "https://otherexample.com/newname",
          "copiedTo": "https://otherexample.com/thirdname"
        }
      },
      result: {
        // log (`movedTo` and `copiedTo` MUST NOT both be present)
        outcome: 'failed',
      }
    },

    {
      name: '`movedTo` set to JSON null',
      input: {
        actor: {
          "@context": [
              "https://www.w3.org/ns/activitystreams",
              "https://w3id.org/fep/7628"
          ],
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "movedTo": null
        }
      },
      result: {
        // log (`movedTo` MUST NOT to be set to null)
        outcome: 'failed',
      }
    },

    {
      name: '`movedTo` set to invalid URI',
      input: {
        actor: {
          "@context": [
              "https://www.w3.org/ns/activitystreams",
              "https://w3id.org/fep/7628"
          ],
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "movedTo": "trustmebro"
        }
      },
      result: {
        // log (`movedTo` MUST be a URI)
        outcome: 'failed',
      }
    },
  
    {
      name: 'Valid Deactivated Actor',
      input: {
        actor: {
          "@context": [
              "https://www.w3.org/ns/activitystreams",
              "https://w3id.org/fep/7628"
          ],
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "movedTo": ""
      }
      },
      result: {
        // log (`movedTo` set to empty string)
        outcome: 'passed',
      }
    },
  
    {
      name: 'Valid Migrated Actor',
      input: {
        actor: {
          "@context": [
              "https://www.w3.org/ns/activitystreams",
              "https://w3id.org/fep/7628"
          ],
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "movedTo": "https://actorname.otherexample.com"
        }
      },
      result: {
        // log (`movedTo` set to empty string)
        outcome: 'passed',
      }
    },

    {
      name: 'Valid Multi-homed Actor',
      input: {
        actor: {
          "@context": [
              "https://www.w3.org/ns/activitystreams",
              "https://w3id.org/fep/7628"
          ],
          "type": "Person",
          "inbox": "https://example.com/inbox",
          "outbox": "https://example.com/outbox",
          "copiedTo": "https://personalarchive.otherexample.com"
        }
      },
      result: {
        // log (`movedTo` set to empty string)
        outcome: 'passed',
      }
    },

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
  // @context MUST be an array
  if ( ! ('@context' in actor && Array.isArray(actor['@context']))) return {
    outcome: 'inapplicable',
    info: 'actor["@context"] MUST be an Array',
    pointer: {
      '@context': actor['@context']
    }
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
    targets: [{actor}]
  }
}

/**
 * run expectations against target
 * @param {Target} target
 * @returns {{result:import("../../test-utils").TestResult<import("../../test-utils").Outcome>}}
 */
function expect({ actor }) {
  // movedTo and copiedTo properties MUST NOT both be present
  if (('movedTo' in actor) && ('copiedTo' in actor)) {
    return {
      result: {
        outcome: 'failed',
        info: '`movedTo` and `copiedTo` MUST NOT both be present',
      }
    }
  }

  // movedTo value MUST be a string
  if (('movedTo' in actor) && typeof actor.movedTo !== 'string') {
    return {
      result: {
        outcome: 'failed',
        info: 'actor.movedTo, if present, MUST be a string'
      }
    }
  }

  // if not an empty string, movedTo value MUST be a URI
  if (actor.movedTo) {
    try {
      new URL(actor.movedTo)
    } catch (error) {
      if (error?.code === 'ERR_INVALID_URL') {
        return {
          result: {
            outcome: 'failed',
            info: `movedTo value MUST be a URL, but URL constructor reported ERR_INVALID_URL`,
            pointer: {
              movedTo: actor.movedTo
            }
          }
        }
      }
      throw error
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
