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
default (see https://developer.mozilla.org/en-US/docs/Web/API/Request/redirect),
and requires no additional re-tooling of ActivityPub client code.

## Actor-Relative URLs for Objects and Collections

On the Client side, the main change required is in the author/controller validation
procedure (since retrieving the objects at Actor-Relative URLs requires no
additional change beyond ensuring that following HTTP redirects is not disabled).

On the Server side (specifically, the server hosting the Actor profile), two
changes are required:

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

When fetching an ActivityPub Object or Collection identified by an Actor-Relative
URL (that is, when the Object or Collection ID contains the URL query parameters
`service` and `relativeRef`), a client MUST validate that the server hosting
the Object is authorized by the Actor profile:

1. The Client performs an HTTP `GET` request on the Object or Collection, as
   usual, including any currently required authorization headers.
2. The client performing the `GET` request MUST be able to support HTTP
   redirection. For example, if using the WHATWG `fetch` API, the request's
   `redirect` property cannot be set to `error`.
3. The Client follows the redirect and automatically fetches the object specified
   in the `Location` header of the `302` response (this behavior is the default
   in most HTTP clients).
4. The Client extracts the _current URL_ of the Object. This is the URL specified
   in the `Location` header of the redirect response; for example, if using
   the WHATWG `fetch` API, this is the last URL in the response's URL list,
   retrievable by accessing `response.url`.
5. The Client retrieves the Actor profile corresponding to this Object's author/
   controller (the `actor` or `attributedTo` property).
6. The Client extracts the value of the _authorized storage endpoint_ from the
   profile:

    a. The Client checks to see if the Actor profile contains the `service`
       property.
    b. If the `service` property is found, the Client searches through the
       array of service endpoints until it finds a service endpoint with the
       relative id ending in `#storage` (note: this is what the `service=storage`
       query parameter refers to, in the Actor-Relative URL). The Client extracts
       the `serviceEndpoint` property of this service description object.
       This is the _authorized storage endpoint_.
    c. If no _authorized storage endpoint_ is specified in the Actor profile
       (that is, if the Actor profile does not contain the `service` property,
       or if the `service` property is `null` or an empty array, or if the
       `service` array does not contain a service endpoint object with a relative
       `id` that ends in `#storage`, or if that service endpoint does not contain
       a `serviceEndpoint` property containing a URL), the Client SHOULD
       indicate to the user that the provenance of this Object cannot be determined,
       or that the storage location of the Object has not been authorized by
       the profile of the claimed author/controller.

7. The Client MUST validate that the _current URL_ of the object is authorized
   by the Actor's profile by checking that:

    a. The Object's _currentURL_ starts with the value of the _authorized storage
       endpoint_.
    b. The Object's _currentURL_ ends with the value of the `relativeRef` query
       parameter.
    c. For example, in JS pseudocode, using string concatenation:
       `response.url === (authorizedStorageEndpoint + query.relativeRef)`
    d. If these checks fail (if the _current URL_ of the object is not equal to
       the string concatenation of the _authorized storage endpoint_ and the
       `relativeRef` query parameter),  the Client SHOULD
       indicate to the user that the provenance of this Object cannot be determined,
       or that the storage location of the Object has not been authorized by
       the profile of the claimed author/controller.

This validation procedure establishes a two-way link: from the Object to its
author/controller Actor profile (via the Object's `actor` or `attributedTo`
property), and from the Actor profile to the authorized storage service provider,
at whose domain the Object is currently stored.

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
