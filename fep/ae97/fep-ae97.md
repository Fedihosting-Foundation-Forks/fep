---
slug: "ae97"
authors: silverpill <silverpill@firemail.cc>
status: DRAFT
dateReceived: 2023-08-14
discussionsTo: https://codeberg.org/fediverse/fep/issues/148
---
# FEP-ae97: Client-side activity signing

## Summary

Existing Fediverse servers manage signing keys on behalf of their users. This proposal describes a new kind of [ActivityPub](https://www.w3.org/TR/activitypub/) client that lets users sign activities with their own keys, and a server that can distribute client-signed activities to other servers.

## History

Section [4.1 Actor objects](https://www.w3.org/TR/activitypub/#actor-objects) of ActivityPub specification mentions two endpoints, `provideClientKey` and `signClientKey`. The exact interface is [not specified](https://github.com/w3c/activitypub/issues/382), but the purpose of these endpoints is likely similar to the ones described in this proposal.

## Requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC-2119](https://tools.ietf.org/html/rfc2119.html).

## Discovering endpoints

To begin communicating with the server, client MUST discover registration endpoints by sending an HTTP GET request to `/.well-known/activitypub`.

The server MUST respond with a JSON document containing URLs of these endpoints:

- `registerIdentity`: the endpoint required for registering identity.
- `verifyIdentity`: the endpoint required for verifying identity.

Example:

```json
{
  "registerIdentity": "https://server.example/register_identity",
  "verifyIdentity": "https://server.example/verify_identity"
}
```

## Creating an actor

To create an actor, the client MUST send an HTTP POST request to `registerIdentity` endpoint. The body of the request MUST be a JSON document with the following properties:

- `subject`: the identity of the user, in the form of a [Decentralized Identifier](https://www.w3.org/TR/did-core/) (DID).
- `preferredUsername`: the preferred username.

Example:

```json
{
  "subject": "did:key:z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2",
  "preferredUsername": "alice"
}
```

If request is valid, server MUST generate actor ID and return it to the client.

Example:

```json
{
  "id": "https://server.example/users/alice"
}
```

The client MUST create a [FEP-c390](https://codeberg.org/fediverse/fep/src/branch/main/fep/c390/fep-c390.md) identity proof and send it in a POST request to `verifyIdentity` endpoint.

Example:

```json
{
  "type": "VerifiableIdentityStatement",
  "subject": "did:key:z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2",
  "alsoKnownAs": "https://server.example/users/alice",
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-jcs-2022",
    "created": "2023-02-24T23:36:38Z",
    "verificationMethod": "did:key:z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2",
    "proofPurpose": "assertionMethod",
    "proofValue": "z26W7TfJYD9DrGqnem245zNbeCbTwjb8avpduzi1JPhFrwML99CpP6gGXSKSXAcQdpGFBXF4kx7VwtXKhu7VDZJ54"
  }
}
```

If identity proof is valid, the server MUST create a new actor document, and attach provided identity proof to it.

## Sending activities

The client MUST sign all activities by adding [FEP-8b32](https://codeberg.org/fediverse/fep/src/branch/main/fep/8b32/fep-8b32.md) integrity proofs to them. The `verificationMethod` property of integrity proof MUST correspond to the `subject` of one of identity proofs attached to an actor.

Client submits signed activities to actor's outbox. Contrary to what [ActivityPub](https://www.w3.org/TR/activitypub/#client-to-server-interactions) specification prescribes, the server MUST NOT overwrite the ID of activity. Instead of assigning a new ID, the server MUST verify that provided ID has not been used before. If activity ID is an HTTP(S) URI, the server MUST check that its [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) is the same as the server's origin. The server MAY put additional constraints on the structure of activity IDs if necessary.

If activity contains a wrapped object (as in `Create` and `Update` activities), and the object is not transient, it MUST be signed as well. The server MUST validate object IDs in the same way it validates activity IDs.

The server MUST deliver activities to their indended audiences without altering them. Recipients of signed activities (including the actor's server) MUST verify integrity proofs on them. If verification method of the integrity proof doesn't match any of FEP-c390 identity proofs attached to the actor, the activity MUST be rejected.

## Compatibility

To maintain interoperability with existing software, the server MAY generate a private key for each actor to sign Server-To-Server HTTP requests.

If recipient supports FEP-8b32, and both HTTP signature and integrity proof are present, the integrity proof MUST be given precedence over HTTP signature.

## Server independent IDs

**NOTE: this section is scheduled for deletion.**

The idea of server-independent IDs is described in more detail in [FEP-ef61: Portable Objects](https://codeberg.org/fediverse/fep/src/branch/main/fep/ef61/fep-ef61.md).

---

(This section is non-normative.)

Clients may derive object IDs from user's identity, if chosen DID method supports [DID URLs](https://www.w3.org/TR/did-core/#did-url-syntax).

Example:

```json
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/data-integrity/v1"
  ],
  "type": "Create",
  "id": "did:example:123456/actor/c9e7bd01-8bd9-4a8b-99ec-97eb2f7f24ce",
  "object": {
    "type": "Note",
    "id": "did:example:123456/actor/dc505858-08ec-4a80-81dd-e6670fd8c55f",
    "attributedTo": "did:example:123456/actor",
    "inReplyTo": "did:example:987654/actor/f66a006b-fe66-4ca6-9a4c-b292e33712ec",
    "content": "Hello world!",
    "to": "did:example:123456/actor/followers",
    "proof": {
      "type": "DataIntegrityProof",
      "cryptosuite": "eddsa-jcs-2022",
      "created": "2023-02-24T23:36:38Z",
      "verificationMethod": "did:example:123456",
      "proofPurpose": "assertionMethod",
      "proofValue": "..."
    }
  },
  "to": "did:example:123456/actor/followers",
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-jcs-2022",
    "created": "2023-02-24T23:36:38Z",
    "verificationMethod": "did:example:123456",
    "proofPurpose": "assertionMethod",
    "proofValue": "..."
  }
}
```

For generative DID methods such as `did:key` implementers may attach a list of hosts where ID can be resolved using WebFinger as specified in [FEP-4adb](https://codeberg.org/fediverse/fep/src/branch/main/fep/4adb/fep-4adb.md).

Example:

```
did:key:z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2?hosts=server1.example,server2.example
```

This identifier can be looked up using WebFinger:

```json
{
  "subject": "did:key:z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2",
  "links": [
    {
      "rel": "self",
      "type": "application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"",
      "href": "https://server1.example/users/alice"
    }
  ]
}
```

## References

- [ActivityPub] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- [RFC-2119] S. Bradner, [Key words for use in RFCs to Indicate Requirement Levels](https://tools.ietf.org/html/rfc2119.html), 1997
- [Decentralized Identifier] Manu Sporny, Dave Longley, Markus Sabadell, Drummond Reed, Orie Steele, Christopher Allen, [Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-core/), 2022
- [FEP-c390] silverpill, [FEP-c390: Identity Proofs](https://codeberg.org/fediverse/fep/src/branch/main/fep/c390/fep-c390.md), 2022
- [FEP-8b32] silverpill, [FEP-8b32: Object Integrity Proofs](https://codeberg.org/fediverse/fep/src/branch/main/fep/8b32/fep-8b32.md), 2022
- [FEP-4adb] Helge, [FEP-4adb: Dereferencing identifiers with webfinger](https://codeberg.org/fediverse/fep/src/branch/main/fep/4adb/fep-4adb.md), 2023

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
