export default {
   name: "mismatched quotes attribute",
   expected: "invalid",
   source: String.raw`<div class="hello'></div>`,
}
