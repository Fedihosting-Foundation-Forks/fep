---
type:
- TestCase
status: draft
name: Actor Object Migration and Tombstone Syntax
slug: fep-0f2a-actor-object-migration-and-tombstone-syntax
description: |
  This rule checks whether a given Actor Object has used valid `movedTo` or `copiedTo` values and exclusively.
uuid: 73257c1a-70da-42df-9698-579940c7065a
attributedTo:
- https://bumblefudge.com
exampleImplementation: https://codeberg.org/socialweb.coop/tbd

"@context":
- TestCase:
    "@id": http://www.w3.org/ns/earl#:TestCase
  type:
    "@type": "@id"

respec:
  config:
    editors:
    - name: bumblefudge
      url: "https://bumblefudge.com"
      w3cid: 143155
    latestVersion: https://codeberg.org/fediverse/fep/src/branch/main/fep/0f2a/fep-0f2a.md

---

# Actor Object Migration and Deactivation Syntax

## Background

This proposal extends and combines prior FEPs to define syntax and parsing rules for Actor objects which unambiguously express exactly one of the three following states:

1. deactivation, OR
2. migration to another URI, OR
3. duplication at another URI.

## About this Test

This is a Test Case testing conformance with the two properties of an Actor object specified in FEP-0f2a.

## Test Subject

The subject of this test is any data claiming to conform to the specification of an ActivityPub Actor Object and to the FEP-0f2a extension thereof.

This test is *not* directly applicable to an ActivityPub Server.
An ActivityPub Server serves 0 or more Actor Objects.
An ActivityPub Server for a big community might serve hundreds of ActivityPub Actor Objects.
An ActivityPub Server for a single human may serve only that person's ActivityPub Actor Object.

This test applies to Actor *Objects*, but *not* all Actor Objects are addressable by an HTTPS URL.
The URI that addresses an Actor Object is not the same as the Actor Object.
A given URL may resolve to different Actor Objects in different contexts, and a given Actor Object may not be universally addressable across context by any one URL.

## Inputs

