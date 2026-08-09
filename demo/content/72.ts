export default {
   name: "unclosed template literal",
   expected: "invalid",
   source: String.raw`<server>
const html = \`<div>Hello
</server>`,
}
