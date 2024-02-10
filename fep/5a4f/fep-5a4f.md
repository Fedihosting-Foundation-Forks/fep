---
slug: "5a4f"
authors: Laxystem <the@laxla.quest>
status: DRAFT
---
[ActivityPub]: https://www.w3.org/TR/activitypub
[RFC-2119]: https://datatracker.ietf.org/doc/html/rfc2119.html

# FEP-5a4f: Federated Democracy

## Summary
Online organizations (such as FOSS projects) often find themselves in the position where they need to make collective decisions,
with no real organization-wide polling option.

This FEP intends to solve that by introducing [ActivityPub] types and properties to allow for federated and democratic votes.

## Requirements
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this specification are to be interpreted as described in [RFC-2119].

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
    * MUST have a `as:name`.
    * MUST have an `@id`.
    * MAY have a `@type` of `as:Actor`.
* `fd:Vote`, extends `as:IntransitiveActivity`.
    * MUST have at least one `as:summary`.
    * MUST have a `as:startTime`. This property MUST NOT be changed via an `as:Update` activity.
    * MUST have a single `as:closed`, being a valid `xsd:dateTime` or `xsd:boolean`.
    * MUST have an `fd:allowsNeutralVotes`.
    * SHOULD have a `as:subject`, referencing a `fd:Subject`. This property MUST NOT be changed via an `as:Update` activity.
    * SHOULD have a `fd:result` if this vote has ended.
    * SHOULD have a `fd:forCount`.
    * SHOULD have a `fd:neutralCount` if `fd:allowsNeutralVotes` is true.
    * SHOULD have an `fd:againstCount`.
    * MAY have a `as:describes`, referencing the `as:Activity` that'll be executed if this vote succeeds. This property MUST NOT be changed via an `as:Update` activity.
    * MAY have a `as:target`, referencing the `as:Object` or `as:Link` this vote will affect.
    * MAY have an `as:endTime`, signifies when a vote is planned to end. Votes will be considered time un-limited if this property is missing.
    * MAY have a `fd:wasVetoed`.
    * MAY have a `fd:for`.
    * MAY have a `fd:neutral`.
    * MAY have an `fd:against`.

The activities `as:Accept`, `as:Ignore` and `as:Reject` may be used with `fd:voter` and an `as:object` of `as:Vote` to vote for, neutral, and against it, respectively.