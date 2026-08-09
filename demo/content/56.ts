export default {
   name: "56 - wrong closing tag",
   expected: "invalid",
   source: String.raw`<div>
    hello
</span>`,
}
