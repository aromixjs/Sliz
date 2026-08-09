export default {
   name: "invalid server syntax",
   expected: "invalid",
   source: String.raw`<server lang="ts">
const = ;
let = 123;
var x = ;
function () {}
const arr = [,];
const obj = {,};
</server>`,
}
