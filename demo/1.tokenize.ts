import { SlizTokenizer } from "@/src";
console.time();
const output = new SlizTokenizer(
  `<!doctype class="userdata-10" .for={user in users }   >my name is {username}</div    >`,
).tokenize();
console.log(output);
console.timeEnd();
