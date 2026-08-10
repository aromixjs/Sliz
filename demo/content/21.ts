export default {
  name: "21 - invalid server syntax",
  expected: "invalid",
  source: String.raw`<script server lang="ts">
const = ;
let = 123;
var x = ;
function () {}
const arr = [,];
const obj = {,};
</script>`,
};
