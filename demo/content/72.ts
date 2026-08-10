export default {
  name: "72 - mismatched quotes attribute",
  expected: "invalid",
  source: String.raw`<div class="hello'></div>`,
};
