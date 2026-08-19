import { SlizTokenizer } from "@/src";
console.time();
const output = new SlizTokenizer(`<div>my name is {username</div>`).tokenize();
console.log(output);
console.timeEnd();
