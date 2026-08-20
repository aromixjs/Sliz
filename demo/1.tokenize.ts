import { SlizParser, SlizTokenizer } from "@/src";

const tokens = new SlizTokenizer(`
   <div class="bg:red">
   <span .if={userId}>
   profile pic
   <img src="/pic"/>
   </span>
   users {user.name}
   </div>
`).tokenize();




const ast = new SlizParser(tokens).parse()

console.dir(ast, { depth: null });
