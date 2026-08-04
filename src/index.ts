import { Parser } from "@lib/parser/parser";
import { PreProcessor } from "@lib/preprocessor/preprocessor";
import { HtmlChunkMatcher, ServerCodeMatcher, ServerEndMatcher, ServerStartMatcher } from "@lib/tokenizer/matchers";
import { Tokenizer } from "@lib/tokenizer/tokenizer";
import { SyntaxKind } from "@lib/tokenizer/types";
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

const tokenizer = new Tokenizer([new ServerStartMatcher(), new ServerCodeMatcher(), new ServerEndMatcher(), new HtmlChunkMatcher()])
const tokens = tokenizer.tokenize(code)
const parser = new Parser();
const preprocessor = new PreProcessor()
for (const token of tokens) {

    if (token.kind === SyntaxKind.HtmlToken) {
        const chunk = preprocessor.process(token)
        console.log(chunk);
        
        if (chunk.value) parser.write(chunk.value)
    }
}
const htmlAst = parser.end()
console.log(preprocessor.expressions);
console.log(preprocessor.errors);


console.dir(tokens, { depth: null });
console.dir(htmlAst, { depth: null });

