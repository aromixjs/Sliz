export default {
  name: "68 - nested server",
  expected: "invalid",
  source: String.raw`<script server>
const a = 1;

<script server>
const b = 2;
</script>

const c = 3;
</script>`,
};
