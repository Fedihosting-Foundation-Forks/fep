---
slug: "c551"
authors: bengo <ben@bengo.co>
status: DRAFT
dateReceived: 2024-07-03
trackingIssue:
discussionsTo:
---

# FEP-c551: Use ECMAScript Modules to Create Conformance Tests for Fediverse Enhancement Proposals

<section id="abstract">
This is a proposal to enhance the fediverse by creating test cases for FEPs as ECMAScript Modules.
</section>

<!-- section break -->

## Context

[FEP-d9ad][] proposes to Create Conformance Tests for Fediverse Enhancement Proposals.

This FEP furthermore proposes to do so by implementing [FEP-d9ad][] Conformance Test specifications as ECMAScript Modules (i.e. JavaScript Modules).

## Definitions

### ECMAScript Module

a resource that can be `import`ed in ECMAScript/JavaScript into a module reference

### Test Module

an ECMAScript Module used to implement a [FEP-d9ad][]-style Conformance Test

### Test Object

an ECMAScript Object used to implement a [FEP-d9ad][]-style Conformance Test. There may be one or more Test Objects in one `import`able Test Module.

## Proposal

### Test Objects

FEP testers MAY publish implementations of their test specifications as an [ECMAScript Object][] following the recommendations in this proposal. Such modules may be referred to as Test Objects.

[Test Object][]s MUST have a property named `type` whose value is an Array containing `https://w3id.org/fep/c551/Test`.

[Test Object][]s MUST have a property named `name` whose value is a string.

[Test Object][]s MUST have a property named `run`, and

* the value of `run` MUST be a function
* the result of calling `run` MUST be a Promise that resolves to an object
  * the object that resolves this Promise MUST have a property named `outcome` whose value is a `string`
* the `run` function SHOULD be resilient to being evaluated and run in various ECMAScript runtimes (e.g. node.js or a web browser like chromium)

[Test Object][]s SHOULD have a property named `@context` whose value is an Array containing `https://www.w3.org/ns/activitystreams`.

### Test Modules

FEP testers MAY publish implementations of their test specifications as an [ECMAScript Module][] following the recommendations in this proposal. Such modules may be referred to as Test Modules.

[Test Module][]s SHOULD have no imports. This is to ensure portability of the test modules.

[Test Module][]s MAY export a default export object that is a Test Object

#### Example Test Module

```javascript
export default {
  name: "My first test",
  run: () => ({ outcome: "passed" }),
  "@type": ["https://w3id.org/fep/c551/Test"],
}
```

<!-- section break -->

<section id="conformance">
Conformance requirements are indicated by sentences containing MUST a la <a href="https://datatracker.ietf.org/doc/html/rfc2119">RFC2119</a>.
</section>

## License

[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

[ECMAScript Module]: https://tc39.es/ecma262/#sec-modules
[Test Module]: #test-module
[Test Object]: #test-object
[FEP-d9ad]: https://bengo.is/fep/d9ad/
