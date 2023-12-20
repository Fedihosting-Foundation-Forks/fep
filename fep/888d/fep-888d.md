---
slug: "888d"
authors: a <a@trwnh.com>
status: DRAFT
dateReceived: 2023-04-10
discussionsTo: https://codeberg.org/fediverse/fep/issues/83
---

# FEP-888d: Using https://w3id.org/fep as a base for FEP-specific namespaces

## Summary

In JSON-LD, `@id` is used to identify nodes. Each node obect should contain an `@id`, which MUST be an IRI or a compact IRI (including blank node identifiers). It is considered best practice in the linked-data ecosystem to have such IRIs be HTTPS URIs that resolve to a definition of the term being used, and it is desirable to define such terms in a JSON-LD context file that is referenced by its IRI rather than having the full `@context` object embedded in every single document. ActivityStreams 2.0 and ActivityPub do this with the normative context and namespace provided at `https://www.w3.org/ns/activitystreams`, but this namespace is not generally open to extensions or to experimental terms. This FEP therefore proposes using `https://w3id.org/fep` as a base IRI for the FEP process, allowing sub-namespaces for each FEP, and allowing certain terms to be promoted to a default context once proven broadly useful.

## Acknowledgements

(This section is non-normative.)

The core idea behind this FEP is attributed to helge on SocialHub [1]. Specifically, the proposal to register `fep` at the W3ID service is adopted wholesale, with alterations made to the specifics of implementing the redirect mappings using .htaccess rules. These alterations are intended to allow easier sub-namespace allocation for each FEP.

## Requirements

The key words "MUST", "SHOULD", "MAY" are to be interpreted as described in [RFC-2119].

## Introduction

(This section is non-normative.)

The Resource Description Framework (RDF), of which JSON-LD is a serialization, uses URIs to identify nodes on a graph, define properties of those nodes, and create relationships between those nodes. Each statement in RDF represents a fact that is constructed by linking a subject to an object with a predicate; for example, in the statement "Alice knows Bob", the subject `Alice` is related to the object `Bob` by the predicate `knows`. To avoid ambiguity, we can specify a URI for what it means to "know" someone. Such a URI represents a named property or named predicate, and it exists within a namespace, often associated with some ontology or vocabulary. ActivityStreams 2.0 provides and defines the Activity Vocabulary at `https://www.w3.org/ns/activitystreams`, and terms defined within may use either the base IRI `https://www.w3.org/ns/activitystreams#` or the compact IRI `as:`.

For example, we can consider the definition of "Public" addressing within ActivityPub, represented by the `Public` magic collection. When the normative ActivityStreams 2.0 context is applied, the IRI for this collection may be equivalently expressed as `Public`, `as:Public`, or `https://www.w3.org/ns/activitystreams#Public`.

Historically, extension terms within early ActivityPub implementations assumed that those extension terms would be readily adopted within the ActivityStreams namespace, but this did not happen. Currently, terms such as `Hashtag`, `manuallyApprovesFollowers`, `movedTo`, and `sensitive` are manually defined with compact IRIs using the `as:` prefix, in effect making it so that any implementation that wishes to understand these properties and types must manually define those terms as well, in the exact same way.

Later extension terms were defined within vendor-specific namespaces such as `http://joinmastodon.org/ns` or `https://joinpeertube.org/ns`. With the increased adoption of ActivityPub by software projects and the diverse needs of such projects, each project will often define its own vendor-specific namespace to contain its own terms. This has led to a multitude of namespaces and extension terms, which must be cherry-picked as needed by JSON-LD consumers wishing to maintain compatibility. Additionally, some of these terms are defined incorrectly within `@context`, leading to the necessity of compatibility hacks on a per-project basis. Even terms defined correctly may overlap with other terms, and proposed new terms must be parented within a vendor namespace, creating the potential for conflict on which vendor should adopt which term.

The aim of this FEP is to provide a vendor-independent namespace under which extension terms can be defined pursuant to the FEP process and the above problems can be reduced.

## Prior art

(This section is non-normative.)

Within the XMPP ecosystem, the core XMPP specification is defined within an RFC, and further functionality is afforded by the "eXtensible" nature of XMPP. The XMPP Standards Foundation (XSF) maintains the process for stewarding new extensions via XMPP Extension Protocols (XEPs). XML namespacing for such extensions is provided by `urn:xmpp:`, as the XML ecosystem generally prefers using URNs rather than using HTTPS URIs. Such URNs are fully location-independent and not vulnerable to DNS expiry, lapsing, or insolvency. Instead, they are assigned within the authority of the XSF. The XSF maintains an XMPP Registrar and allows XEPs to request and define sub-namespaces beneath `urn:xmpp:`. In exchange, these URNs are not generally dereferencable without a resolver that looks up the URN within the XEP database.

