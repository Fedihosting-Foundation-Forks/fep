---
authors: silverpill <silverpill@firemail.cc>
status: DRAFT
dateReceived: 2023-05-26
---
# FEP-521a: Representing actor's public keys

## Summary

This proposal describes how to represent public keys associated with [ActivityPub](https://www.w3.org/TR/activitypub/) actors.

## Rationale

Historically, Fediverse services used [publicKey](https://w3c-ccg.github.io/security-vocab/#publicKey) property to represent actor's public key. Implementations usually allow only one key per actor, therefore a new approach is needed to support use cases where additional keys are required.

## Requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC-2119](https://tools.ietf.org/html/rfc2119.html).

## Multikey

Actor's public keys MUST be added as attachments to actor profile. The attachment MUST have `Multikey` type and properties `id`, `controller` and `publicKeyMultibase` as defined in section **2.1.1 Multikey** of [EdDSA Cryptosuite v2022](https://w3c.github.io/vc-di-eddsa/#multikey) specification.

The value of `controller` property MUST match actor ID.

Example:

```json
{
    "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security",
        {
            "fep": "https://w3id.org/fep#",
            "Multikey": "fep:Multikey",
            "publicKeyMultibase": "fep:publicKeyMultibase"
        }
    ],
    "type": "Person",
    "id": "https://server.example/users/alice",
    "inbox": "https://server.example/users/alice/inbox",
    "outbox": "https://server.example/users/alice/outbox",
    "attachment": [
        {
            "id": "https://server.example/users/alice#eddsa-key",
            "type": "Multikey",
            "controller": "https://server.example/users/alice",
            "publicKeyMultibase": "z6MkekwC6R9bj9ErToB7AiZJfyCSDhaZe1UxhDbCqJrhqpS5"
        }
    ]
}
```

## Difference between this proposal and FEP-c390

[FEP-c390](https://codeberg.org/fediverse/fep/src/branch/main/feps/fep-c390.md) describes how to link external identities to ActivityPub actor.

This proposal describes how to represent actor's public keys.

## References

- [ActivityPub] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- [RFC-2119] S. Bradner, [Key words for use in RFCs to Indicate Requirement Levels](https://tools.ietf.org/html/rfc2119.html), 1997
- [EdDSA Cryptosuite v2022] Dave Longley, Manu Sporny, [EdDSA Cryptosuite v2022](https://w3c.github.io/vc-di-eddsa/), 2023

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
