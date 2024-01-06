---
slug: "cd47"
authors: Bumblefudge <bumblefudge@learningproof.xyz>
status: DRAFT
dateReceived: 2024-01-08
---
# FEP-cd47: Federation-friendly Addressing and Deduplication Use-Cases

## Summary

A proposed taxonomy of ways to various kinds of ActivityPub data identifiable across locations to simplify higher-order functions like moderation receipts, tracking for trust and safety purposes, data migration, compliance, etc. This is intended as a light-weight and informational/meta-technical design document, not a specification or an extension.

## Rationale

While Camille Françoise's originial "[ABCs][]" paper was focused on disinformation specifically, it lays out the basic taxonomy I will be using here between Actors, Behavior, and Content, as three different vectors for disinformation, but also for abuse, trust and safety issues, inauthentic activity, copyright compliance, hate speech compliance, etc. The goal of this document is to collect the addressable and deduplication requirements for all of these related "content-specific" liabilities and use-cases, and inform the design of addressing and deduplication primitives in future FEPs.

## Terminology

If we scope this exercise to data conformant to the ActivityStreams data model as extended and federated by ActivityPub, we could scope these categories as:

1. Actors are what ActivityPub calls `Actors`: fediverse "accounts", bots, etc.
2. Behavior can here be limited to "the Greater Activity Streams," meaning protocol-native activities wrapped in AS objects defined in AS, AP, or in a FEP with a @Context so as to be fully compatible with the protocol in its strictest RDF form.
3. Content can here be a catch-all for three different sub-types of data: the "contents" of an Activity with arbitrary/open-ended fields (like the user-generated content of a `Note` object, for example), media "attachments" (which we could further constrain to defined media-types in the HTML sense, for simplicity), and links out to other data (URLs, but also other URIs TBD?)

What we mean by "addressing" given the scope defined above is tricky, because there is a URI-based system of `id`s inherent to the JSON-LD data model that the AS and AP specifications build on, and most references to addressing or identification in the core specifications refer only to this graph-friendly but static scheme of resources and links. In practice to date, this has been coextensive with HTTPS URLs and DNS-resolveable domains. Whether non-HTTPS URLs could or should be used _as_ `id`s or `@id`s is out-of-scope of this use-case document, and should be considered a design/implementation decision treated elsewhere. Regardless, today's data is all addressed by domain-based (and domain-dependent) `id`s that any new system should be able to handle and deduplicate in its current form, at least as "legacy" data if any breaking changes were proposed to these practices or to the core specifications.

Today, most actors and behaviors are addressed by their `id`s that are also their current HTTPS "location"; Content is similarly All of these addresses are brittle vis-a-vis duplication, migration, and "server death"-- moving them to a new location creates a new address for identical content/referent, often without a "forwarding" redirection (HTTP-code-based or otherwise), or a backlink to its previous address, while a server going down suddenly just breaks all those links with no verifiable remedy.

One form of location-independent addressing is "content-addressing", the most common form of which is addressing canonicalizable contents by hashing them in canonicalized form, often used in key/value stores. It can sometimes be trickier than expected, however, to excise the location (or all properties that break if location changes) from the canonical form hashed to identify a piece of content, or an actor or a specific behavior.

## Non-technical Requirements

(Rough notes for now)

1. **Abusive activity** often evades or actor-based attribution and moderation; one common form of this on social media is copy-pasted allegations or rumors which bad actors deploy across throwaway accounts, bots, parrot-accounts, friends/accomplices, etc. For this reason, circulating content of an activity like a Note might need to be tracked independent of URI/location, server, and actor in a uniform way, rather than per-activity or per-property (the prevalence of copy-pasta might even be used as a health or authenticity metric for networks, although of course this should not be overapplied as it might return false positives for some of the funniest copypasta meta-memes of the Terminally Online)
2. **Hate-Speech and interpersonal Trust and safety issues**- Relying on (particularly _selectively_ relying on, e.g. per-category) the moderation of a given server or service-provider benefits greatly from interoperable logs of moderation decisions; per-decision receipts or events might benefit from indirection or multi-addressing actors, behaviors, and/or content that moves or is deleted, as well as potentially cacheing it privately for later replay/re-assesment/etc.
   - Some regulations require reporting and/or storing for a period of time toxic or offending content, even if the Actor is removed from the service or deletes their offending Behavior or Content-- a location-independent key/value store by content-address can sever the "server's copy" from the "user's/published copy" for these purposes.
