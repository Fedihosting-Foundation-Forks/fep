---
slug: "5a4f"
authors: Laxystem <the@laxla.quest>
status: DRAFT
---
# FEP-5a4f: Federated Democracy

## Summary
Online organizations (such as FOSS projects) often find themselves in the position where they need to make collective decisions,
with no real organization-wide polling option.

This FEP intends to solve that by introducing [[ActivityStreams 2.0]] types and properties to allow for federated and democratic votes.

## Requirements
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this specification are to be interpreted as described in [[RFC-2119]].

## Motivation

Management of democratic online organizations is currently very hard. There's no one platform that all people have that supports advanced democratic votes, and there's no single platform that supports automatically applying the results of a vote.

This FEP intends to fix that, by introducing a specification for federated votes built on [[ActivityStreams 2.0]], and designed to be used together with [[ActivityPub]].

It is outside the scope of this FEP to handle vote creation, nor authorization.

## Specification
Types and properties introduced in this FEP have the [`https://www.w3id.org/fep/5a4f/ns.json#`](ns.json) prefix, shortened to `fd`. The `https://www.w3.org/ns/activitystreams#` prefix is shortened to `as`. Types and properties defined by this FEP MUST NOT be used in any way not described in this FEP or an extension of it, to prevent accidental voting.

This FEP defines the following properties:
* `fd:actualEndTime`, a functional `xsd:dateTime`.
* `fd:allowsNeutralResponses`, a functional `xsd:boolean`.
* `fd:wasVetoed`, a functional `xsd:boolean`, defaulting to `false`.
* `fd:result`, a functionl `xsd:boolean`.
* `fd:forCount`, a functional `xsd:nonNegativeInteger`.
* `fd:neutralCount`, a functional `xsd:nonNegativeInteger`.
* `fd:againstCount`, a functional `xsd:nonNegativeInteger`.
* `fd:voters`, a functional `Collection` of `Voter`s.
* `fd:for`, a functional `Collection` of `Voter`s.
* `fd:neutral`, a functional `Collection` of `Voter`s.
* `fd:against`, a functional `Collection` of `Voter`s.
* `fd:voter`, a functional `Voter`.

This FEP defines the following types:
* `fd:Subject`, extends `as:Object`.
    * MUST have an `@id`.
    * SHOULD have a `fd:voters`.
    * SHOULD have at least one `as:summary`.
* `fd:Voter`, extends `as:Object`.
    * MUST have at least one `as:name`.
    * MUST have an `@id`.
    * MAY have a `@type` of `as:Actor`.
* `fd:Vote`, extends `as:IntransitiveActivity`.
    * MUST have at least one `as:summary`.
    * MUST have a `as:startTime`. This property MUST NOT be changed via an `as:Update` activity.
    * MUST have a single `as:closed`, being a valid `xsd:dateTime` or `xsd:boolean`.
    * MUST have an `fd:allowsNeutralVotes`.
    * MUST have an `as:sharedInbox`.
    * SHOULD have a `as:subject`, referencing a `fd:Subject`. This property MUST NOT be changed via an `as:Update` activity.
    * SHOULD have a `fd:result` if this vote has ended.
    * SHOULD have a `fd:forCount`.
    * SHOULD have a `fd:neutralCount` if `fd:allowsNeutralVotes` is true.
    * SHOULD have an `fd:againstCount`.
    * MAY have a `as:describes`, referencing the `as:Activity` that'll be executed if this vote succeeds. This property MUST NOT be changed via an `as:Update` activity.
    * MAY have a `as:target`, referencing the `as:Object` or `as:Link` this vote will affect.
    * MAY have an `as:endTime`, signifies when a vote is planned to end. Votes will be considered time un-limited if this property is missing.
    * MAY have a `fd:wasVetoed`. Implementations MUST NOT assume veto implies a `fd:result` of `false`.
    * MAY have a `fd:for`. MAY contain less `fd:Voter`s than `fd:forCount`.
    * MAY have a `fd:neutral`. MAY contain less `fd:Voter`s than `fd:neutralCount`.
    * MAY have an `fd:against`. MAY contain less `fd:Voter`s than `fd:againstCount`.

### Responding to a vote

One may respond to a vote by sending an `as:Accept` (in favour), `as:Ignore` (neutral), or `as:Reject` (against) activity to a vote's `as:sharedInbox` with a `fd:voter` and with an `as:object` containing the vote.

## References

[ActivityPub]: https://www.w3.org/TR/activitypub/
[ActivityStreams 2.0]: https://www.w3.org/TR/activitystreams-core/
[RFC-2119]: https://datatracker.ietf.org/doc/html/rfc2119.html

- [[ActivityPub]] Christine Lemmer Webber, Jessica Tallon, 2018
- [[ActivityStreams 2.0]], James M. Snell, Evan Prodromou, 2017
- [[RFC-2119]] S. Bradner, 1997

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.