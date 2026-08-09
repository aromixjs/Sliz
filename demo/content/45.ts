export default {
   name: "invalid style block",
   expected: "invalid",
   source: String.raw`<style>
body {
    color: red;
`,
}
