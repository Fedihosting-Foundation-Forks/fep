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
HTTP GET /actor?service=storage&relativeRef=/AP/objects/567
Host: alice-personal-site.example
```

And the server responds with a `302` redirect (which all HTTP clients are able
to automatically follow) pointing to the current storage location of the object.
For example:

```HTTP
HTTP 302 Found
Location: https://storage-provider.example/users/1234/AP/objects/567
```

## Actor-Relative URLs for Objects and Collections



## References

* Christine Lemmer Webber, Jessica Tallon, [ActivityPub][AP], 2018
* S. Bradner, Key words for use in RFCs to Indicate Requirement Levels, 1997

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement
Proposal have waived all copyright and related or neighboring rights to this work.