This test requires the following [inputs](https://www.w3.org/TR/act-rules-format/#input):

* `actor` - the actor object under tested
  * type: binary data
  * constraints
    * will be interpreted as JSON.
      * If not parseable as JSON, the test result MUST be `inapplicable`.
    
    * dereferenced `@context` array should include [both terms defined by FEP-7628](../7628/context.jsonld)
      * if does not, the test result outcome MUST be `inapplicable`.

## Applicability

This test applies directly to the `actor` input.

* If `actor` is not a JSON object, the outcome MUST be `inapplicable`.
* input `actor` MUST have a `@context` property whose value is an Array containing the string `https://w3id.org/fep/7628`. If it does not, the outcome MUST be `inapplicable`. 

### Test Targets

* input `actor` is the only test target

## Expectations

1. `movedTo` - MUST be a URI OR an empty string, if present
2. `copiedTo` - MUST be a URI, if present
3. `movedTo` and `copiedTo` MUST NOT both be present
4. `actor` JSON's `@context` array SHOULD include `"https://w3id.org/fep/7628"` to signal conformance

## Assumptions

### 1. How to Determine Whether an Actor object supports FEP-7628 Semantics

For the purposes of determining whether the active status and migration history of a given Actor can be tested by this test case:

* the input is valid JSON
* the input, once parsed as JSON
  * has an `@context` property
  * `@context` array includes the URL `"https://w3id.org/fep/7628"`

A warning should be returned if this value is not present.

### 2. Property value expectations

For the purposes of determining the in/active status and migration history of a the target Actor:

* the input is valid JSON
* `movedTo` and `copiedTo` MUST NOT both be present
* `movedTo` can be `""` (empty string) OR a valid URI OR not present
* `copiedTo` can be a valid URI or not present

#### Property Value evaluation logic (Pseudocode)

* the input is valid JSON
* `movedTo` and `copiedTo` MUST NOT both be present
  * //log (malformed actor - both movedTo and copiedTo present)
  * outcome is `FAILED`
* else if `movedTo` is present,
  * value can be `""` (empty string)
    * //log (actor is deactivated)
    * outcome is `PASSED`
  * else value MUST be a valid URI
    * //log (actor has migrated to $movedTo)
    * if URI is 404 //OPTIONAL CHECK
      * throw warning($movedTo not resolvable)
    * outcome is `PASSED`
  * else
    * outcome is `FAILED`
* else if `copiedTo` is present,
  * value MUST be a valid URI
    * if URI is 404 //OPTIONAL CHECK
      * throw warning($copiedTo not resolvable)
    * outcome is `PASSED`
  * else
    * outcome is `FAILED`
* else
  * //log (actor is currently active and unlinked)
  * outcome is `PASSED`

## Test Cases

These are test cases for this test case, and can be used to verify that an implementation of this test case specification will be [consistent](https://www.w3.org/WAI/standards-guidelines/act/implementations/#understanding-act-consistency) with other implementations.

### Missing `@context values`

input

actor:

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Person",
  "inbox": "https://example.com/inbox",
  "outbox": "https://example.com/outbox"
}
```

test result

* outcome: `inapplicable`
  * optional: warning ("value "https://w3id.org/fep/7628" not present in "@context" to signal conformance")

### both `movedTo` and `copiedTo` present

input

actor:

```json
{
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
```

test return

* outcome: `FAILED`, log (`movedTo` and `copiedTo` MUST NOT both be present)

### `movedTo` set to JSON null

input

actor:

```json
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/fep/7628"
    ],
    "type": "Person",
    "inbox": "https://example.com/inbox",
    "outbox": "https://example.com/outbox",
    "movedTo": null
}
```

test return

* outcome: `FAILED`, log (`movedTo` MUST NOT to be set to null)

### `movedTo` set to invalid URI

input

actor:

```json
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/fep/7628"
    ],
    "type": "Person",
    "inbox": "https://example.com/inbox",
    "outbox": "https://example.com/outbox",
    "movedTo": "trustmebro"
}
```

test return

* outcome: `FAILED`, log (`movedTo` MUST be a URI)

### Valid Deactivated Actor

input

* `actor`:

```json
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/fep/7628"
    ],
    "type": "Person",
    "inbox": "https://example.com/inbox",
    "outbox": "https://example.com/outbox",
    "movedTo": ""
}
```

test return

* outcome: `PASSED`, log (`movedTo` set to empty string)

### Valid Migrated Actor

input

* `actor`:

```json
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/fep/7628"
    ],
    "type": "Person",
    "inbox": "https://example.com/inbox",
    "outbox": "https://example.com/outbox",
    "movedTo": "https://actorname.otherexample.com"
}
```

test return

* outcome: `PASSED`, log (`movedTo` set to valid URL)
  * optional: check and log validity of actor referenced by that URI

### Valid Multi-homed Actor

input

* `actor`:

```json
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/fep/7628"
    ],
    "type": "Person",
    "inbox": "https://example.com/inbox",
    "outbox": "https://example.com/outbox",
    "copiedTo": "https://personalarchive.otherexample.com"
}
```

test return

* outcome: `PASSED`, log (`copiedTo` set to valid URI)
  * optional: check and log validity of actor referenced by that URI

## Glossary

### `outcome`

An outcome is a conclusion that comes from evaluating a test on a test subject.
An outcome can be one of the three following types:

* `inapplicable`: No part of the test subject matches the applicability
* `passed`: A test target meets all expectations
* `failed`: A test target does not meet all expectations

## Requirements Mapping

* FEP requirement: - Actor Objects must express signing key as assertionMethod Multikey
  * Required for Conformance to [FEP-521a][FEP-521a]
  * Outcome Mapping
    * when test target `assertionMethod` has outcome `passed`, requirement is satisfied
    * when test target `assertionMethod` has outcome `failed`, requirement is not satisfied
    * when test target `assertionMethod` has outcome `inapplicable`, further testing is needed to determine whether this requirement is satisfied

## References

[FEP-521a]: https://codeberg.org/fediverse/fep/src/branch/main/fep/521a/fep-521a.md
[FEP-7628]: https://codeberg.org/fediverse/fep/src/branch/main/fep/7628/fep-7628.md

## Change Log

* 2024-06-28T15:20:36Z - first draft by bumblefudge

## Issues List

* Add a test vector with signed IdentityProof that verifies using current DI spec and dummy private key
