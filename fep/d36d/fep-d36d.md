---
slug: "d36d"
authors: Zack Dunn <zack@tilde.team>
status: DRAFT
dateReceived: 2023-07-01
discussionsTo: https://codeberg.org/fediverse/fep/issues/125
---
# FEP-d36d: Sharing Content Across Federated Forums

## Summary

New instances on the threadiverse (servers that implement ActivityPub with FEP-1b12) are often seeded with forums for common
interests, leading to multiple servers having similar forums. Users may dislike having to follow what they perceive to be
"duplicate" forums or keep up with multiple discussions on the same topic across multiple servers. This document describes a
method for allowing `Group` actors to share content to reduce posting of a single link multiple times, which reduces what users
see as "duplicate" posts and fragmented conversations across multiple forums.

## History

FEP-1b12 introduces federated forums and is implemented by [Lemmy](https://github.com/LemmyNet/lemmy/), [/kbin](https://codeberg.org/Kbin/kbin-core/), and [Friendica](https://github.com/friendica/friendica).

The site [reddit](https://old.reddit.com) has a feature for grouping its forums, called subreddits, into a new forum, called a
multireddit. A multireddit is a feed made up of the combination of each of its constituent subreddits and allows a user an easy
way to keep up with multiple related forums. Because subreddits can be in multiple multireddits, multireddits don't affect
moderation of links posted to individual subreddits and a link can be posted to more than one constituent subreddit within a
multireddit.


## Group to Group Follows

This proposal introduces an interpretation of a Group following another Group and the `gs:unbound` attribute. This allow two groups (or organization) to "act as one" (not exactly, but elaborated afterwards).

This primarily aims at effectively removing a central point of authority for groups, but offers more than that. With this, `@alice@undefinedhackers.net` can mention a group named hackers (!hackers) or even address an activity To `!hackers@instance.gnusocial.test` (C2S) and let her instance's !hackers announce to other instances' !hackers.

Finally, this proposal is general enough to allow a server to simultaneously have `!lug@server` (without links), `!lug-unbound@server` (with the greatest links collection it can grow), and `!lug-with-some-links@server` (with only some links). It doesn't require linked groups to have the same `preferredUsername`.


## Notation and Definitions

To keep things simple, sometimes you will see things formatted like `Activity{Object}`. For example, `Create{Note}` would be a `Create` activity containing a `Note` in the object field.
Also, we will focus in Actor of type `Group`, but nothing should stop from using this for `Organization`.

* `@nickname@server` will be used to refer Actors of type Person or Application.
* `!nickname@server` will be used to refer Actors of type Group or Organization.
* `@#!group@server#collection` will be used to refer collection `collection` of `!group@server`.

The key words MAY, MUST, MUST NOT, SHOULD, and SHOULD NOT are to be interpreted as described in [RFC2119].


### Links between Groups terminology

![Links terminology explained schematically](assets/fep-2100/linksCollection.png)


## ActivityStreams 2.0 requirements for this mechanism


### Example Group Actor in this FEP

```json
{
  "type": "Group",
  "streams": [],
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    {
      "gs": "https://www.gnu.org/software/social/ns#"
    },
    {
      "unbound": {
        "@id": "gs:unbound",
        "@type": "@id"
      }
    }
  ],
  "id": "https://instance.gnusocial.test/group/hackers",
  "unbound": true,
  "preferredUsername": "hackers",
  "endpoints": {
    "sharedInbox": "https://instance.gnusocial.test/inbox.json"
  },
  "inbox": "https://instance.gnusocial.test/group/hackers/inbox.json",
  "outbox": "https://instance.gnusocial.test/group/hackers/outbox.json",
  "following": "https://instance.gnusocial.test/group/hackers/subscriptions",
  "followers": "https://instance.gnusocial.test/group/hackers/subscribers",
}
```


## Creating a link between two group actors

Creating a directed link between two group actors is just a regular Follow request between any two actors.

Assume that `!hackers@instance.gnusocial.test` sends a Follow request to `!lug@gnusocial.net`.

If `gs:unbound: false` or not present, then if `!lug@gnusocial.net` accepts the Follow request, it will Announce{*} entering its inbox to `!hackers@instance.gnusocial.test`.

If `gs:unbound: true`, then `!lug@gnusocial.net` will both accept the Follow request and submit a Follow request of its own to `!hackers@instance.gnusocial.test`.

If both `!hackers@instance.gnusocial.test` and `!lug@gnusocial.net` have added each other to their linksTo, they will act as if they were the same group. If they have equivalent `groupLinks` collections, then they are essentially fully mirrored groups.

_Note_ that the "Link negotiation" happens between two Group actors (S2S).


### Some scenarios


#### 1. Group A follows Group B which has `gs:unbound = false`

- A SHOULD NOT attempt to Follow B;
- If B receives a Follow from A, it SHOULD reject.


#### 2. Group A follows Group B which has `gs:unbound = true`

- A SHOULD send a Follow to B;
- B SHOULD Accept;
- B SHOULD Follow A, if A has `gs:unbound = true`.


#### 3. Group A follows Group B which has no `gs:unbound` attribute

- A SHOULD send a Follow to B;
- B MAY Accept.


#### 4. Forwarding from Inbox

- `!hackers@`**C**: Announce{Note} _TO_ `!hackers@`**[B]** (S2S)
- **B** MUST NOT forward this to other groups. If other groups expect to receive this activity, then they must follow `!hackers@`**C** as well.

#### Rationale

When a moderator of a federated forum determines that their forum overlaps in topic with another forum, they can direct the
`Group` actor to send a `Follow` activity to the other forum's `Group` actor. FEP-1b12 specifices that a group should
automatically respond with an `Accept/Follow`, but this document overrides that for `Follow` activities with an `actor` of type
`Group`. After receiving a `Follow` activity from another `Group`, the group MAY automatically respond with an `Accept/Follow`
or a moderator may instruct the group to reply with a `Reject/Follow`. After replying with a `Accept/Follow` activity, the
group that received the `Follow` activity MAY automatically add the first group to its `following` collection, creating a
symmetric relationship.

This document makes no change to the handling of an `Undo/Follow` activity. If a group receives an `Undo/Follow` from a `Group`
actor, it MAY automatically remove the other group from its `following` collection.


## Activity Handling

When a group receives an activity in its `inbox`, it SHOULD perform automatic validation as described in FEP-1b12. If that
validation includes deduplication (via the `url` property of the activity's `object`, the `url` of any attachements, or any
other method), that deduplication validation MUST include objects received from followed groups. If an activity fails this
deduplication validation, the group MUST respond with a `Reject` activity where the `object` property is the `object` from
the inbox activity and the `target` object is the object that the new object duplicates. This ensures that content is posted
only once across related forums and a forum can provide navigation to an original post when a user tries to post a duplicate.

If the incoming activity is deemed valid, the group MUST handle it according to FEP-1b12 handling of valid activities.

## References
- [FEP-2100]
- [FEP-1b12] Felix Ableitner, [FEP-1b12: Group federation](https://codeberg.org/fediverse/fep/src/branch/main/fep/1b12/fep-1b12.md)
- [ActivityPub] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- [ActivityStreams Vocabulary] James M Snell, Evan Prodromou, [ActivityStreams Vocabulary](https://www.w3.org/TR/activitystreams-vocabulary/#h-modeling-friend-requests), 2017
- [RFC-2119] S. Bradner, [Key words for use in RFCs to Indicate Requirement Levels](https://tools.ietf.org/html/rfc2119.html), 1997


## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or
neighboring rights to this work.

