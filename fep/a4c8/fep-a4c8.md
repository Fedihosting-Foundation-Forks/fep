---
slug: "a4c8"
title: Timeline Preferences
authors: AvidSeeker <avidseeker7@protonmail.com>
discussionsTo: 'https://socialhub.activitypub.rocks/t/4368'
status: DRAFT
dateReceived: 2024-07-15
---

# FEP-a4c8: Timeline Preferences

## Summary

This proposal introduces standardized timeline preferences that are saved by the
server and implemented by the client. These preferences include whether the user
wants algorithmic content enabled, whether to save the last position in the
timeline, and the preferred order of items in the timeline (natural reading).

## Timeline Preferences

The server must support saving and retrieving the following user timeline
preferences, which clients must implement. Example request payload:

```json
{
  "algorithmic_content": true,
  "save_last_position": true,
  "natural_reading_order": true
}
```

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement
Proposal have waived all copyright and related or neighboring rights to this
work.
