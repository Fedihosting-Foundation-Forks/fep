---
authors: pdxjohnny <johnandersenpdx@gmail.com>
status: DRAFT
dateReceived: 2023-04-18
relatedFeps: FEP-97bb
discussionsTo: https://codeberg.org/fediverse/fep/issues/86
---
# FEP-97bb: Client event listening

**VERY ROUGHT DRAFT**

## Summary

Has anyone played with ActivityPub browser keys added to signature validation set for server-to-server but sent directly from client to server? Would this open up direct client to client federation?

Just do server-to-server from server-to-client so that a client can listen for events associated with their Actor.

OIDC and ephemeral key for signature

## References

- [ActivityPub] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
- https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication 

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
