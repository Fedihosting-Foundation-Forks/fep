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

## Implementing Actor-Relative URLs for Objects and Collections

### Actor-Relative URLs

## References

* Christine Lemmer Webber, Jessica Tallon, [ActivityPub][AP], 2018
* S. Bradner, Key words for use in RFCs to Indicate Requirement Levels, 1997

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement
Proposal have waived all copyright and related or neighboring rights to this work.
