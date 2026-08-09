export default {
   name: "invalid unfinished attribute string",
   expected: "invalid",
   source: String.raw`<div class="hello></div>`,
}
