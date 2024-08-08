---
slug: "c0e0"
authors: silverpill <@silverpill@mitra.social>
status: DRAFT
dateReceived: 2024-08-08
discussionsTo: https://socialhub.activitypub.rocks/t/fep-c0e0-emoji-reactions/4443
---
# FEP-c0e0: Emoji reactions

## Summary

This document describes [ActivityPub] emoji reactions.

## Requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC-2119].

## EmojiReact activity

`EmojiReact` activity is similar to `Like` activity. In addition to standard properties of `Like` activity, it MUST have a `content` property.

Reaction content MUST be either a single unicode grapheme, or a shortcode of a custom emoji. If custom emoji is used, `EmojiReact` activity MUST have a `tag` property containing a single `Emoji` object (which is specified in [Mastodon documentation](https://docs.joinmastodon.org/spec/activitypub/#Emoji)).

Example with unicode emoji:

```json
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/fep/c0e0"
  ],
  "actor": "https://alice.social/users/alice",
  "content": "🔥",
  "id": "https://alice.social/activities/65379d47-b7aa-4ef6-8e4f-41149dda1d2c",
  "object": "https://bob.social/objects/57caeb99-424c-4692-b74f-0a6682050932",
  "to": [
    "https://alice.social/users/alice/followers",
    "https://bob.social/users/bob"
  ],
  "type": "EmojiReact"
}
```

Example with custom emoji:

```json
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/fep/c0e0",
    {
      "toot": "http://joinmastodon.org/ns#",
      "Emoji": "toot:Emoji"
    }
  ],
  "actor": "https://alice.social/users/alice",
  "content": ":blobwtfnotlikethis:",
  "id": "https://alice.social/activities/65379d47-b7aa-4ef6-8e4f-41149dda1d2c",
  "object": "https://bob.social/objects/57caeb99-424c-4692-b74f-0a6682050932",
  "tag": [
    {
      "icon": {
        "mediaType": "image/png",
        "type": "Image",
        "url": "https://alice.social/files/1b0510f2-1fb4-43f5-a399-10053bbd8f0f"
      },
      "id": "https://alice.social/emojis/blobwtfnotlikethis",
      "name": ":blobwtfnotlikethis:",
      "type": "Emoji",
      "updated": "2024-02-07T02:21:46.497Z"
    }
  ],
  "to": [
    "https://alice.social/users/alice/followers",
    "https://bob.social/users/bob"
  ],
  "type": "EmojiReact"
}
```

## Implementation notes

Some existing implementations use `http://litepub.social/ns#EmojiReact` activity type, others use standard `Like` activity with the semantics of `EmojiReact`.

Implementers SHOULD process these activities in the same way as `EmojiReact` activity.

## References

- Christine Lemmer Webber, Jessica Tallon, [ActivityPub][ActivityPub], 2018
- S. Bradner, [Key words for use in RFCs to Indicate Requirement Levels][RFC-2119], 1997

[ActivityPub]: https://www.w3.org/TR/activitypub/
[RFC-2119]: https://tools.ietf.org/html/rfc2119.html

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
