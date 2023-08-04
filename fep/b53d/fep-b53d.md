---
slug: "b53d"
authors: Evan Prodromou <evan@prodromou.name>
status: DRAFT
dateReceived: 1970-01-01
---
# FEP-b53d: PhotoDNA Attestation

This proposal outlines a mechanism for sharing PhotoDNA attestations for images in the fediverse.

## Summary

As the fediverse grows, moderators and administrators will need tools to help with moderation. In particular, for child sexual abuse material (CSAM), it is important to be able to detect and remove CSAM from the fediverse.

[PhotoDNA] is a service developed by Dartmouth College and Microsoft that can detect known CSAM images. It is used by many social networks to detect and remove CSAM. Fediverse server software can use PhotoDNA to detect and report CSAM uploaded to the server before it is distributed via [ActivityPub].

Thiel and DiResta [ChildSafety] note that if each recipient servers need to check an incoming message from a sending server, this will cause thousands or even tens of thousands of extraneous calls to PhotoDNA.

Instead, they propose an architecture in which the origin server makes a single call to PhotoDNA, and then relays an attestation to all recipient servers. The recipient server can then check the attestation and decide whether to accept the message, without requiring additional calls to PhotoDNA.

This FEP expands their proposal into an implementable ActivityPub extension.

## Details

### `hash`

The `hash` property is a string containing the hash of the image using the **TBD** algorithm.

### `attestation`

The `attestation` property is a string containing the attestation of the hash using the **TBD** algorithm.

### Origin Server

An origin server SHOULD submit newly-uploaded images to the PhotoDNA service, before distributing relevant activities like `Add` or `Create` to remote servers.

For each image, the origin server SHOULD generate a `hash` property containing the hash of the image using the **TBD** algorithm.

The origin server SHOULD include an `attestation` property containing the attestation of the hash returned by PhotoDNA.

### Recipient Server

A consumer can confirm the attestion by hashing the image file at `url` using the **TBD** algorithm, and comparing the hash to the `hash` property.

If they match, it can then use the `attestation` property to confirm that the hash was attested by the origin server, by checking the signature using the **TBD** algorithm.

Recipient servers that do their own checks of remote content against the PhotoDNA API SHOULD NOT add the `hash` or `attestation` properties when referring to that content.

## Context

The context document for the PhotoDNA extension terms is as follows:

```
{
  "@context": {
    "pdna": "https://purl.archive.org/socialweb/photodna#",
    "hash": {
      "@id": "pdna:hash",
      "@type": "@id"
    },
    "attestation": {
      "@id": "pdna:attestation",
      "@type": "@id"
    }
  }
}
```

The context document is at `https://purl.archive.org/socialweb/photodna`.

## Examples

When a user uploads a single image:

```
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://purl.archive.org/socialweb/photodna"
    ],
    "id": "https://example.com/activities/1",
    "type": "Create",
    "actor": "https://example.com/users/user1",
    "object": {
        "id": "https://example.com/images/1",
        "type": "Image",
        "url": "https://example.com/images/1.jpg",
        "hash": "sha256:2f2d2f2d2f2d2f2d2f2d2f2d2f2d2f2d",
        "attestation": "1234567890"
    }
}
```

When a user updates an image:

```
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://purl.archive.org/socialweb/photodna"
    ],
    "id": "https://example.com/activities/2",
    "type": "Update",
    "actor": "https://example.com/users/user1",
    "object": {
        "id": "https://example.com/images/1",
        "type": "Image",
        "url": "https://example.com/images/1.jpg",
        "hash": "sha256:abcdabcdabcdabcdabcdabcdabcdabcd",
        "attestation": "0987654321"
    }
}
```

When a user posts a `Note` with attached images:

```
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://purl.archive.org/socialweb/photodna"
    ],
    "id": "https://example.com/activities/3",
    "type": "Create",
    "actor": "https://example.com/users/user1",
    "object": {
        "id": "https://example.com/notes/1",
        "type": "Note",
        "content": "Here's are some pictures of my cat.",
        "attachment": [
            {
                "type": "Image",
                "url": "https://example.com/images/4.jpg",
                "hash": "sha256:2f2d2f2d2f2d2f2d2f2d2f2d2f2d2f2d",
                "attestation": "1234567890"
            },
            {
                "type": "Image",
                "url": "https://example.com/images/5.jpg",
                "hash": "sha256:abcdabcdabcdabcdabcdabcdabcdabcd",
                "attestation": "0987654321"
            }
        ]
    }
}
```

When a user adds an image to a collection:

```
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://purl.archive.org/socialweb/photodna"
    ],
    "id": "https://example.com/activities/3",
    "type": "Add",
    "actor": "https://example.com/users/user1",
    "object": {
        "id": "https://example.com/images/1",
        "url": "https://example.com/images/5.jpg",
        "type": "Image",
        "hash": "sha256:2f2d2f2d2f2d2f2d2f2d2f2d2f2d2f2d",
        "attestation": "1234567890"
    },
    "target": {
        "id": "https://example.com/collections/1",
        "type": "Collection"
    }
}
```

A comment on an image. Note that the `inReplyTo` object does not include a `hash` or `attestation` property.

```
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://purl.archive.org/socialweb/photodna"
    ],
    "id": "https://example.com/activities/7",
    "type": "Create",
    "actor": "https://example.com/users/user1",
    "object": {
        "id": "https://example.com/comments/1",
        "type": "Note",
        "content": "What a cute cat!",
        "inReplyTo": {
            "id": "https://remote.example/images/1",
            "url": "https://remote.example/images/5.jpg",
            "type": "Image",
            "name": "My cat",
            "attributedTo": "https://remote.example/users/user3",
        }
    }
}
```

## References

- [ActivityPub] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- [PhotoDNA] Microsoft, [PhotoDNA Cloud Service](https://www.microsoft.com/en-us/PhotoDNA/CloudService), 2023
- [ChildSafety] David Thiel, Renée DiResta, [Child Safety on the Federated Social Web](https://stacks.stanford.edu/file/druid:vb515nd6874/20230724-fediverse-csam-report.pdf), 2023

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
