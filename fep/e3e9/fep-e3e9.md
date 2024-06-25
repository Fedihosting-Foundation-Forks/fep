---
slug: "e3e9"
authors: Dmitri Zagidulin <@dmitri@social.coop>, bumblefudge <bumblefudge@learningproof.xyz>
status: DRAFT
---
# FEP-e3e9: Actor-Relative URLs

## Summary

> "All problems in computer science can be solved by another level of indirection" (the "fundamental theorem of software engineering")

-- Attributed to: Butler Lampson ([src](https://en.wikipedia.org/wiki/Indirection))

This FEP introduces an ID scheme for ActivityPub objects and collections that
has the following properties:

* IDs remains stable across domain migrations. That is, allows the controller of
  the objects to change object hosting providers without changing the object IDs.
* IDs are regular HTTP(S) URLs that are resolvable via an HTTP `GET` request
  (provided the client allows following `302` redirects).

The proposed mechanism identifies objects by adding query parameters to existing
Actor profile URLs. ActivityPub clients wishing to fetch the objects make an
HTTP `GET` request to this URL, as usual, carrying whatever authentication
mechanism is required currently, and then follow the HTTP `302` status code
redirect in the response to the current storage location of the object.

Example Actor-Relative URL:

`https://alice-personal-site.example/actor?service=storage&relativeRef=/AP/objects/567`

An AP client, encountering an Object ID with this URL makes an HTTP `GET` request
just as it would with any other Object ID:

```http
GET /actor?service=storage&relativeRef=/AP/objects/567 HTTP/1.1
Host: alice-personal-site.example
```

The server responds with a `302` redirect (which all HTTP clients are able
to automatically follow) pointing to the current storage location of the object.
For example:

```http
HTTP/1.1 302 Found
Location: https://storage-provider.example/users/1234/AP/objects/567
```

This redirection mechanism is enabled in all existing HTTP clients by
default, and requires no additional re-tooling of ActivityPub client code.

## Actor-Relative URLs for Objects and Collections

On the Client side, the main change required is in the author/controller validation
procedure (since retrieving the objects at Actor-Relative URLs requires no
additional change beyond ensuring that following HTTP redirects is not disabled).

On the Server side, two changes are required:

* (Data Model change) Adding a `service` section to the Actor profile, which
  is required for author/controller validation.
* (Protocol change) Enabling http `302` redirect responses when an Actor profile
  request is made that has the required query parameters (`service` and
  `relativeRef` params).

In addition:

* (Not required but recommended) Implementing [FEP-8b32: Object Integrity
  Proofs][FEP-8b32] is recommended, since it helps with author/controller
  validation even in the case that the Actor profile host is down or otherwise
  unavailable.

### Validating an Object's Author/Controller

### Client-Side Implementation

### Server-Side Implementation

On the server side (specifically, the server hosting the Actor profile),  

## References

* [FEP-8b32: Object Integrity Proofs][FEP-8b32]

* Christine Lemmer Webber, Jessica Tallon, [ActivityPub][AP], 2018
* S. Bradner, Key words for use in RFCs to Indicate Requirement Levels, 1997

[FEP-8b32]: https://codeberg.org/fediverse/fep/src/branch/main/fep/8b32/fep-8b32.md

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement
Proposal have waived all copyright and related or neighboring rights to this work.
