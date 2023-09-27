---
slug: "dc88"
authors: Calvin Lee <pounce@integraldoma.in>
status: DRAFT
dateReceived: 2023-09-12
discussionsTo: https://codeberg.org/fediverse/fep/issues/161
---
# FEP-dc88: Formatting Mathematics


## Summary

This FEP recommends a method for formatting mathematics in ActivityPub
post content in [MathML Core]. Furthermore, this FEP describes how to
sanitize and convert such mathematics to plain text if an
implementation does not wish to support mathematical formatting.


## Requirements

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”,
“SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this
specification are to be interpreted as described in [RFC-2119].

“The implementation” is to be interpreted as an ActivityPub conformant
Client, as described in [ActivityPub] which wishes to produce or consume
mathematically formatted content.

“MathML Core Elements” are to be interpreted as defined in [MathML
Core], excluding the top-level `<math>` element.


## History

Written mathematics depends very heavily on a system of notation which
has been continuously evolving over thousands of years. Despite its
ubiquity, mathematical notation is anything but constant. Mathematicians
rely heavily on complicated typesetting systems such as [LaTeX] to
layout text in their desired fashion.

Several fediverse instances, such as [Mathstodon] have emerged to host
discussion related to mathematics. This is to no small part due to the
difficulty of conveying and formatting mathematical text, and many
provide their own typesetting implementation based on [LaTeX]. However,
rendering TeX-like formats is expensive and fraught with issues due to
security and implementation-specific quirks. This has resulted in
multiple instances with incompatible TeX-like implementations.

In recent years, [MathML Core] has become standardized by all major web
browsers, and offers an alternative method to communicate mathematics
between differing fediverse implementations that is compatible with the
ActivityPub standard.

However, not all fediverse software displays content in a web browser
(mobile clients), some need to convert to an internal representation
(Misskey descendants) and others wish to display content only in
a plain-text form (Mastodon). This necessitates a solution that is
*round-trippable*, i.e. mathematics should be convertible to and from
a display language and a semantic language as needed.

## Formatting Mathematics

The implementation MAY produce mathematical formatting in the
`summary` or `content` properties of [ActivityStreams] objects, as
defined in [Activity Vocabulary] if the `mediaType` is `text/HTML`. This
formatting MUST be placed within one or more top-level `<math>`
elements, hereon referred to as 'a math element'.

A math element MUST contain one `<semantics>` child element, and no
other children. The `<semantics>` element MUST contain a [MathML Core]
expression as its first child, and at least one `<annotation>` element.
The `encoding` property of this `<annotation>` element SHOULD be
`"application/x-tex"`, but MAY be `"text/plain"`, and MUST contain
a plain-text description of the mathematics—preferably in the authored
format. The implementation MAY include additional `<annotation>` or
`<annotation-xml>` elements with other semantic information.

The implementation MUST NOT include delimiters used to denote
mathematical text in the `<annotation>` element. For example, if the
user authors `$x+y$`, the resulting annotation node should be
```html
<annotation encoding="application/x-tex">x+y</annotation>
```

All elements contained within a math element MUST be MathML Core
Elements, excluding those contained within an `<annotation-xml>`
element.

## Sanitizing Mathematically Formatted Text

An implementation SHOULD sanitize incoming mathematical formatting
before displaying it to a user. An implementation may either sanitize
a math element by removing formatting, or completely replace it with an
alternative representation.


### Sanitizing a math element

The implementation SHOULD sanitize a math element before displaying it
to a user. If a math element is not formatted as described in [Formatting
Mathematics], then the implementation MUST remove it completely.

The implementation SHALL NOT remove any [Semantic Attributes] or MathML
Core Elements from a math element. However, an implementation MAY remove
a math element and all children, as described below.

### Replacing a math element with an alternative representation

#### Plain-text

The implementation MAY remove a math element completely, and replace it
with text within the `<annotation>` element with encoding
`"application/x-tex"` as described in [Formatting Mathematics] and
SHOULD fall back to a `"text/plain"` annotation.

