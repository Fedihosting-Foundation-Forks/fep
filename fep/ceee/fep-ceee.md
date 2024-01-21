---
slug: "ceee"
authors: Steve Bate <svc-fep@stevebate.net>
status: DRAFT
dateReceived: 2024-01-20
discussionsTo: https://codeberg.org/fediverse/fep/issues/243
---
# FEP-ceee: Instance-Level Actor Discovery using WebFinger

## Summary

Instance-level [ActivityPub] actors support instance-wide functionality rather than representing a user or the software equivalent. This proposal describes how to discover a instance-level actor's URI using [WebFinger].

## Terminology

The term *instance* is not well-defined. For the purposes of this document, an instance is an *origin* [SameOriginPolicy] having the same URL prefix (scheme, host, port). The term does not imply anything about network or software architecture. An instance could consist of many server processes behind a load-balancing reverse proxy. Or, inversely, a single server process could host many instances (multi-tenant architecture).

Some implementations could have multiple actors to support different instance roles (moderation, administration, etc.). In this document, the term *instance-level actor* will be used to describe these kind of actors. The term *Instance Actor* or *Application Actor* is a special, but common, case where there is a single instance-level actor.

NOTE: The standard role and purpose of instance-level actors are not defined here (or elsewhere, at the time of this submission). Several implementations have something they call an Instance Actor or Application Actor, but they may or may not be interoperable since no standard behaviors have been defined at this time.

## Discovery

To discover an instance-level actor's URI, query [WebFinger] with the instance prefix as the resource query parameter.

Example Request:
```
GET /.well-known/webfinger?resource=https://instance.example/
```
Response:
```json
{
    "subject": "https://instance.example/",
    "links": [
        {
            "rel": "https://www.w3.org/ns/activitystreams#Service",
            "type": "application/activity+json",
            "href": "https://instance.example/actor"
        }
    ]
}
```
The `subject` would typically be the resource URI. However, this proposal does not depend on any specific value for `subject`.

The Instance Actor's URI will be the `href` property of a `link` with a `rel` property of `https://www.w3.org/ns/activitystreams#Service` ([W3C AS2 Service Primer][ActivityPubService]). 

A `http://webfinger.net/rel/profile-page` `rel` ([WebFinger Relations][WebFingerRels]) can be used to link to instance metadata (possibly with multiple content types). However, the structure of the target metadata has not been defined at this time. For example, the following links refer to profile data in HTML and JSON-LD formats.

```json
{
    "subject": "https://instance.example/",
    "links": [
        {
            "rel": "https://www.w3.org/ns/activitystreams#Service",
            "type": "application/activity+json",
            "href": "https://instance.example/actor"
        },
        {
            "rel": "http://webfinger.net/rel/profile-page",
            "type": "text/html",
            "href": "https://instance.example/profile"
        },
        {
            "rel": "http://webfinger.net/rel/profile-page",
            "type": "application/ld+json",
            "href": "https://instance.example/profile"
        }
    ]
}
```

If multiple instance-level actor links are returned, the links can be disambiguated by adding metadata to the links using standard [WebFinger] properties. For example, an implementation could have different instance-level actors that serve different purposes. NOTE: The definition of standard instance-level actor roles is outside the scope of this FEP.

```json
{
    "subject": "https://instance.example/",
    "links": [
        {
            "rel": "https://www.w3.org/ns/activitystreams#Service",
            "type": "application/activity+json",
            "href": "https://instance.example/actor",
            "properties": {
              "https://www.w3.org/ns/activitystreams#relationship": "moderation"
            }
        },
        {
            "rel": "https://www.w3.org/ns/activitystreams#Service",
            "type": "application/activity+json",
            "href": "https://instance.example/actor",
            "properties": {
              "https://www.w3.org/ns/activitystreams#relationship": "administration"
            }
        }
    ]
}
```

## Single Actor Instances

A developer of a single-actor (user actor) instance may want that user to have a URI corresponding to the instance prefix although it's not intended to be an instance-level actor. This scenario, which is not expected to be a common one, can be supported by returning multiple links in the [WebFinger] response.

```json
{
    "subject": "https://instance.example/",
    "links": [
        {
            "rel": "https://www.w3.org/ns/activitystreams#Service",
            "type": "application/activity+json",
            "href": "https://instance.example/instance-actor"
        },
        {
            "rel": "self",
            "type": "application/activity+json",
            "href": "https://instance.example/user-actor"
        }
    ]
}
```

If an application is only interested in a the Instance Actor or User Actor specifically, it can use the `rel` query parameter to filter the links, as described in the [WebFinger] specification (if supported by the [Webfinger] service implementation).

For example, to only query the User Actor URI, the query would be:

```
GET /.well-known/webfinger?resource=https://instance.example/&rel=self
```

```json
{
    "subject": "https://instance.example/",
    "links": [
        {
            "rel": "self",
            "type": "application/activity+json",
            "href": "https://instance.example/user-actor"
        }
    ]
}
```

# Implementations

[Mastodon] implements something similar to this proposal. For example,

```
GET /.well-known/webfinger?resource=https://mastodon.social/
Host: https://mastodon.social
```
or using Mastodon account-based URI:
```
GET /.well-known/webfinger?resource=acct:mastodon.social@mastodon.social
Host: https://mastodon.social
```

