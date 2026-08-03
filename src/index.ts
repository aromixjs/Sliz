import { Parser } from "@lib/parser/parser";
import { HtmlChunkMatcher, ServerCodeMatcher, ServerEndMatcher, ServerStartMatcher } from "@lib/tokenizer/matchers";
import { Tokenizer } from "@lib/tokenizer/tokenizer";



const tokenizer = new Tokenizer([new ServerStartMatcher(), new ServerCodeMatcher(), new ServerEndMatcher(), new HtmlChunkMatcher()])


const code = `<server>
const user = await getUser();
const myName = "user"
const username = 'name1'
const backtick=\`data\`
async function updateName(name) {
    await db.users.update(user.id, { name });
}

const data = await loadData()

</server>
<div .when={user}>
Hello {user.name}
</div>`;

const token = tokenizer.tokenize(code)
// const parser = new Parser();



// parser.write(code);

 console.dir(token, { depth: null });
