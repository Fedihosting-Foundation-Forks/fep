# exampleB <https://w3id.org/fep/888d/exampleB>

A property that links to another node on the graph (for example, another object)

Domain
: SomeType <https://w3id.org/fep/888d/SomeType>

Range
: @id

## Example

```json
{
  "@context": "https://w3id.org/fep/888d",
  "@type": "SomeType",
  "exampleA": true,
  "exampleB": "https://example.com/some-object",
  "exampleC": [1, 1]
}
```