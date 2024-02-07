---
slug: "e2ce"
authors: aumetra <aumetra@cryptolab.net>, perillamint <perillamint@silicon.moe>
status: DRAFT
dateReceived: 2024-02-02
---

# FEP-e2ce: HTTP Signatures: Implementation and Best Practices


## Summary

<!-- A short summary (no more than 200 words) of the proposal. -->

HTTP signatures are the backbone of proving the authenticity and origin of activities on the Fediverse. Unfortunately they are, at least in the context of the Fediverse, very much underspecified.

This FEP aims to fix this by standardizing the construction of verification of HTTP signatures, as well as defining best practices for developers to follow to avoid common pitfalls which could compromise the integrity of ones dataset.

> This document is intended as a kind of "living standard"; adapting to changes made by the ecosystem and other FEPs

## Cavage HTTP signatures

Validator and Requester MUST support the following standards

* [draft-cavage-http-signatures](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures) for legacy support

### Validation flow

1. Validator receives Cavage signed HTTP request
2. Validator parses Cavage sign and extract public key ID
    a. If Validator already knows the key, go to 4
3. Validator fetches public key by fetching Actor
4. Validator validates hash using public key

Note: For POST request, 3-4 can be executed in the background after returning `HTTP 201`

### Validation rules
Validator MUST reject the request with `HTTP 401` when:

* `Host` header does not match the server's host
* `Date` header contains a timestamp older than 300 seconds.
* `Digest` header does not have a matching hash
* `Signature` header contains non-URI key ID
* `Signature` did not cover `Host`, `Date`, `Digest`

Validator MAY[^2] reject the request with `HTTP 403` when:
* `Signature` header's authority is not allowed to interact with validator
<!-- this may leak block information to a third party. Should we use MUST here? -->
<!-- Potential exploit scenario: -->
<!-- Alice blocks Bob. Chuck wants to know Alice blocked Bob and request Alice with invalid Bob's signature. If server replies 403, Chuck knows Alice blocked bob. -->

<!-- Well, what prevents us from just defining a common HTTP status code for the two cases? Both use either 401 or 403, therefore it's not obtainable by a third party -->

<!-- In this case, server proactively respond with 403 even before validating the signature. -->

<!-- Ah yeah, network observable timing sidechannel -->
<!-- That's hard to solve, since adding random noise to the response is also annoying -->

<!-- What about defining the implementors that they have to return a 202? Then it looks like they just process it in the background -->

<!-- That's one of the solution. Just accept it, but silently discard it. -->
<!-- Make it MAY and made a comment about it -->

Validator MAY[^3] reject the request with `HTTP 401` when:

* `Signature` header has an invalid signature

Validator MUST reject the request with `HTTP 406` when:
* `Signature` header/payload contains invalid algorithm descriptor
* `Digest` header does not have a digest for supported algorithms.

Validator MUST NOT process the request payload when:

* `Signature` header has an invalid signature
* `publicKey` fetch failed for various reasons. [TODO: Link to the `Public key ID constraint` chapter]

### Supported cryptosuites

Compliant implementations MUST support the following signature algorithms:

- Ed25519 (recommended)
- RSA-PKCS#1v1.5-SHA256 (legacy; communication with legacy implementations)

And MUST NOT support the following signature algorithms:

- RSA-PKCS#1v1.5-SHA1 (SHA1 is not secure anymore)

> This list might be expanded or shortened in the future to react to changes in the cryptographic landscape.

Implementers may choose additional signature schemes at their discretion. However, implementations MUST NOT support symmetric algorithms such as HMAC.

---

The reasoning behind explicitly *forbidding* symmetric algorithms is two-fold.

1. Symmetric algorithms are not useful in a setup such as the fediverse where the key has to be public to verify authenticity.
2. There is the potential of key confusion attacks which have plagued standards such as JWT for ages.

Due to these reasons, this FEP explicitly __forbids__ the implementation of symmetric algorithms for ensuring message authenticity.

---

### Rejection reasons and associated HTTP error codes

Implementers may take the table below as a reference to map their internal errors to appropriate HTTP status codes:

| HTTP status code | Reason                |
| ---------------- | --------------------- |
| 406              | Unsupported algorithm |
| 403              | Invalid key ID origin |
| 401              | Invalid signature     |

## Required headers

Requester MUST send a request with the following HTTP headers:

