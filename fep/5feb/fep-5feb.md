---
slug: "5feb"
authors: Claire <claire.fep-1d7d@sitedethib.com>
status: DRAFT
dateReceived: 2023-09-06
discussionsTo: https://codeberg.org/fediverse/fep/issues/154
---
# FEP-5feb: Search indexing consent for actors

## Summary

This FEP introduces an actor-level attribute that can be used to explicitly express an actor's consent (or lack thereof) to their public objects being indexed for search purposes.

Akin to `robots.txt` and `noindex` meta tags, this attribute is advisory and relies on the indexers respecting the directive, as public objects can not technically be prevented from being indexed.

## Requirements

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this specification are to be interpreted as described in [RFC-2119].

## Specifying search indexing consent at the actor-level

Actors can use the `indexable` (`http://joinmastodon.org/ns#indexable`) attribute to specify whether they consent to their public objects being indexed for search or not.

A missing `indexable` attribute SHOULD be handled as `indexable: false`.

### Example

```json
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    {
      "toot":"http://joinmastodon.org/ns#",
      "indexable":"toot:indexable",
    }
  ],
  "id": "https://example.com/users/1",
  "type":"Person",
  "inbox": "https://example.com/users/1/inbox",
  "outbox": "https://example.com/users/1/outbox",
  "preferredUsername": "bob",
  "indexable": true
}
```

### Searchable objects

Objects authored by an actor with `indexable: true` and addressed `to` the `as:Public` special collection SHOULD be made available for search.

Objects authored by an actor with `indexable: false` MUST NOT be made available for search to other users unless they were previously displayed and interacted with (e.g. it is allowed for a user to search posts they have bookmarked).

### Handling updates to the `indexable` attribute

Whenever an actor is updated and its attribute is set to `indexable: true`, its objects SHOULD be made available for search as described in the previous section.

Whenever an actor is updated and its attribute is set to `indexable: false`, its objects MUST be removed from search as described in the previous section.

## Security considerations

Considering this attribute is purely advisory, special care SHOULD be given to the user interface to make sure users are not made to believe the attribute will ensure they never get indexed.

## Implementations

- Mastodon, as of v4.2.0

## References

- [RFC-2119] S. Bradner, [Key words for use in RFCs to Indicate Requirement Levels](https://tools.ietf.org/html/rfc2119.html)

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication 

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
