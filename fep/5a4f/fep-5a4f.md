---
slug: "5a4f"
authors: Laxystem <@laxla@tech.lgbt>
status: DRAFT
relatedFeps: FEP-f1d5, FEP-6481, FEP-888d
---

# FEP-5a4f: Federated Democracy

## Summary

Online organizations (such as FOSS projects) often find themselves in the position where they need to make collective
decisions,
with no real organization-wide polling option.

This FEP intends to solve that by introducing [[ActivityStreams 2.0]] types and properties to allow for federated and
democratic votes.

## Requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "
OPTIONAL" in this specification are to be interpreted as described in [[RFC-2119]].

## Motivation

(this section is non-normative)

Currently, online democratic organization management is nearly-impossible.
There's no one platform that all people have that
supports advanced democratic votes, and there's no single platform that supports automatically applying the results of a
vote.

This FEP intends to fix that, by introducing a specification for federated votes built on [[ActivityStreams 2.0]], and
designed to be used together with [[ActivityPub]].

It is outside the scope of this FEP to handle vote creation, authorization, nor how votes are evaluated.

This FEP is much stricter than ActivityPub;
This is done as voting is an incredibly sensitive process,
and we wish not to cause accidental voting and similar issues.

## Requirements

Types and properties introduced in this FEP have the [`https://www.w3id.org/fep/5a4f#`](context.jsonld) prefix,
shortened to `fd`.
Additionally, `https://www.w3.org/ns/activitystreams#` prefix is shortened to `as`.

Types and properties defined by this FEP MUST NOT be used in any way
not described in this FEP or another FEP extending it.
To use an extension of this FEP, implementations MUST declare so in their NodeInfo, as defined by [[FEP-6481]].

## Specification

### Topics, Voters & Votes

(this section is non-normative)

A *voter* represents an optionally anonymous authorization to respond to votes.

A *vote* is a suggestion or a proposal to invoke an action.

A *topic* is what voters are authorized to; Every vote has a topic,
and voters authorized to a topic can respond to its votes.

An *algorithm* evaluates votes based on the number of all authorized voters,
the number of responses in favour, neutral and against,
and the [`fd:Vote`] itself (usually extended with configuration settings),
and outputs the result if enough information was provided.

### Responding to Votes

To respond to a [`fd:Vote`], one MUST `PUT` an [`as:Accept`], [`as:Ignore`] 
or [`as:Reject`] activity (standing for in favour, neutral, and against, respectively) into its `@id`.

Vote responses MUST have the [`fd:voter`] property.

If the [`fd:allowsEditingResponses`] property is `true`,
another response made by the same [`fd:Voter`] MUST replace the previous one.
Otherwise, the receiving server MUST respond with 405 Method Not Allowed.

If a server receives a response to a vote whose [`fd:ended`] is not `null`, it MUST respond with 405 Method Not Allowed.

