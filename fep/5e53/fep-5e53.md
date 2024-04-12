---
slug: "5e53"
authors: Don Marti <dmarti@zgp.org>
status: DRAFT
dateReceived: 1970-01-01
---
# FEP-5e53: Opt-out Preference Signals


## Summary

Some users have concerns about how their content or personal info is
used. For example, some users do not want the content they created
to be used for training generative AI systems, and some users do
not want to have their personal information shared or sold.

Several opt-out preference signals (OOPSes) have been
standardized or proposed in the form of HTTP headers that can apply to a
connection between a user and a central server.

This FEP extends ActivityPub to support passing OOPSes along with
the content and user information to which they may apply. This FEP
refers to existing OOPSes and does not propose new ones.

FIXME: draw the rest of the owl (see: https://github.com/w3c/activitypub/issues/403#issuecomment-2048056835 )

 * look up JSON-LD properties from a known good FEP and add here

 * research Mastodon namespace (indexable, discoverable) and link if it makes sense

 * research ORDL https://www.w3.org/community/odrl/

 * research OcapPub https://gitlab.com/spritely/ocappub/blob/master/README.org


## References

- Christine Lemmer Webber, Jessica Tallon, [ActivityPub][ActivityPub], 2018
- DeviantArt team, [UPDATE All Deviations Are Opted Out of AI Datasets][noai], 2022
- Google Search Central, [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications][RobotsMeta], undated
- Martijn Koster, [A Standard for Robot Exclusion][RobotExclusion], 1994
- Sebastian Zimmeck, Peter Snyder, Justin Brookman, Aram Zucker-Scharff, [Global Privacy Control][GPC], 2024


[ActivityPub]: https://www.w3.org/TR/activitypub/
[GPC]: https://privacycg.github.io/gpc-spec/
[noai]: https://www.deviantart.com/team/journal/UPDATE-All-Deviations-Are-Opted-Out-of-AI-Datasets-934500371
[RobotExclusion]: http://www.robotstxt.org/robotstxt.html
[RobotsMeta]: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag


## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
