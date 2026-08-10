export default {
  name: "71 - unclosed template literal",
  expected: "invalid",
  source: String.raw`<script server>
const html = \`<div>Hello
</script>`,
};