* Host
* Date (or alternatively `(created-at)` pseudo-header) <!-- 
  Is this a definition we want or do we want to simplify this and just ignore that pseudo-headers even exist?
-->
* Signature
* (Request with a body) Content-Type
* (Request with a body) Digest

[TODO Add RFC7230, 7231 reference]

## Security Considerations
Validating the HTTP signature against the Actor public key is a risky operation. Here are common weak points when dealing with Actor key fetching.

### Ensuring key authenticity

#### Exposing the public key

Actor MUST[^1] expose the `publicKey` field as specified in <https://www.w3.org/wiki/SocialCG/ActivityPub/Authentication_Authorization> and <https://w3c-ccg.github.io/security-vocab/#publicKey>.

#### Public key ID constraint

- `publicKey[id]` MUST be a valid URI
- `publicKey[id]` MUST have the same authority as actor `id` 

Compliant Validator MUST reject if an actor's `publicKey[id]` does not meet the criteria.

### RSA key size recommendations

> These checks may already be performed by your cryptography library of choice. We decided to add them here anyway for completeness sake.

Implementations SHOULD NOT use an RSA key smaller than 2048 bits to ensure the authenticity of the signature.

Implementations SHOULD reject any RSA key larger than 8192 bits to protect against DoS attempts through unreasonably large RSA components.

<!-- Should we specify key size limit in here? I mean, RSA-<crazy number> can be used as a DoS vector -->
<!-- RE: Well, technically libraries should have a protection against unreasonable component sizes? At least I think that's something the security audit of the `rsa` crate complained about. But should probably be added anyway -->

<!-- Also, ridiculously small RSA key will be... meaningless, RSA-512 was factored decades ago -->
<!-- RE: Also here, I think that's kind of the job of the crypto library. `ring` rejects anything smaller than 2048 by default (if legacy isn't enabled. If legacy is enabled it disallows everything smaller than 1024). But because OpenSSL is horrible, we should add disclaimers here, too. -->

### Resource exhaustion attack

A malicious Actor can stream massive amounts of data to exhaust the Validator's resources. The Validator may implement an Actor size limit to address this type of attack.

### Inverse Slowloris type DoS attack

A malicious Actor can delay its response to exhaust the Validator's resources. The Validator can fetch the key in the background or utilize asynchronous I/O with reasonable rate limiting to address this attack.

For more information on this type of attack, see [SIF-2023-001](https://advisory.silicon.moe/advisory/sif-2023-001/).

## RFC3230 verification on POST requests

[TODO]

### Supported digests

Implementations MUST support the following digest functions for constructing and verifying the HTTP Digest header.

- SHA-2 (SHA-256 and SHA-512)
- BLAKE2

> This list might be expanded or shortened in the future to react to changes in the cryptographic landscape

<!-- This will be an issue with Pleroma and Akkoma because they just replace the header. But a PR to make it an actual validation doesn't seem to be too hard? -->
<!-- RE: It would be not so hard to implement (actually, I have some experience with elixir), but the biggest problem is, How nasty pleroma / notorious pleroma fork devs are... Just yet another Humanware problem. Or as alternative, we only push patch to Akkoma. In there, Maybe -->
<!-- RE: RE: Yeah, only patching Akkoma seems like an okay way to go. That way we keep ourselves safe from harassment and stay sane while still bringing a non-significant piece of the fediverse in accordance with this proposed standard -->

## Origin validation

[TODO] -> RDF ID equality comparisons

## References

- [ActivityPub] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- [draft-cavage-http-signatures-12] Mark Cavage, Manu Sporny, [draft-cavage-http-signatures-12](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures-12), 2019
- [RFC 3230] J. Mogul, Compaq WRL, A. Van Hoff, Marimba [RFC 3230](https://www.rfc-editor.org/rfc/rfc3230)


## Copyright

This work is licensed under a [CC-BY-SA 4.0 License](https://creativecommons.org/licenses/by-sa/4.0/).

[^1]: For compatibility reasons. Might change in the future.
[^2]: To pretend the user is not blocked, the server can respond with `HTTP 201` for `/inbox` and `HTTP 404` for other `GET` requests.
[^3]: Signature validation comprises two parts: validating payload hash against signature hash and validating signature hash using the public key. The server may return `HTTP 401` when the hash validation fails OR may do the whole validation in the web request.