```json
{
  "subject": "acct:mastodon.social@mastodon.social",
  "aliases": [
    "https://mastodon.social/actor"
  ],
  "links": [
    {
      "rel": "http://webfinger.net/rel/profile-page",
      "type": "text/html",
      "href": "https://mastodon.social/about/more?instance_actor=true"
    },
    {
      "rel": "self",
      "type": "application/activity+json",
      "href": "https://mastodon.social/actor"
    },
    {
      "rel": "http://ostatus.org/schema/1.0/subscribe",
      "template": "https://mastodon.social/authorize_interaction?uri={uri}"
    }
  ]
}
```

Some differences between the Mastodon implementation and this proposal include:

* Mastodon returns the Instance Actor with the same `rel` as a user actor ("self"). 
* It does not support standard [WebFinger] filtering by `rel`.

The `subject` is the Mastodon-specific account URI for the instance-level actor rather than the [ActivityPub] actor URI.

## Related Proposals

[FEP-2677] suggests using [NodeInfo] for a similar purpose. There are several disadvantages of this compared to using [WebFinger].

* Although [WebFinger] is not required by the [ActivityPub] Recommendation, it is required for federation with most ActivityPub-based implementations (e.g., Mastodon and compatible implementations). [NodeInfo] is not required for federation, so requiring it's use for this purpose increases the complexity of federation with no benefits.
* [WebFinger] has been standardized by the Internet Engineering Task Force (IETC). [NodeInfo] is defined informally.
* [WebFinger] is already used to resolve identifiers. [NodeInfo] is primarily used for gathering and aggregating server metadata.
* [FEP-2677] adds a new non-standard `rel` relation to the [NodeInfo] index document. This may have surprising effects on some consuming implementations. This proposal is using [WebFinger] in standard ways.
* Given an [ActivityVocabulary] actor type is being used for the WebFinger `rel` value, a `Service` ([Primer][ActivityPubService]) is the type suggested by the W3C ActivityStreams Primers for this kind of resource rather than `Application` ([Primer][ActivityPubApp]). (Note this is distinct from the type specified in the instance-level actor resource that's linked from WebFinger.)
* [FEP-2677] only defines a singleton instance-level actor. This proposal allows that use case but has more flexibility for advanced implementations.
[FEP-2c59] discusses how to discover [WebFinger] resource URIs from an [ActivityPub] actor resource. This is not related to instance-level actor discovery.

[FEP-4adb] discusses dereferencing identifiers with WebFinger. It's similar to this proposal but not specifically related to discovering instance-level actors.

## References

- Christine Lemmer Webber, Jessica Tallon, [ActivityPub], 2018
- James M Snell, Evan Prodromou, [ActivityStreams Vocabulary][ActivityVocabulary], 2017
- W3C ActivityStreams Primer - [Application type][ActivityPubApp]
- W3C ActivityStreams Primer - [Service type][ActivityPubService]
- Eugen Rochko, [Mastodon], 2016
- Jonne Haß, [NodeInfo 2.1][NodeInfo]
- MDN, [Same-origin Policy][SameOriginPolicy]
- Brad Fitzpatrick, [WebFinger], 2013
- WebFinger\.net [Link Relations][WebFingerRels]

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.

[ActivityPub]: https://www.w3.org/TR/activitypub/ "The ActivityPub protocol is a decentralized social networking protocol based upon the ActivityStreams 2.0 data format. It provides a client to server API for creating, updating and deleting content, as well as a federated server to server API for delivering notifications and content."
[ActivityVocabulary]: https://www.w3.org/TR/activitystreams-vocabulary "This specification describes the Activity vocabulary. It is intended to be used in the context of the ActivityStreams 2.0 format and provides a foundational vocabulary for activity structures, and specific activity types."
[ActivityPubApp]: https://www.w3.org/wiki/Activity_Streams/Primer/Application_type "W3c AS2 Primer for the Application type"
[ActivityPubService]: https://www.w3.org/wiki/Activity_Streams/Primer/Service_type "W3c AS2 Primer for the Service type"
[Mastodon]: https://joinmastodon.org/ "Self-hosted, globally interconnected microblogging software"
[NodeInfo]: http://nodeinfo.diaspora.software/protocol.html "NodeInfo defines a standardized way to expose metadata about an installation of a distributed social network"
[SameOriginPolicy]: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy "The same-origin policy is a critical security mechanism that restricts how a document or script loaded by one origin can interact with a resource from another origin."
[WebFinger]: https://tools.ietf.org/html/rfc7033 "Protocol for discovering information about people or other entities on the Internet using standard HTTP methods"
[WebFingerRels]: https://webfinger.net/rel "WebFinger link relations defined at webfinger.net"
[FEP-2677]: ../2677/fep-2677.md "FEP-2677: Identifying the Application Actor"
[FEP-2c59]: ../2c59/fep-2c59.md "FEP-2c59: Discovery of a Webfinger address from an ActivityPub actor"
[FEP-4adb]: ../4adb/fep-4adb.md "FEP-4adb: Dereferencing identifiers with webfinger"