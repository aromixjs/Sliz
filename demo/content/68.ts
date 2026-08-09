export default {
   name: "68 - nested server",
   expected: "invalid",
   source: String.raw`<server>
const a = 1;

<server>
const b = 2;
</server>

const c = 3;
</server>`,
}
