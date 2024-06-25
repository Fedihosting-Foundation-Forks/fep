export const tests = [
  await import("./actor-objects-must-express-signing-key-as-assertionMethod-multikey.js").then(m => m.default),
]

export default {
  tests,
}