If a response was received successfully, the server MUST respond with 202 Accepted
(if the receiving server hasn't updated the cached [`fd:result`], if any) or 204 No Content.

### Evaluating Votes via Public Algorithms

Votes may use a public algorithm to be evaluated,
to allow validation of the vote's results, and to ensure consistency.

If the [`fd:algorithm`] property is present,
the vote MUST be evaluated by sending a `GET` request to one of the [`fd:Algorithm`]'s representations, with one of the following query parameter lists:

* By vote.
    * `vote`, containing the `@id` of the vote to be evaluated.
* Manually.
    * `voterCount` - the number of voters authorized to [`fd:topic`](#topic)
    * `inFavour` - the number of voters that have responded in favour to this vote.
    * `against` - the number of voters that have responded against to this vote.
    * `neutral` - the number of voters that have responded neutrally to this vote. Defaults to zero.
    * Any other parameter required by the [`fd:Algorithm`].
* If no parameters are provided, then the [`fd:Algorithm`] itself MUST be returned instead.

The algorithm MUST return a shortened version of the same `fd:Vote` object, only with an `@id` and a `result` on success.

### Algorithm Discovery
[`fd:Algorithm`]s are decentralized evalutors of [`fd:Vote`]s.

The *definer* of an algorithm is the representation of said algorithm returned by `GET`ting its `@id`.

All representations (except for definers that provide alternative representations) MUST implement the algorithm themselves.
Representations MAY provide different alternatives every call.

All representations MUST return the same results for the same data.
When in doubt, one:
* SHOULD query multiple representations of the algorithm, and consider the more frequent result true.
* MUST NOT Consider the definer the final authority, as (the following list is non-normative):
    * The definer may be taken over by a malicious actor.
    * The definer may be redirecting the request to a different implementation every call.

In case of repetitive conflicts, the algorithm SHOULD be replaced, if possible.

#### Discovering Algorithms via NodeInfo
This section is REQUIRED if an instance implements or defines an [`fd:Algorithm`].

This FEP defines a [[NodeInfo]] extension at `.well-known/nodeinfo`,
providing the `https://www.w3id.org/fep/5a4f#Algorithm` relation.

For example:
```json
{
  "links": [
    {
      "rel": "https://www.w3id.org/fep/5a4f#Algorithm",
      "href": "https://example.social/api/fep/54af/algorithms",

    }
  ]
}
```

The returned `href` MUST return a JsonLD document containing at least one [`fd:Algorithm`].

#### Discovering Algorithms via Webfinger
This section is REQUIRED if an instance implements [[WebFinger]], and only affects [`fd:Algorithm`]s implemented or defined by the server.

An [`fd:Algorithm`]'s `@id` MUST return a link when queried via [[Webfinger]]:

```json
{
  "subject": "https://example.dev/algorthims/abc",
  "links": [
    {
        "rel": "https://www.w3.id.org/fep/5a4f#Algorithm",
        "href": "https://example.social/api/fep/54af/algorithms/abc"
    }
  ]
}
```

The returned `href` MUST return a JsonLD document containing a *single* representation of the [`fd:Algorithm`].

## Vocabulary

[`as:Accept`]: https://www.w3.org/ns/activitystreams#Accept

[`as:Ignore`]: https://www.w3.org/ns/activitystreams#Ignore

[`as:IntransitiveActivity`]: https://www.w3.org/ns/activitystreams#IntransitiveActivity

[`as:Link`]: https://www.w3.org/ns/activitystreams#Link

[`as:Object`]: https://www.w3.org/ns/activitystreams#Object

[`as:Reject`]: https://www.w3.org/ns/activitystreams#Reject

[`as:actor`]: https://www.w3.org/ns/activitystreams#actor

[`as:describes`]: https://www.w3.org/ns/activitystreams#describes

[`as:endTime`]: https://www.w3.org/ns/activitystreams#endTime

[`as:href`]: https://www.w3.org/ns/activitystreams#href

[`as:name`]: https://www.w3.org/ns/activitystreams#name

[`as:rel`]: https://www.w3.org/ns/activitystreams#rel

[`as:startTime`]: https://www.w3.org/ns/activitystreams#startTime

[`as:summary`]: https://www.w3.org/ns/activitystreams#summary

[`as:target`]: https://www.w3.org/ns/activitystreams#target

[`as:url`]: https://www.w3.org/ns/activitystreams#url

### Types

Implementations MUST NOT accept `Update` activities trying to change `@id`, and to properties marked as immutable via an
asterisk (`immutableProperty`*).

<dl>

<dt id="Algorithm">Algorithm</dt><dd>

[`fd:Algorithm`]: #Algorithm
An algorithm used to evaluate the result of a vote.

Alternative representations of the algorithm are available at [`as:url`]s that:
* Have a [`as:mediaType`] of `application/ld+json; profile="https://www.w3.org/ns/activitystreams` (and MAY also accept `application/activity+json` and `application/ld+json`).
* Have a [`as:rel`] of `https://www.w3id.org/fep/5a4f#Algorithm`.
* Have an [`as:href`] containing a valid URI ([[RFC-3986]]) using the `https` ([[RFC-2818]]) scheme.
* Function as described [above](#evaluating-votes-via-public-algorithms).

* URI: `https://www.w3id.org/fep/5a4f#Topic`
* Inherits from: [`as:Object`]
* REQUIRED properties: `@id`
* RECOMMENDED properties: [`as:name`] | [`as:summary`] | [`as:url`]

</dd>
<dt id="Topic">Topic</dt><dd>

[`fd:Topic`]: #Topic
The topic of a vote. For example (this sentence is non-normative), an election's subject is to enact a new leader.

* URI: `https://www.w3id.org/fep/5a4f#Topic`
* Inherits from: [`as:Object`]
* REQUIRED properties: `@id` | [`as:summary`] | [`fd:voterCount`]
* RECOMMENDED properties: [`as:name`] | [`fd:voters`]
* Examples:
    * ```json
      {
        "@context": [
          "https://www.w3.org/ns/activitystreams#",
          {
            "fd": "https://www.w3id.org/fep/5a4f#"
          }
        ],
        "@type": "fd:Topic",
        "@id": "https://example.social/profile/42?permission=CREATE_NOTES",
        "summary": "Send messages as Alice on example.social.",
        "voters": "https://example.social/profile/voters?permission=CREATE_NOTES"
      }
      ```

</dd>
<dt id="Vote">Vote</dt><dd>

[`fd:Vote`]: #Vote
A vote on [`fd:topic`] that proposes executing [`as:describes`], affecting [`as:target`].

[`fd:result`] is REQUIRED if [`fd:wasVetoed`] is `true`, or if [`fd:algorithm`] is
not present and [`fd:ended`] is not `null`.

[`fd:ended`] is REQUIRED if [`as:endTime`] has passed, or if [`fd:wasVetoed`] is `true`.

* URI: `https://www.w3id.org/fep/5a4f#Vote`
* Inherits from: [`as:IntransitiveActivity`]
* REQUIRED properties: `@id` | [`as:startTime`]* | [`fd:againstCount`] |
[`fd:allowsEditingResponses`]* | [`fd:allowsNeutralResponses`]* | [`fd:ended`] | [`fd:inFavourCount`] |
[`fd:neutralCount`] | [`fd:topic`]* | [`fd:wasVetoed`]
* RECOMMENDED properties: [`as:summary`] | [`fd:algorithm`]* | [`fd:result`]
* OPTIONAL properties: [`as:describes`]* | [`as:endTime`] | [`as:target`]* | [`fd:against`] | [`fd:inFavour`] |
[`fd:neutral`]
  * Examples:
    * ```json
      {
        "@context": [
          "https://www.w3.org/ns/activitystreams#",
          {
            "fd": "https://www.w3id.org/fep/5a4f#"
          }
        ],
        "@id": "https://example.social/vote/74",
        "@type": "fd:Vote",
        "summary": "Publish a note 'Good Morning, Fediverse!' as Alice on example.social.",
        "describes": {
          "@type": "Create",
          "actor": "https://example.social/profile/42",
          "object": {
            "@type": "Note",
            "content": {
              "@value": "Good Morning, Fediverse!",
              "@language": "en-IL"
            },
            "attributedTo": [
              "https://example.social/profile/42",
              "https://example.social/vote/74"
            ]
          }
        },
        "fd:topic": "https://example.social/profile/42?permission=CREATE_NOTES",
        "fd:algorithm": {
          "@id": "https://example.dev/algorithm/simple",
          "@type": "Link",
          "name": "Example.Dev's Simple Voting Algorithm",
          "summary": "The simplest algorithm possible - returns true if more chose in favour than against."
        },
        "fd:allowsEditingResponses": true,
        "fd:allowsNeutralResponses": true,
        "fd:ended": null,
        "fd:wasVetoed": false,
        "fd:inFavour": "https://example.social/profile/42/voters?permission=CREATE_NOTES&inFavour=74",
        "fd:inFavourCount": 17,
        "fd:neutral": "https://example.social/profile/42/voters?permission=CREATE_NOTES&neutral=74",
        "fd:neutralCount": 6,
        "fd:against": "https://example.social/profile/42/voters?permission=CREATE_NOTES&against=74",
        "fd:againstCount": 3
      }
      ```

</dd>
<dt id="Voter">Voter</dt><dd>

[`fd:Voter`]: #Voter
An object authorized to vote on a [`fd:Topic`].

* URI: `https://www.w3id.org/fep/5a4f#Voter`
* Inherits from: [`as:Object`]
* REQUIRED properties: `@id` | [`fd:topic`]*
* RECOMMENDED properties: [`as:Actor`] | [`as:summary`]
* Examples:
  * ```json
      {
        "@context": [
          "https://www.w3.org/ns/activitystreams#",
          {
            "fd": "https://www.w3id.org/fep/5a4f#"
          }
        ],
        "@type": "fd:Voter",
        "@id": "https://example.social/voter/42",
        "summary": "An anonymous voter on example.social",
        "fd:topic": "https://example.social/profile/42?permission=CREATE_NOTES"
      }
      ```
  * ```json
      {
        "@context": [
          "https://www.w3.org/ns/activitystreams#",
          {
            "fd": "https://www.w3id.org/fep/5a4f#"
          }
        ],
        "@type": "fd:Voter",
        "@id": "https://example.social/voter/35",
        "actor": {
          "@type": "Person",
          "@id": "acct:bob@example.social",
          "summary": "I'm bob - an amazing bob.",
          "name": "The Bob",
          "inbox": "https://example.social/profile/7/inbox",
          "outbox": "https://example.social/profile/7/outbox"
        },
        "fd:topic": "https://example.social/profile/42?permission=CREATE_NOTES"
      }
      ```

</dd>

</dl>

### Properties

<dl>

<dt id="against">against</dt><dd>

[`fd:against`]: #against
An ordered collection of [`fd:Voter`]s that are against this [`fd:Vote`], sorted by when they voted.
This collection MAY not list some or all [`fd:Voter`]s for anonymity purposes.
* URI: `https://www.w3id.org/fep/5a4f#against`
* Domain: [`fd:Vote`]
* Range: [`as:Link`]
* Functional: Yes

</dd>
<dt id="againstCount">againstCount</dt><dd>

[`fd:againstCount`]: #againstCount
The number of [`fd:Voter`]s that are against this [`fd:Vote`].
* URI: `https://www.w3id.org/fep/5a4f#againstCount`
* Domain: [`fd:Vote`]
* Range: `xsd:nonNegativeInteger`
* Functional: Yes

</dd>
<dt id="algorithm">algorithm</dt><dd>

[`fd:algorithm`]: #algorithm
The [`fd:Algorithm`] used to evaluate this [`fd:Vote`], if publicly available.
* URI: `https://www.w3id.org/fep/5a4f#algorithm`
* Domain: [`fd:Vote`]
* Range: [`fd:Algorithm`]
* Functional: Yes

</dd>
<dt id="allowsEditingResponses">allowsEditingResponses</dt><dd>

[`fd:allowsEditingResponses`]: #allowsEditingResponses
Does this [`fd:Vote`] allow responses to be changed?
* URI: `https://www.w3id.org/fep/5a4f#allowsEditingResponses`
* Domain: [`fd:Vote`]
* Range: `xsd:boolean`
* Functional: Yes

</dd>
<dt id="allowsNeutralResponses">allowsNeutralResponses</dt><dd>

[`fd:allowsNeutralResponses`]: #allowsNeutralResponses
Does this [`fd:Vote`] allow neutral responses?
* URI: `https://www.w3id.org/fep/5a4f#allowsNeutralResponses`
* Domain: [`fd:Vote`]
* Range: `xsd:boolean`
* Functional: Yes

</dd>
<dt id="ended">ended</dt><dd>

[`fd:ended`]: #ended
Marks the time a [`fd:Vote`] actually ended at, or `null` if it's still ongoing.
* URI: `https://www.w3id.org/fep/5a4f#ended`
* Domain: [`fd:Vote`]
* Range: `xsd:dateTime` | `null`
* Functional: Yes</li>

</dd>
<dt id="inFavour">inFavour</dt><dd>

[`fd:inFavour`]: #inFavour
An ordered collection of all [`fd:Voter`]s in favour of this [`fd:Vote`], sorted by when they voted.
This collection MAY not list some or all [`fd:Voter`]s for anonymity purposes.
* URI: `https://www.w3id.org/fep/5a4f#inFavour`
* Domain: [`fd:Vote`]
* Range: [`as:Link`]
* Functional: Yes

</dd>
<dt id="inFavourCount">inFavourCount</dt><dd>

[`fd:inFavourCount`]: #inFavourCount
The number of [`fd:Voter`]s that are in favour of this [`fd:Vote`].
* URI: `https://www.w3id.org/fep/5a4f#inFavourCount`
* Domain: [`fd:Vote`]
* Range: `xsd:nonNegativeInteger`
* Functional: Yes

</dd>
<dt id="neutral">neutral</dt><dd>

[`fd:neutral`]: #neutral
An ordered collection of all [`fd:Voter`]s neutral to this [`fd:Vote`], sorted by when they voted.
This collection MAY not list some or all [`fd:Voter`]s for anonymity purposes.
* URI: `https://www.w3id.org/fep/5a4f#neutral`
* Domain: [`fd:Vote`]
* Range: [`as:Link`]
* Functional: Yes

</dd>
<dt id="neutralCount">neutralCount</dt><dd>

[`fd:neutralCount`]: #neutralCount
The number of [`fd:Voter`]s that are neutral to this [`fd:Vote`].
* URI: `https://www.w3id.org/fep/5a4f#neutralCount`
* Domain: [`fd:Vote`]
* Range: `xsd:nonNegativeInteger`
* Functional: Yes

</dd>
<dt id="result">result</dt><dd>

[`fd:result`]: #result
What is the result of this [`fd:Vote`],
or if it hasn't ended yet, what would be its result if it is evaluated using the current data?
* URI: `https://www.w3id.org/fep/5a4f#result`
* Domain: [`fd:Vote`]
* Range: `xsd:boolean`
* Functional: Yes

</dd>
<dt id="topic">topic</dt><dd>

[`fd:topic`]: #topic
The topic of this vote, or that this voter is authorized to vote on.
* URI: `https://www.w3id.org/fep/5a4f#topic`
* Domain: [`fd:Vote`] | [`fd:Voter`]
* Range: [`as:Link`] | [`as:Topic`]
* Functional: Yes

</dd>
<dt id="voter">voter</dt><dd>

[`fd:voter`]: #voter
Identifies a [`fd:Voter`] when responding to a [`fd:Vote`].
* URI: `https://www.w3id.org/fep/5a4f#voter`
* Domain: [`as:Accept`] | [`as:Ignore`] | [`as:Reject`]
* Range: [`as:Link`] | [`as:Voter`]
* Functional: Yes

</dd>
<dt id="voterCount">voterCount</dt><dd>

[`fd:voterCount`]: #voterCount
The number of [`fd:Voter`]s authorized to vote on this [`fd:Topic`].
* URI: `https://www.w3id.org/fep/5a4f#voterCount`
* Domain: [`fd:Topic`]
* Range: [`xsd:nonNegativeInteger`]
* Functional: Yes

</dd>
<dt id="voters">voters</dt><dd>

[`fd:voters`]: #voters
An ordered collection of all [`fd:Voter`]s authorized to vote on this
[`fd:Topic`], sorted by when they were authorized.
* URI: `https://www.w3id.org/fep/5a4f#voters`
* Domain: [`fd:Topic`]
* Range: [`as:Link`]
* Functional: Yes

</dd>
<dt id="wasVetoed">wasVetoed</dt><dd>

[`fd:wasVetoed`]: #wasVetoed
Was this [`fd:Vote`] vetoed?
* URI: `https://www.w3id.org/fep/5a4f#wasVetoed`
* Domain: [`fd:Vote`]
* Range: `xsd:boolean`
* Functional: Yes

</dd>

</dl>

## To-Do
Stuff that this document still needs to improve.
* Vote `UPDATE`s - who's responsible?
* A way to know *when* a `fd:Voter` responded?
* Custom parameters in algorithm discovery?

## References

[ActivityPub]: https://www.w3.org/TR/activitypub/

[ActivityStreams 2.0]: https://www.w3.org/TR/activitystreams-core/

[FEP-6481]: https://www.w3.org/fep/6481

[NodeInfo]: https://nodeinfo.diaspora.software/protocol.html

[RFC-2119]: https://datatracker.ietf.org/doc/html/rfc2119.html

[RFC-2818]: https://datatracker.ietf.org/doc/html/rfc2818.html

[RFC-3986]: https://datatracker.ietf.org/doc/html/rfc3986.html

- [[ActivityPub]], Christine Lemmer-Webber, Jessica Tallon, 2018
- [[ActivityStreams 2.0]], James M. Snell, Evan Prodromou, 2017
- [[NodeInfo] 2.1]
- [[RFC-2119]], S. Bradner, 1997
- [[RFC-2818]], E. Rescorla, RTFM Inc., 2000
- [[RFC-3986]], T. Berners-Lee, W3C/MIT, R. Fielding, Day Software, L. Mesinter, Adobe Systems, 2005 

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and
related or neighboring rights to this work.
