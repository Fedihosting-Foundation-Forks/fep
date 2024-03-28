---
slug: "e229"
authors: a <a@trwnh.com>
status: DRAFT
dateReceived: 2024-03-28
---
# FEP-e229: Best practices for extensibility

## Summary

Current popular implementations of ActivityPub do not handle extensibility very well. This FEP seeks to highlight some basic requirements for extensibility, and offer suggested advice to implementers who wish to avoid compatibility issues, particularly for LD-unaware consumers.

## Recommendations

### Ignore JSON-LD context if you don't understand it

LD-unaware consumers MUST NOT attempt naive string comparison against the JSON-LD context declaration. There are several possible reasons why a received document might be valid AS2 but not declare a `@context`. One possibility is that the declared Content-Type is `application/activity+json` and the producer is LD-unaware. Another possibility is that the producer is LD-aware, but using a different context IRI that defines the same terms. Yet another possibility is that the producer is embedding inline term definitions. Regardless of the reason, either the consumer understands it or does not understand it.

### Normalize types into type-sets

It is an unfortunate and erroneous belief that objects in [AS2-Core] or [AP] can have only one type. This assumption breaks proper extensibility. Wherever a generic ActivityStreams consumer needs to know whether it is dealing with an [AS2-Vocab] type or [AS2-Core] mechanism like Collections, it cannot do so unless that type is present in the `type` set. However, extension vocabularies may need to declare additional types as interfaces that have been fulfilled by the given object. For this reason, LD-unaware consumers doing type checks need to take care to normalize `type` into a set, and check that their desired type is contained within that set.

For example, `"type": "Collection"` would be normalized into `"type": ["Collection"]`.

### Consider producing documents compacted against *only* the AS2 context document

Since JSON-LD expanded form is unambiguous, it may be a good idea to use it wherever possible. This slightly reduces human readability due to the additional verbosity, but it results in exactly one possible representation of your extension data. LD-unaware consumers will possibly have to learn the structure of JSON-LD expanded form. LD-aware consumers can "simply" re-compact the document against any additional contexts they understand.

For example, consider the current use of "profile fields" prior to [FEP-fb2a] "Actor metadata". Ignoring that Mastodon currently uses `sc` as a term prefix for an incorrect definition, such a term prefix would be unnecessary if partially-uncompacted JSON-LD was used:

```json
{
	"@context": "https://www.w3.org/ns/activitystreams",
	"id": "https://example.com/~alyssa",
	"type": "Person",
	"name": "Alyssa P. Hacker",
	"attachment": [
		{
			"type": "http://schema.org/PropertyValue",
			"http://schema.org/name": "Pronouns",
			"http://schema.org/value": "she/her"
		}
	]
}
```

### Avoid unnecessary term prefixes

Compact IRI prefixes can have multiple terms map to the same prefix, depending on which context the producer uses for compaction. For example, say we have a prefix for `http://example.com/`. You may encounter some documents with `example:term`, some documents with `ex:term`, some documents with `http://example.com/term`, and so on. LD-aware consumers can "simply" apply JSON-LD expansion to make all terms unambiguous, and then apply JSON-LD compaction against their local preferred context. LD-unaware consumers instead have to deal with unbounded possible equivalent terms, and will either have to add support for them on a case-by-case basis, or reinvent and reimplement JSON-LD expansion. This issue can be ameliorated by taking care to reuse existing conventional prefixes. An example of this is the [RDFa-Context] "initial context".

### Only declare IRIs for terms that are expected to be shared

By default, the ActivityStreams context document declares `@vocab` to be `_`, meaning that the default vocabulary namespace is the blank namespace. Extension types and properties can be implemented as-is by LD-unaware producers, and the JSON-LD expansion algorithm will expand `term` to `_:term`. This may be sufficient for experimental or implementation-specific terms that are not expected to be used by anyone else.

## References

- [AP] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- [AS2-Core] James M Snell, Evan Prodromou, [Activity Streams 2.0](https://www.w3.org/TR/activitystreams-core/), 2017
- [AS2-Vocab] James M Snell, Evan Prodromou, [Activity Vocabulary](https://www.w3.org/TR/activitystreams-vocabulary/), 2017
- [FEP-fb2a] a, [FEP-fb2a: Actor metadata](https://w3id.org/fep/fb2a), 2022
- [RDFa-Context] Ivan Herman, [RDFa Core Initial Context](https://www.w3.org/2011/rdfa-context/rdfa-1.1), 2011

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
