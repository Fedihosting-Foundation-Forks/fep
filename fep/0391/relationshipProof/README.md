# relationshipProof <https://w3id.org/fep/0391/relationshipProof>

Provides proof that the current relationship is reciprocally claimed.

Domain
: Relationship

Range
: Relationship | Add | Follow? | Accept Follow?

Status
: Experimental

Example 1:

```json
{
	"@context": ["https://www.w3.org/ns/activitystreams", "https://w3id.org/fep/0391"],
	"id": "https://example.com/some-relationship",
	"type": "Relationship",
	"attributedTo": "https://example.com/actors/1",
	"subject": {
		"id": "https://example.com/actors/1",
		"following": "https://example.com/actors/1/following"
	},
	"relationship": "IsFollowing",
	"object": {
		"id": "https://example.com/actors/2",
		"followers": "https://example.com/actors/2/followers"
	},
	"relationshipProof": [
		{
			"id": "https://example.com/not-enough-proof",
			"actor": "https://example.com/actors/1",
			"type": "Add",
			"object": "https://example.com/actors/2",
			"target": "https://example.com/actors/1/following"
		},
		{
			"id": "https://example.com/proof-by-inverse-relationship",
			"type": "Relationship",
			"attributedTo": "https://example.com/actors/2",
			"subject": "https://example.com/actors/2",
			"relationship": "IsFollowedBy",
			"object": "https://example.com/actors/1"
		},
		{
			"id": "https://example.com/proof-by-being-added-to-followers",
			"actor": "https://example.com/actors/2",
			"type": "Add",
			"object": "https://example.com/actors/1",
			"target": "https://example.com/actors/2/followers"
		},
		{
			"id": "https://example.com/proof-by-having-follow-accepted",
			"actor": "https://example.com/actors/2",
			"type": "Accept",
			"object": {
				"actor": "https://example.com/actors/1",
				"type": "Follow",
				"object": "https://example.com/actors/2"
			}
		}
	]
}
```

Example 2:

```json
{
	"@context": ["https://www.w3.org/ns/activitystreams", "https://w3id.org/fep/0391"],
	"id": "https://example.com/some-relationship",
	"type": "Relationship",
	"attributedTo": "https://example.com/actors/1",
	"subject": {
		"id": "https://example.com/actors/1",
		"followers": "https://example.com/actors/1/following"
	},
	"relationship": "IsFollowedBy",
	"object": {
		"id": "https://example.com/actors/2",
		"following": "https://example.com/actors/2/followers"
	},
	"relationshipProof": [
		{
			"id": "https://example.com/not-enough-proof",
			"actor": "https://example.com/actors/1",
			"type": "Add",
			"object": "https://example.com/actors/2",
			"target": "https://example.com/actors/1/followers"
		},
		{
			"id": "https://example.com/proof-by-inverse-relationship",
			"type": "Relationship",
			"attributedTo": "https://example.com/actors/2",
			"subject": "https://example.com/actors/2",
			"relationship": "IsFollowing",
			"object": "https://example.com/actors/1"
		},
		{
			"id": "https://example.com/proof-by-being-added-to-following",
			"actor": "https://example.com/actors/2",
			"type": "Add",
			"object": "https://example.com/actors/1",
			"target": "https://example.com/actors/2/following"
		},
		{
			"id": "https://example.com/proof-by-having-follow",
			"actor": "https://example.com/actors/2",
			"type": "Follow",
			"object": "https://example.com/actors/1"
		}
	]
}
```