Within the RDF and linked-data ecosystems, there is a strong preference for HTTP or HTTPS URIs, as these can usually be dereferenced via the HTTP protocol for additional information about the subject of the URI. In cases where the URI does not resolve, the URI serves as an identifier not much different than a URN, but with its authority derived from DNS domain rather than from some organizational authority. The reliance on DNS domain creates an issue where the primary domain associated with a group or organization might change. If a previously-used domain is reassigned to a different party, then the new party can mint URIs that accidentally or intentionally conflict with previously-assigned URIs.

To mitigate the DNS authority reassignment issue, trusted intermediary services can maintain a "persistent URL" (PURL) service, which allows assigning identifiers on the intermediary domain that will redirect to some other URI. This layer of indirection allows changing the location of the resource by simply changing the redirect's target. W3ID is one such service, operated by the W3C Permanent Identifier Community Group and available at <https://w3id.org>. At the time of writing this FEP, top-level directory names can be claimed by individuals who submit pull requests to the w3id.org repository on GitHub, and .htaccess files allow redirection based on rewrite rules that transform incoming requests to some other target.

## Specification

### Design goals

Broad design goals for the redirect mapping include:

- Content negotiation for JSON-LD consumers. IRIs SHOULD return machine-friendly context documents or term definitions when requested via the `Accept: application/ld+json` HTTP header, and SHOULD otherwise return human-friendly proposal documents or term definitions by default.
- Sub-namespaces for each FEP. Identifiers for each term SHOULD be allocated within the namespace of the FEP that defines them.
- A top-level context document that contains terms promoted to "common usage" SHOULD be available at the base IRI.

At minimum, the following redirects SHOULD resolve as follows:

- `https://w3id.org/fep`
  - `Accept: *` => the FEP repository or current home page
- `https://w3id.org/fep/(:id)`
  - `Accept: application/ld+json` => a specific FEP's context document
  - `Accept: *` => a specific FEP's proposal document

Additionally, the following redirects MAY resolve:

- `https://w3id.org/fep/(:id)/(:term)`
  - `Accept: application/ld+json` => a specific FEP's context document
  - `Accept: *` => a specific FEP's specific term definition

### Mapping w3id.org/fep to fediverse/fep on Codeberg

At the time of writing this FEP, the Codeberg repository at `https://codeberg.org/fediverse/fep` is used to host FEP-related files, and can similarly be used to host context documents.

#### Example

(This section is non-normative.)

```perl
Header set Access-Control-Allow-Origin *
Header set Access-Control-Allow-Headers DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified$
Options +FollowSymLinks
RewriteEngine on

# catch FEP-specific context requests
RewriteCond %{HTTP_ACCEPT} application/ld\+json
RewriteRule ^([^/\.]*)/?(.*?)?/?$ https://codeberg.org/fediverse/fep/raw/branch/main/fep/$1/context.jsonld [R=302,L]

# catch FEP-specific context requests without content negotiation
RewriteRule ^([^/\.]*)/?(.*?)?.jsonld$ https://codeberg.org/fediverse/fep/raw/branch/main/fep/$1/context.jsonld [R=302,L]

# catch FEP proposal documents
RewriteRule ^([^/\.]*)/?(.*?)?/?$ https://codeberg.org/fediverse/fep/src/branch/main/fep/$1/fep-$1.md [R=302,L]

# a generic catch-all rule
RewriteRule ^(.*?)\/?$ https://codeberg.org/fediverse/fep/raw/branch/main/fep/$1 [R=302,L]
```

### Defining terms associated with an FEP

FEPs that wish to define extension terms within the w3id.org/fep namespace MUST provide a context document co-located within their FEP folder with the filename `context.jsonld` and containing all terms defined by that FEP. The context document MUST include at least an `@id` for each term, with `@type` of `@id` if the term links to another node on the graph. The context document MAY include additional metadata. Once the FEP is marked `FINAL`, the context document MAY be cached forever if referenced. FEPs that define extension terms MAY instead define extension terms within a vendor-specific namespace, but generally this SHOULD NOT be done.

#### Example

(This section is non-normative.)

For example, say we wanted to define the following terms within the current FEP-888d:

