export default {
   name: "wrong closing tag",
   expected: "invalid",
   source: String.raw`<div>
    hello
</span>`,
}