The implementation MAY surround the text with a pair of delimiters. For
example, if a math element has the attribute `display="block"`, it may
choose the delimiters `\[` and `\]`, and if `display="inline"` it
may choose `$` and `$` to match the TeX typesetting system.

#### Alternative representations

The implementation MAY extract a TeX representation of the mathematics
from the `<annotation>` element with encoding `"application/x-tex"` as
described in [Formatting Mathematics]. The implementation may utilize
the TeX representation to render mathematics using an alternative
method, such as [KaTeX] (for older browsers).

## Examples
```json
{"@context": ["https://www.w3.org/ns/activitystreams", {"@language": "en"}],
 "type": "Note",
 "id": "http://postparty.example/p/2415",
 "content": "I have a truly marvelous proof that
             <math>
              <semantics>
                <mrow>
                  <msup><mi>x</mi><mi>n</mi></msup>
                  <mo>+</mo>
                  <msup><mi>y</mi><mi>n</mi></msup>
                  <mo>≠</mo>
                  <msup><mi>z</mi><mi>n</mi></msup>
                </mrow>
                <annotation encoding=\"application/x-tex\">x^n+y^n\\ne z^n</annotation>
              </semantics>
             </math>
           which this note is too small to contain!",
  "source": {
    "content": "I have a truly marvelous proof that \\(x^n+y^n\\ne z^n\\) which this note is too small to contain!",
    "mediaType": "text/markdown+math"}}
```

This object's source content represents a valid sanitation of its
`content` field.


## Semantic Attributes

The following attributes have semantic information that is important
when reading mathematics for the associated elements and attribute
values. These attributes MUST be preserved when performing sanitation of
a math element.

| Element   | Attributes                    | Values           |
| -------   | ------------                  | ---------------- |
| all       | `mathvariant`                 | `normal`         |
| all       | `displaystyle`, `scriptlevel` | all              |
| `<math>`  | `display`                     | all              |
| `<mfrac>` | `linethickness`               | `0`, `1`         |
| `<mspace>`| `width`, `height`, `depth`    | all              |
| `<mo>`    | `form` `stretchy`, `symmetric`, `largeop`, `movablelimits`, `lspace`, `rspace`, `minsize`, | all              |

## Implementations

* [FoundKey](https://akkoma.dev/FoundKeyGang/FoundKey), [accepting math](https://akkoma.dev/FoundKeyGang/FoundKey/commit/2fcea248179a4fa2a387cf6e523f7a9fc1a56dd5), [authoring math](https://akkoma.dev/FoundKeyGang/FoundKey/commit/f6c3d442655931533d5ec52e6515275a3e10a2b2)

## References

- [ActivityPub] Christine Lemmer Webber, Jessica Tallon, [ActivityPub](https://www.w3.org/TR/activitypub/), 2018
- [ActivityStreams] James M Snell, Evan Prodromou, [ActivityStreams 2.0](https://www.w3.org/TR/activitystreams-core), 2017
- [Activity Vocabulary] James M Snell, Evan Prodromou, [Activity Vocabulary](https://www.w3.org/TR/activitystreams-vocabulary/), 2017
- [LaTeX] LaTeX authors, [The LaTeX Project](https://www.latex-project.org), retrieved 2023
- [MathML Core] David Carlisle, Frédéric Wang, [MathML Core W3C Candidate Reccomendation Snapshot](https://w3c.github.io/mathml-core/), 2023
- [Mathstodon] Mathstodon Admins, [About Mathstodon](https://mathstodon.xyz/about), retrieved 2023
- [RFC-2119] S. Bradner, [Key words for use in RFCs to Indicate Requirement Levels](https://datatracker.ietf.org/doc/html/rfc2119), 1997
- [KaTeX] Emily Eisenberg, Sophie Alpert et al. [KaTeX: The fastest math typesetting library for the web.](https://katex.org/), retrieved 2023


## Copyright

CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

To the extent possible under law, the authors of this Fediverse Enhancement Proposal have waived all copyright and related or neighboring rights to this work.