- `SomeType` is a term for some type
- `exampleA` is a term with some literal value (string, boolean, number)
- `exampleB` is a term that links to another node on the graph (for example, another object)
- `exampleC` is an ordered list of literal values that are specifically non-negative integers

The context document might look like this, at minimum:

```json
{
	"@context": {
		"SomeType": "https://w3id.org/fep/888d/SomeType",
		"exampleA": "https://w3id.org/fep/888d/exampleA",
		"exampleB": {
			"@id": "https://w3id.org/fep/888d/exampleB",
			"@type": "@id"
		},
		"exampleC": {
			"@id": "https://w3id.org/fep/888d/exampleC",
			"@type": "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
			"@container": "@list"
		}
	}
}
```

Refer to [LD-TERM-DFN] for additional guidance on defining terms within JSON-LD.

#### Defining terms within an FEP document

(This section is non-normative.)

Depending on convenience or preference, the context document might instead look like this, if the terms are defined within the FEP document itself rather than alongside it as assets:

```json
{
	"@context": {
		"SomeType": "https://w3id.org/fep/888d#SomeType",
		"exampleA": "https://w3id.org/fep/888d#exampleA",
		"exampleB": {
			"@id": "https://w3id.org/fep/888d#exampleB",
			"@type": "@id"
		},
		"exampleC": {
			"@id": "https://w3id.org/fep/888d#exampleC",
			"@type": "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
			"@container": "@list"
		}
	}
}
```

In such a case, the FEP document should include an element with an HTML identifier that exactly matches the term name, so that the URI fragment resolves properly. In practice, this means one of the following:

- Using a heading with a name that exactly matches the term name. This should be autolinked correctly by most Markdown processors. Be warned that this may cause problems for FEPs 
- Using a heading with a custom attribute containing an ID. Some Markdown processors such as Goldmark will handle cases such as `### h3 {#custom-identifier}` and render `<h3 id="custom-identifier">h3</h3>`. Markdown specifications such as CommonMark currently do not support custom attributes, but some Markdown processors such as Goldmark support custom attributes on headers (but not on arbitrary elements). See [CM-ATTRS] for more discussion of this feature.
- Using an HTML definition list, with `id` attributes exactly matching the term name. HTML within Markdown files is generally rendered as-is, although it may be sanitized, stripped, or disallowed for security purposes. In cases where it is allowed, however, it can be an effective way to express term definitions within an FEP document.

An example of a definition list can be found below:

<dl>

<dt id="SomeType">SomeType</dt>
<dd>
<p>Some type.</p>
<ul>
<li>URI: <code>https://w3id.org/fep/888d#SomeType</code></li>
<li>Inherits from: <code>https://www.w3.org/ns/activitystreams#Object</code></li>
</ul>
</dd>

<dt id="exampleA">exampleA</dt>
<dd>
<p>A term with some literal value (string, boolean, number).</p>
<ul>
<li>URI: <code>https://w3id.org/fep/888d#exampleA</code></li>
<li>Domain: SomeType</li>
<li>Range: String or Boolean or Number</li>
</ul>
</dd>

<dt id="exampleB">exampleB</dt>
<dd>
<p>A term that links to another node on the graph (for example, another object)</p>
<ul>
<li>URI: <code>https://w3id.org/fep/888d#exampleB</code></li>
<li>Domain: SomeType</li>
<li>Range: Object</li>
</ul>
</dd>

<dt id="exampleC">exampleC</dt>
<dd>
<p>An ordered list of literal values that are specifically non-negative integers</p>
<ul>
<li>URI: <code>https://w3id.org/fep/888d#exampleC</code></li>
<li>Domain: SomeType</li>
<li>Range: <code>http://www.w3.org/2001/XMLSchema#nonNegativeInteger</code></li>
</ul>
</dd>

</dl>

## References

- [ActivityPub] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- [CM-ATTRS] mb21, [Consistent attribute syntax](https://talk.commonmark.org/t/consistent-attribute-syntax/272/), 2014
- [LD-TERM-DFN] Gregg Kellogg, Pierre-Antoine Champin, Dave Longley, [JSON-LD 1.1 - Section 9.15.1 "Expanded term definition"](https://www.w3.org/TR/json-ld/#expanded-term-definition), 2020
- [RFC-2119] S. Bradner, [Key words for use in RFCs to Indicate Requirement Levels](https://tools.ietf.org/html/rfc2119.html)
- [1] helge, [FEP-1570: The FEP Ontology Process](https://socialhub.activitypub.rocks/t/fep-1570-the-fep-ontology-process/2972), 2023

## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication 

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