3. **Inauthentic activity**, whether it be "synthetic users" (AI impersonating users for whatever commercial or analytics-inflating purposes) or AI flotsam or deliberate and targetted impersonation, deliberately exploits weaknesses or good-faith in the actor system. Being able to attribute many actors or "sybils" to a common "shadow actor" (a sybil factory, a script, a coordination point of a bot army, etc.) often requires identifying the behavioral pattern or network traffic properties, even probabilistically and then mapping that back to actors that do not otherwise share location-addressing or domain provenance.
4. **"Chain-Letter" Behaviors and Content** is a common pattern in end-to-end encrypted systems like WhatsApp, which has been grappling with the ethical, legal, and political/disinformation consecuences of "chain-letter" style viral communications for a decade. In such systems trying to mitigate such messaging patterns without violating the privacy assumptions of users of E2EE systems, traffic is analyzed to mark outbox content identical to content in the same user's inbox so that future recipient see it marked as a "forward", and "replication speed limits" are imposed to prevent sensational disinformation or deliberately inauthentic replication moving faster than good information.
5. **Deduplication for thorough Copyright Takedowns**: Some copyright regulations (if not in the letter of the regulation, at least in the best-practice or spirit of the law) put the burden of deduplication on a service provider, hoster, and/or aggregator of user-generated content, i.e., a copyright takedown does not apply to a specific URL or a specific file but to the copyrighted material (film, book, etc) that you are hosting and aggregating, _across multiple users or new accounts a user might create, and even if the user re-uploads it in a slightly altered form_. For this reason, many copyright-enforcement regimes today are highly centralized because they require both a mammoth data lake of all reported violations, and some kind of matching algorithm that deduplicates in media-specific and encoding-specific ways across slight edits, crops, tints, tinges, etc.  
   - Note: One way of doing this is a "distance hash" or "locality-sensitive hashing" to create hashes that index commonalities between inputs (patterns, segments in common, structures) or, in audio-visual media, "perceptual hashing" that tries to canonicalize the final visual output of a visual encoding rather than its underlying data structure, compression, codecs, etc. One open-source example of this is [ISCC][ISCC]

## Use Cases

(Rough notes for now)

1. As a server offering data migration to users bringing over old data, I can ingest content-addressed versions of each all actor collections, behavior and content without having to know server-specific paths, `id` patterns, annotations, bucket-storage URL schemes, etc.
   1. I can also check data imports against content-addressed moderation records of that former server, if it is still live and federated with me
   2. I can also access a mirror or snapshot of that data, if the server is no longer online or disfederated from me
2. As a server auditing another server's moderation track record, I can parse receipts or logs of moderation actions that refer to behaviors and content by internal addresses (not necessarily content-addressed!) and retrieve the subjects of those actions by them, even if the actors, behaviors, and/or content in question have been deleted (note: assumes authorization to do so and trust between servers)
3. As a server promising its users the "right to be forgotten" (or just honoring UX expectations of deletion), I can request receipts of deletion from the servers of followers and followers' followers' by content-address of the behavior or content being deleted. (See References)

## Technical Considerations

1. Ephemeral, "in-memory" and/or service-internal objects (which the AP spec recommends to be excluded from the axiom that all Activity objects should have a unique and dereferenceable `id`!) are perhaps the simplest to content-address. These do not need to be addressed by unknown, external, or future parties, but MAY benefit from addressing the same way other content is addressed, e.g. when string-comparing uploads or pre-published content to a content-addressed blocklist before publishing.
2. Sub-Resource Integrity? Hashes of `@Context` files, [Emoji sets](https://codeberg.org/fediverse/fediverse-ideas/issues/53), or other shared resources that might mutate at a static address?
3. Where is RDFC needed and where would JCS be enough?
4. Similarly, how are attachments, links, images, videos, etc canonicalized for hashing? How are arbitrary files (uploads?) canonicalized?
5. Is there a property for Actor objects to backlink to previous `id`s?

## References

Normative

- Christine Lemmer Webber, Jessica Tallon, et al. [ActivityPub][ActivityPub], 2018
- James Snell, Evan Promodorou, [ActivityStreams][], 2017
- [Actors, Behaviors, Content: A Disinformation ABC: Highlighting Three Vectors of Viral Deception to Guide Industry & Regulatory Responses, C. François, September 20, 2019][ABCs] (from the Annals of the [Transatlantic Working Group](https://www.ivir.nl/twg/) [Sessions](https://www.ivir.nl/twg/publications-transatlantic-working-group/))
- [ISCC] - International Standard Content Codes, [specified][ISCCspec] at ISO

Informational

- [SocialHub: We need to build “trust” in this space and the fediverse (2023)](https://socialhub.activitypub.rocks/t/we-need-to-build-trust-in-this-space-and-the-fedivers/3227/10)
- [Fediverse-ideas: Delete Receipts for responsive and responsible federation?](https://codeberg.org/fediverse/fediverse-ideas/issues/55)

[ActivityPub]: https://www.w3.org/TR/activitypub/
[ActivityStreams]: https://www.w3.org/TR/activitystreams/
[ABCs]: https://www.ivir.nl/publicaties/download/ABC_Framework_2019_Sept_2019.pdf
[ISCC]: https://iscc.codes/
[ISCCSpec]: https://iscc.codes/specification/

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
