import { SlizTokenizer } from "@/src";
console.time();
const output = new SlizTokenizer(
  `<!doctype class="userdata-10"   >my name is {username}</div    >`,
).tokenize();
console.log(output);
console.timeEnd();
