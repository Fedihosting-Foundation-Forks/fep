---
slug: "c648"
authors: Evan Prodromou <evan@prodromou.name>
status: DRAFT
dateReceived: 2023-06-14
---
# FEP-c648: Blocked Collection

## Summary

Users need to review and revise the list of actors they have blocked. This FEP proposes a new collection property, the Blocked Collection, which contains the actors that a user has blocked.

## History

The [ActivityPub] specification defines a `Block` activity, which is used to block an actor. However, the specification does not define an efficient way to retrieve the list of actors that a user has blocked.

The `liked` property of an actor is a collection of objects that the actor has liked with a `Like` activity. This past-participial naming pattern ('-ed') is extended in this case for objects that are blocked.

## Details

The `blocked` property of an actor is a collection of objects that they have blocked, also known as a 'blocklist'.

The `blocked` property MUST be an `OrderedCollection` or a `Collection`.

Like other collection properties in ActivityPub, the `blocked` collection MUST be sorted in reverse chronological order, with the most recently blocked first.

Each item in the `blocked` collection MUST be unique.

## Context

The context document for the `blocked` property is as follows:

```
{
  "@context": {
    "bl": "https://purl.archive.org/socialweb/blocked#",
    "blocked": {
      "@id": "bl:blocked",
      "@type": "@id"
    }
  }
}
```

## Examples

A publisher can include the `blocked` collection in the properties of an actor.

```
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://purl.archive.org/socialweb/blocked"
    ],
    "id": "https://example.com/evanp",
    "type": "Person",
    "name": "Evan Prodromou",
    "inbox": "https://example.com/evanp/inbox",
    "outbox": "https://example.com/evanp/outbox",
    "following": "https://example.com/evanp/following",
    "followers": "https://example.com/evanp/followers",
    "liked": "https://example.com/evanp/liked",
    "blocked": "https://example.com/evanp/blocked"
}
```

Retrieving the `blocked` collection would provide a list of actors that have been blocked.

```
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://purl.archive.org/socialweb/blocked"
    ],
    "id": "https://example.com/evanp/blocked",
    "type": "OrderedCollection",
    "name": "Evan Prodromou's Blocked Collection",
    "orderedItems": [
        {
            "type": "Person",
            "id": "https://spam.example/spammer",
            "name": "Irritating Spammer"
        },
        {
            "type": "Application",
            "id": "https://alarmclock.example/alarmclock",
            "name": "Badly-Behaved Alarm Clock App"
        }
    ]
}
```

## Security considerations

The `blocked` collection is very sensitive. Actors on the blocked list may be harassing or abusive. If they find themselves on a user's blocklist, they may retaliate against the user. Consequently, the `blocked` collection SHOULD NOT be publicly readable.

By default, implementations SHOULD NOT allow read access to the `blocked` collection to any actor other than the user that owns the collection.

Some users may want to share their blocklist with other actors. Shared blocklists are an important tool for user safety on monolithic social networks and on the social web. Implementations MAY allow a user to share their `blocked` collection with other actors. Implementations SHOULD inform the actor of the risks of sharing their blocklist with the wrong actors.

## Implementations

The [onepage.pub] server implements the `blocked` collection.

## References

- [ActivityPub] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- [onepage.pub] Evan Prodromou, [onepage.pub](https:/github.com/evanp/onepage.pub/), 2023

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
