export default {
   name: "1 - text outside root",
   expected: "invalid",
   source: String.raw`Text before
<div class="pad:8">Content</div>
Text after`,
}
