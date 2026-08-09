export default {
   name: "71 - unclosed template literal",
   expected: "invalid",
   source: String.raw`<server>
const html = \`<div>Hello
</server>`,
}
