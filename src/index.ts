import { PreProcessResult, processExpressions } from "@lib/expression.preprocessor";
import { parseHtml } from "@lib/html.parser";
import { htmlChunk, serverCode, serverEnd, serverStart } from "@lib/matchers";
import { tokenize, TokenKind } from "@lib/tokernizer";

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

const tokens = tokenize({
    matchers: [serverStart, serverCode, serverEnd, htmlChunk],
    source: code
})

const parser = parseHtml()
const processedResults: PreProcessResult[] = []
for (const token of tokens) {

    if (token.kind === TokenKind.HtmlToken) {
        const result = processExpressions(token)
        processedResults.push(result)
        if (result.token.value) {
            parser.write(result.token.value)
        }
    }
}
const htmlAst = parser.end()



console.dir({
    tokens,
    htmlAst,
    processedResults
}, { depth: null });