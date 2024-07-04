---
slug: "0f2a"
authors: bumblefudge <bumblefudge@learningproof.xyz>, Dmitri Zagidulin <@dmitri@social.coop>
status: DRAFT
dateReceived: 2024-06-XX
discussionTo: XXXX
---
# FEP-0f2a: Announce Activity for Migrations and Deactivation Events

## Summary

This FEP normatively specifies exactly one narrow step in almost all the migration user-stories defined in [FEP-73cd: User Migration Stories][FEP-73cd]:

* the updates to an Actor object made after a migration and/or deactivation event, and
* the Announcement activity which a source server propagates to inform followers of said Actor object update

Our proposal clarifies semantics and behavior of the earlier [FEP-7628][FEP-7628] on which it strictly relies.
It also proposes a simple, additive approach to use the above to express "deactivated" Actors.
It also accomodates migrations to new forms of Actor object, such as "Nomadic"-style Portable Actors as described in [FEP-ef61: Portable Objects][FEP-ef61] and "Independently-hosted" Actor objects as described in [FEP-7952][FEP-7952], both for conforming and non-conforming consumers.
As such, fully implementing all optional features of this proposal would require implementing [FEP-521a: Representing actor's public keys][FEP-521a], which adds terms to the Actor object for publishing a verification method to verify assertions about the Actor independently of domain.

### Current Approaches

Migration is currently supported in a somewhat ad hoc and piecemeal way, without harmonized expectations for how to update, announce, or interpret an Actor object after a migration, or after a deactiviation.
Deactivation is sometimes referred to colloquially as a "tombstone" event, although we have opted to explore a "migration to null" approach rather than use the Activity Streams [Tombstone](https://www.w3.org/TR/activitystreams-vocabulary/#dfn-tombstone) Type, which is specified and widely used for content objects but less established for Actor objects.
Changing the `type` of a deactivated Actor itself to `Tombstone` was considered as an approach, but this additive approach was chosen over one based on `Actor.type` due to diversity of handling of Actor types and the potential for unexpected side-effects and backwards-incompatibility it could introduce.

We did not do a review of existing codebases, and the only public prior art that we're aware of is the retrospecification of current practice in [FEP-7628: Move Actor][FEP-7628].

To our knowledge, there have been no public proposals for how to express a given Actor's controller expressing an "intent [for that Actor] to be forgotten" to other servers where interactions with it may be stored, much less how to document that intent for legal purposes (which is explicitly out of scope here). `Tombstone` does seem to be [used for this kind of intent broadcasting](https://socialhub.activitypub.rocks/t/the-delete-activity-and-its-misconceptions/137) for objects, at least in Pleroma.

## Specification

### Conformance

MUST, MAY, and SHOULD used in the [RFC-2119] sense where they appear in CAPITAL LETTERS.

Implementations SHOULD signal their support for this specification by including `"https://w3id.org/fep/7628"` in the `@context` array of their Actors, as this will clearly signal that the _ABSENCE_ of a `movedTo` or `copiedTo` property indicates a currently-active Actor.

Implementations MAY prove support for this specification by publishing a Conformance Report referencing the tests run.
A specification for possible tests is provided in [fep-0f2a-test-case](./fep-0f2a-test-case.md).

### Actor Object Deactivation Syntax

In the section, ["Move Activity"](https://codeberg.org/fediverse/fep/src/branch/main/fep/7628/fep-7628.md#move-activity) of [FEP-7628][], two variations of the Mastodon-style `Move` Activity are defined, as well as semantics for the `movedTo` and `copiedTo` properties that MUST be applied to the Actor object on the source server of the activity:

> If previous primary actor is deactivated after migration, it MUST have movedTo property containing the ID of the new primary actor. [...]
If previous primary actor is not deactivated, copiedTo property MUST be used.

We add a third formal requirement, that both `movedTo` and `copiedTo` MUST NOT be present in the same Actor object.
Consuming implementations SHOULD treat an Actor with both properties as malformed.

Many other current and future process and Activities could also be using the same semantics, including new "styles" or "profiles" of the many possible Actor objects allowed by the [ActivityPub] specification.
These include Actors that *do not change `id` after migrating*, whether they conform to the [Nomadic][FEP-ef61] Actor extension, or to the [separately-hosted][FEP-7952] Actor extension.
If an account is moving to one of these configurations, the `movedTo` or `copiedTo` value will be the `id` and location of an `ap://` URL, or to a URL controlled by the Actor object's data subject, respectively.

If the source server before the deactivation event included a public key for signing Activities expressed according to [Client-Signing][FEP-521a], and the same public key will NOT be published at the destination server for verifying post-migration Activities, then the source server MAY add an `expires` key and current-timestamp value to the key's `assertionMethod` object as described in [section #2.3.1: Verification Methods](https://www.w3.org/TR/vc-data-integrity/#verification-methods) of the [W3C Data Integrity](https://www.w3.org/TR/vc-data-integrity) specification (to which [FEP-521a] normatively refers).
Any consumer fetching this `assertionMethod` object for the purposes of verifying signatures according to the Data Integrity algorithm will thus invalidate signatures newer than the deactivation of that key.

If an account has been deleted intentionally and consuming implementations are expected to recognize this, we propose that a `movedTo` value of `""`, i.e. an empty string, MUST be used, and a JSON value of "NULL" MUST NOT be used.
The reason for this constraint is that some JSON-LD parsers will interpret `null` as equivalent to the `movedTo` value being "unset" or never having been sent, i.e. an Actor in its default, active, pre-migration/pre-deactivation state.
See the [JSON-LD 1.1 specification](https://w3c.github.io/json-ld-syntax/#terms-imported-from-other-specifications) for more details on "NULL" and JSON-LD parsing.

If an account containing a valid `copiedTo` value has been deleted intentionally, this MUST be expressed by set the `movedTo` property to the value of the current `copiedTo` property and removing the former `copiedTo` property.
An invalid, malformed, or non-resolving `copiedTo` MUST be deleted when setting `movedTo` to `""`.

If a user account is being deactivated but the source server wants to enable a future migration to be authenticated cryptographically, it is RECOMMENDED that a public key be added to the Actor object (if not already present), as per to [FEP-521a].

### Announcing a Deactivation Event

After these changes have been made to the Actor object on the source server, an Announce activity SHOULD be sent out with the Actor as its object.

If a user account is being deactivated but the source server wants to enable a future migration to be authenticated cryptographically, it is RECOMMENDED that the Announce activity be signed as per [FEP-8b32].

An Actor-update Announce activity SHOULD be addressed to the Actor's Followers.

### Interpreting a Deactivated Actor Object

In the section, ["`movedTo` and `copiedTo` properties"](https://codeberg.org/fediverse/fep/src/branch/main/fep/7628/fep-7628.md#movedto-and-copiedto-properties) of [FEP-7628][], the following general rule for all Actor objects is proposed:

> Publishers SHOULD NOT deliver activities to actor's inbox if movedTo property is present.

We would add the following behavioral expectations:

* Publishers SHOULD attempt to resolve the `movedTo` property to find out if it contains an inbox property.
  * If an inbox is found, publishers SHOULD apply security, privacy, and federation policies on the domain at which it is hosted before taking any further action.
  * If said inbox is permitted, publishers MAY attempt to deliver activities to the new inbox.
* If no `movedTo` value is set and a `copiedTo` value is set, publishers MAY resolve a `copiedTo` value to retrieve an `inbox` value and similarly process it.
  * In the case of a value `copiedTo` inbox and allowance by policy, delivery SHOULD be attempted to the new inbox ONLY.
  * In the case of invalid `copiedTo` inbox or disallowing by policy, delivery MAY be attempted to the deactivated inbox ONLY.
* Consuming implementations that keep redirect or alias records MAY persist the above-resolved relationship to avoid repeating this resolution in the future.

There are caveats to interpreting these values if the value of `movedTo` or `copiedTo` contains an unconventional URL generated by an implementation extended by the above-mentioned FEPs:

* If the `movedTo` or `copiedTo` value is a valid URL beginning with the prefix `ap://` and the `@context` value includes the relevant extension properties, the destination server of the migration is likely implementing [FEP-ef61] and may require custom resolution logic to return an Actor object.
* Similarly, if the `movedTo` or `copiedTo` value contains an actor-relative URL of the type defined in [FEP-7952], it should resolve as usual if the server is live, as long as the querying implementation allows for the HTTP redirect and has no policy against (or hardcoded assumptions incompatible with) `inbox` values on different domains than `id` values for a given Actor.
* If an actor returned contains a non-empty `movedTo` or a non-empty `copiedTo` value in turn, this should in turn be dereferenced, barring domain-based policies to the contrary.
* If a querying implementation cannot resolve a value of these types or further indirections, it SHOULD consider them equivalent to URLs that return 404 and MAY log an error or warning to user or system log as appropriate.
* It is RECOMMENDED that unresolvable `movedTo` values be displayed to end-users as corrupted or incomplete moves, rather than as deactivated accounts (i.e., `movedTo` === "").

### Interpreting an Announce Activity of a Deactivated Actor

Servers receiving an Announce object with an Actor as its object should NOT increment a `shares` collection (as Actors never, to our knowledge, have one to increment!).
If a receiving server persists redirects or aliases to more smoothly remain aware of migrating or multi-homed users, or for other reasons, it MAY resolve the new Actor object and perform the above-described checks and MAY record said Actor update.

## Open Issues

1. Are there others to which an Actor-update Announce should be addressed beyond just Followers? is it worth calling out server-instance Actors, since they might also want to know for... idunno moderation reasons?
2. Announce Activity example
3. Address Actor Equivalence Attestation objects explicitly, or leave up to implementer imagination?

## References

* [FEP-521a: Representing actor's public keys][FEP-521a]
* [FEP-73cd: Migration User Stories][FEP-73cd]
* [FEP-7628: Move Actor][FEP-7628]
* [FEP-7952: Roadmap for Actor and Object Portability][FEP-7952]
* [FEP-8b32: Object Integrity Proofs][FEP-8b32]
* [FEP-cd47: Federation-friendly Addressing and Deduplication Use-Cases][FEP-cd47]
* [FEP-ef61: Portable Objects][FEP-ef61]

* Christine Lemmer Webber, Jessica Tallon, [ActivityPub][AP], 2018
* S. Bradner, Key words for use in RFCs to Indicate Requirement Levels, 1997
* Dave Longley, Manu Sporny, [Verifiable Credential Data Integrity 1.0][DI for VCs], 2023
* Manu Sporny, Dave Longley, Markus Sabadell, Drummond Reed, Orie Steele,  Christopher Allen, [Decentralized Identifiers][DID] (DIDs) v1.0, 2022
* Dave Longley, Manu Sporny, [Data Integrity EdDSA Cryptosuites][DI Sigs] v1.0, 2023
* A. Rundgren, B. Jordan, S. Erdtman, [JSON Canonicalization Scheme][JCS] (JCS), 2020

[FEP-521a]: https://codeberg.org/fediverse/fep/src/branch/main/fep/521a/fep-521a.md
[FEP-73cd]: https://codeberg.org/fediverse/fep/src/branch/main/fep/73cd/fep-73cd.md#migration-user-stories
[FEP-7628]: https://codeberg.org/fediverse/fep/src/branch/main/fep/7628/fep-7628.md
[FEP-7952]: https://codeberg.org/bumblefudge/fep/src/branch/fep-7952--roadmap-for-actor-and-object-portability/fep/7952/fep-7952.md
[FEP-8b32]: https://codeberg.org/fediverse/fep/src/branch/main/fep/8b32/fep-8b32.md
[FEP-cd47]: https://codeberg.org/fediverse/fep/src/branch/main/fep/cd47/fep-cd47.md
[FEP-ef61]: https://codeberg.org/fediverse/fep/src/branch/main/fep/ef61/fep-ef61.md

[AP]: https://www.w3.org/TR/activitypub/
[DI Sigs]: https://w3c.github.io/vc-di-eddsa/#eddsa-jcs-2022
[DI for VCs]: https://w3c.github.io/vc-data-integrity/
[DID]: https://www.w3.org/TR/did-core/
[JCS]: https://www.rfc-editor.org/rfc/rfc8785
[RFC-2119]: https://tools.ietf.org/html/rfc2119.html

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement
Proposal have waived all copyright and related or neighboring rights to this work.
