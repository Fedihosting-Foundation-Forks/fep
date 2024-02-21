---
slug: "5a4f"
authors: Laxystem <the@laxla.quest>
status: DRAFT
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
To use an extension of this FEP, implementations MUST declare so in their nodeinfo, as defined by FEP-TODO.

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

One may respond to a [`fd:Vote`] by `PUT`ting an `Accept`, `Ignore` 
or `Reject` activity (standing for in favour, neutral, and against, respectively) into its `@id`.

Vote responses MUST have the `fd:voter` property.

If the [`fd:allowsEditingResponses`] property is `true`,
another response made by the same `fd:Voter` will replace the previous one.
Otherwise, the receiving server MUST respond with 405 Method Not Allowed.


If a server receives a response to a vote whose [`fd:ended`] is not `null`, it MUST respond with 405 Method Not Allowed.

If a response was received successfully, the server MUST respond with 202 Accepted
(if the receiving server hasn't updated the cached [`fd:result`], if any) or 204 No Content.

### Evaluating Votes via Public Algorithms

Votes may use a public algorithm to be evaluated,
to allow validation of the vote's results, and to ensure consistency.

If the [`fd:algorithm`](#algorithm) property is present,
the vote MUST be evaluated by sending a `GET` request to its value, with one of the following query parameter lists:

* By vote.
    * `vote`, containing the `@id` of the vote to be evaluated.
* Manually.
    * `voterCount` - the number of voters authorized to [`fd:topic`](#topic)
    * `inFavour` - the number of voters that have responded in favour to this vote.
    * `against` - the number of voters that have responded against to this vote.
    * `neutral` - the number of voters that have responded neutrally to this vote. Defaults to zero.
    * Any other parameter required by this algorithm.
* If no parameters are provided, then a [`as:Link`](https://www.w3.org/ns/activitystreams#Link) to this algorithm MUST
  be returned instead.

The algorithm will return a shortened version of the same `fd:Vote` object, only with an `@id` and a `result`.
Alternatively, the algorithm may return an HTTP error code with an empty body.

Algorithms MUST return the same results for the same data.

### Discovering Algorithms

This FEP defines an extension to [[NodeInfo]] at `.well-known/nodeinfo`,
providing the `https://www.w3id.org/fep/5a4f#Algorithm` relation, for example:

```json
{
  "links": [
    {
      "rel": "https://www.w3id.org/fep/5a4f#algorithm",
      "href": "https://example.social/api/fep/54af/algorithms"
    }
  ]
}
```

This link must return a JsonLD document containing at least one [`as:Link`].

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

[`as:name`]: https://www.w3.org/ns/activitystreams#name

[`as:startTime`]: https://www.w3.org/ns/activitystreams#startTime

[`as:summary`]: https://www.w3.org/ns/activitystreams#summary

[`as:target`]: https://www.w3.org/ns/activitystreams#target

### Types

Implementations MUST NOT accept `Update` activities trying to change properties marked as immutable via an
asterisk (`immutableProperty`*).

<dl>

<dt id="Topic">Topic</dt><dd>

[`fd:Topic`]: #Topic
The topic of a vote. For example (this sentence is non-normative), an election's subject is to enact a new leader.

* URI: `https://w3id.org/fep/5a4f#Topic`
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

* URI: `https://w3id.org/fep/5a4f#Vote`
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
      "@type": "fd:Vote",
      "@id": "https://example.social/vote/74",
      "fd:topic": "https://example.social/profile/42?permission=CREATE_NOTES",
      "fd:inFavourCount": 17,
      "fd:neutralCount": 6,
      "fd:againstCount": 3,
      "fd:inFavour": "https://example.social/profile/42/voters?permission=CREATE_NOTES&inFavour=74",
      "fd:neutral": "https://example.social/profile/42/voters?permission=CREATE_NOTES&neutral=74",
      "fd:against": "https://example.social/profile/42/voters?permission=CREATE_NOTES&against=74",
      "fd:wasVetoed": false,
      "fd:ended": null,
      "fd:allowsNeutralResponses": true,
      "fd:allowsEditingResponses": true,
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
          "attributedTo": [ "https://example.social/profile/42", "https://example.social/vote/74" ]
        }
      }
    }
    ```

</dd>
<dt id="Voter">Voter</dt><dd>

[`fd:Voter`]: #Voter
An object authorized to vote on a [`fd:Topic`].

* URI: `https://w3id.org/fep/5a4f#Voter`
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
* URI: `https://w3id.org/fep/5a4f#against`
* Domain: [`fd:Vote`]
* Range: [`as:Link`]
* Functional: Yes

</dd>
<dt id="againstCount">againstCount</dt><dd>

[`fd:againstCount`]: #againstCount
The number of [`fd:Voter`]s that are against this [`fd:Vote`].
* URI: `https://w3id.org/fep/5a4f#againstCount`
* Domain: [`fd:Vote`]
* Range: `xsd:nonNegativeInteger`
* Functional: Yes

</dd>
<dt id="algorithm">algorithm</dt><dd>

[`fd:algorithm`]: #algorithm
The algorithm used to evaluate this [`fd:Vote`], if publicly available.
* URI: `https://w3id.org/fep/5a4f#algorithm`
* Domain: [`fd:Vote`]
* Range: [`as:Link`]
* Functional: Yes

</dd>
<dt id="allowsEditingResponses">allowsEditingResponses</dt><dd>

[`fd:allowsEditingResponses`]: #allowsEditingResponses
Does this [`fd:Vote`] allow responses to be changed?
* URI: `https://w3id.org/fep/5a4f#allowsEditingResponses`
* Domain: [`fd:Vote`]
* Range: `xsd:boolean`
* Functional: Yes

</dd>
<dt id="allowsNeutralResponses">allowsNeutralResponses</dt><dd>

[`fd:allowsNeutralResponses`]: #allowsNeutralResponses
Does this [`fd:Vote`] allow neutral responses?
* URI: `https://w3id.org/fep/5a4f#allowsNeutralResponses`
* Domain: [`fd:Vote`]
* Range: `xsd:boolean`
* Functional: Yes

</dd>
<dt id="ended">ended</dt><dd>

[`fd:ended`]: #ended
Marks the time a [`fd:Vote`] actually ended at, or `null` if it's still ongoing.
* URI: `https://w3id.org/fep/5a4f#ended`
* Domain: [`fd:Vote`]
* Range: `xsd:dateTime` | `null`
* Functional: Yes</li>

</dd>
<dt id="inFavour">inFavour</dt><dd>

[`fd:inFavour`]: #inFavour
An ordered collection of all [`fd:Voter`]s in favour of this [`fd:Vote`], sorted by when they voted.
This collection MAY not list some or all [`fd:Voter`]s for anonymity purposes.
* URI: `https://w3id.org/fep/5a4f#inFavour`
* Domain: [`fd:Vote`]
* Range: [`as:Link`]
* Functional: Yes

</dd>
<dt id="inFavourCount">inFavourCount</dt><dd>

[`fd:inFavourCount`]: #inFavourCount
The number of [`fd:Voter`]s that are in favour of this [`fd:Vote`].
* URI: `https://w3id.org/fep/5a4f#inFavourCount`
* Domain: [`fd:Vote`]
* Range: `xsd:nonNegativeInteger`
* Functional: Yes

</dd>
<dt id="neutral">neutral</dt><dd>

[`fd:neutral`]: #neutral
An ordered collection of all [`fd:Voter`]s neutral to this [`fd:Vote`], sorted by when they voted.
This collection MAY not list some or all [`fd:Voter`]s for anonymity purposes.
* URI: `https://w3id.org/fep/5a4f#neutral`
* Domain: [`fd:Vote`]
* Range: [`as:Link`]
* Functional: Yes

</dd>
<dt id="neutralCount">neutralCount</dt><dd>

[`fd:neutralCount`]: #neutralCount
The number of [`fd:Voter`]s that are neutral to this [`fd:Vote`].
* URI: `https://w3id.org/fep/5a4f#neutralCount`
* Domain: [`fd:Vote`]
* Range: `xsd:nonNegativeInteger`
* Functional: Yes

</dd>
<dt id="result">result</dt><dd>

[`fd:result`]: #result
What is the result of this [`fd:Vote`],
or if it hasn't ended yet, what would be its result if it is evaluated using the current data?
* URI: `https://w3id.org/fep/5a4f#result`
* Domain: [`fd:Vote`]
* Range: `xsd:boolean`
* Functional: Yes

</dd>
<dt id="topic">topic</dt><dd>

[`fd:topic`]: #topic
The topic of this vote, or that this voter is authorized to vote on.
* URI: `https://w3id.org/fep/5a4f#topic`
* Domain: [`fd:Vote`] | [`fd:Voter`]
* Range: [`as:Link`] | [`as:Topic`]
* Functional: Yes

</dd>
<dt id="voter">voter</dt><dd>

[`fd:voter`]: #voter
Identifies a [`fd:Voter`] when responding to a [`fd:Vote`].
* URI: `https://w3id.org/fep/5a4f#voter`
* Domain: [`as:Accept`] | [`as:Ignore`] | [`as:Reject`]
* Range: [`as:Link`] | [`as:Voter`]
* Functional: Yes

</dd>
<dt id="voterCount">voterCount</dt><dd>

[`fd:voterCount`]: #voterCount
The number of [`fd:Voter`]s authorized to vote on this [`fd:Topic`].
* URI: `https://w3id.org/fep/5a4f#voterCount`
* Domain: [`fd:Topic`]
* Range: [`xsd:nonNegativeInteger`]
* Functional: Yes

</dd>
<dt id="voters">voters</dt><dd>

[`fd:voters`]: #voters
An ordered collection of all [`fd:Voter`]s authorized to vote on this
[`fd:Topic`], sorted by when they were authorized.
* URI: `https://w3id.org/fep/5a4f#voters`
* Domain: [`fd:Topic`]
* Range: [`as:Link`]
* Functional: Yes

</dd>
<dt id="wasVetoed">wasVetoed</dt><dd>

[`fd:wasVetoed`]: #wasVetoed
Was this [`fd:Vote`] vetoed?
* URI: `https://w3id.org/fep/5a4f#wasVetoed`
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
* Find or create an FEP that specifies list of implemented FEPs in nodeinfo for extension purposes.

## References

[ActivityPub]: https://www.w3.org/TR/activitypub/

[ActivityStreams 2.0]: https://www.w3.org/TR/activitystreams-core/

[NodeInfo]: https://nodeinfo.diaspora.software/protocol.html

[RFC-2119]: https://datatracker.ietf.org/doc/html/rfc2119.html

- [[ActivityPub]], Christine Lemmer-Webber, Jessica Tallon, 2018
- [[ActivityStreams 2.0]], James M. Snell, Evan Prodromou, 2017
- [[NodeInfo] 2.1]
- [[RFC-2119]], S. Bradner, 1997

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and
related or neighboring rights to this work.
