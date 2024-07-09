# activitypub-testing-fep-c551

An [activitypub-testing][] test suite that tests for conformance to [FEP-c551: Announce Activity for Migrations and Tombstone Events][FEP-c551].

## Tests

### Actor Object Tombstone Syntax

* [Implementation ECMAScript Module](./fep/c551/fep-c551-actor-object-tombstone-syntax.js)

[activitypub-testing]: https://socialweb.coop/activitypub-testing/
[FEP-c551]: https://codeberg.org/fediverse/fep/src/branch/main/fep/c551/fep-c551.md

## Usage

### test actor `https://socialweb.coop`

Note: this runs the tests in this repo via [a public URL on codeberg.org](https://codeberg.org/socialweb.coop/activitypub-testing-fep-c551/raw/branch/main/fep/c551/fep-c551-actor-object-tombstone-syntax.js).

```shell
⚡ activitypub-testing run test \
    --url="$(data-url fep/c551/fep-c551-actor-object-tombstone-syntax.js)" \
    --input.actor="$(\
      curl https://socialweb.coop \
        --silent \
        -H 'Accept: application/ld+json; profile="https://www.w3.org/ns/activitystreams"' \
    )"
{
  "type": [
    "Assertion"
  ],
  "result": {
    "target": {
      "type": [
        "Organization"
      ],
      "inbox": "https://socialweb.coop/inbox",
      "outbox": "https://socialweb.coop/outbox",
      "followers": {
        "type": "OrderedCollection",
        "orderedItems": []
      },
      "following": {
        "type": "OrderedCollection",
        "orderedItems": []
      },
      "liked": {
        "type": "OrderedCollection",
        "orderedItems": []
      },
      "likes": {
        "type": "OrderedCollection",
        "orderedItems": []
      },
      "shares": {
        "type": "OrderedCollection",
        "orderedItems": []
      },
      "assertionMethod": [
        {
          "@context": "https://w3id.org/security/multikey/v1",
          "id": "did:key:zUC74VC9GKYnLc4q3gKy5Nf4dLZ3oW9u9nKRDg3FoXcVqbXC97xsEheqPMsNV6GPPjGxmMQ4XtHY7F9QDbA18J9TdprNZUwsgqDt3un3TKEymN7Wcbju1tWYz9Sj2uDNQtjLLJv",
          "type": "Multikey",
          "controller": "https://socialweb.coop/",
          "publicKeyMultibase": "zUC74VC9GKYnLc4q3gKy5Nf4dLZ3oW9u9nKRDg3FoXcVqbXC97xsEheqPMsNV6GPPjGxmMQ4XtHY7F9QDbA18J9TdprNZUwsgqDt3un3TKEymN7Wcbju1tWYz9Sj2uDNQtjLLJv"
        }
      ],
      "id": "https://socialweb.coop/",
      "@context": [
        "https://www.w3.org/ns/activitystreams"
      ]
    },
    "result": {
      "outcome": "passed"
    }
  },
  "test": {
    "slug": "fep-c551-actor-object-tombstone-syntax",
    "description": "This rule checks whether a given Actor Object has used valid `movedTo` or `copiedTo` values and exclusively.",
    "name": "Actor Object Tombstone Syntax",
    "id": "urn:uuid:73257c1a-70da-42df-9698-579940c7065a",
    "requirementReference": []
  },
  "input": {
    "actor": "{\n  \"type\": [\n    \"Organization\"\n  ],\n  \"inbox\": \"https://socialweb.coop/inbox\",\n  \"outbox\": \"https://socialweb.coop/outbox\",\n  \"followers\": {\n    \"type\": \"OrderedCollection\",\n    \"orderedItems\": []\n  },\n  \"following\": {\n    \"type\": \"OrderedCollection\",\n    \"orderedItems\": []\n  },\n  \"liked\": {\n    \"type\": \"OrderedCollection\",\n    \"orderedItems\": []\n  },\n  \"likes\": {\n    \"type\": \"OrderedCollection\",\n    \"orderedItems\": []\n  },\n  \"shares\": {\n    \"type\": \"OrderedCollection\",\n    \"orderedItems\": []\n  },\n  \"assertionMethod\": [\n    {\n      \"@context\": \"https://w3id.org/security/multikey/v1\",\n      \"id\": \"did:key:zUC74VC9GKYnLc4q3gKy5Nf4dLZ3oW9u9nKRDg3FoXcVqbXC97xsEheqPMsNV6GPPjGxmMQ4XtHY7F9QDbA18J9TdprNZUwsgqDt3un3TKEymN7Wcbju1tWYz9Sj2uDNQtjLLJv\",\n      \"type\": \"Multikey\",\n      \"controller\": \"https://socialweb.coop/\",\n      \"publicKeyMultibase\": \"zUC74VC9GKYnLc4q3gKy5Nf4dLZ3oW9u9nKRDg3FoXcVqbXC97xsEheqPMsNV6GPPjGxmMQ4XtHY7F9QDbA18J9TdprNZUwsgqDt3un3TKEymN7Wcbju1tWYz9Sj2uDNQtjLLJv\"\n    }\n  ],\n  \"id\": \"https://socialweb.coop/\",\n  \"@context\": [\n    \"https://www.w3.org/ns/activitystreams\"\n  ]\n}"
  },
  "@context": [
    "https://socialweb.coop/ns/testing/context.json",
    "https://www.w3.org/ns/activitystreams"
  ]
}
```

### Running local test files via Data URL

```shell
⚡ activitypub-testing run test \
    --url="$(data-url fep/c551/fep-c551-actor-object-tombstone-syntax.js)" \
    --input.actor="$(\
      curl https://socialweb.coop \
        --silent \
        -H 'Accept: application/ld+json; profile="https://www.w3.org/ns/activitystreams"' \
    )"
```

The `data-url` command is provided by the following shell function:

```shell
data-url() {
  if [ -z "$1" ]; then
    echo "usage: data-url file" >&2
    exit 1
  fi
  mimetype=$(file -bN --mime-type "$1")
  content=$(base64 < "$1")
  echo "data:$mimetype;base64,$content"
}
```
