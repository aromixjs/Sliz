export default {
   name: "45 - invalid unfinished attribute string",
   expected: "invalid",
   source: String.raw`<div class="hello></div>`,
}
