import { writeFileSync } from "node:fs";
import { generate } from "../src/codegen";
import { ExtractedExpression, PreProcessError, PreProcessResult, processExpressions } from "../src/parser/expression.preprocessor";
import { parseHtml } from "../src/parser/html.parser";
import { htmlChunk, serverCode, serverEnd, serverStart } from "../src/tokenizer/matchers";
import { tokenize, TokenKind } from "../src/tokernizer";
import { transform } from "../src/transform/transformer";

console.time()
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


const transformedAst = transform(htmlAst, processedResults)


const expressions = new Map<string, ExtractedExpression>()
const errors: PreProcessError[] = []

for (const result of processedResults) {
    for (const [id, expr] of result.expressions) {
        expressions.set(id, expr)
    }
    errors.push(...result.errors)
}



const body = generate(transformedAst.ast, expressions)
function wrapRender(body: string, stateVars: string[]): string {
    const destructure = stateVars.length ? `const { ${stateVars.join(', ')} } = state;\n` : '';
    return `function render(state, props) {\n${destructure}let html = '';\n${body}return html;\n}`;
}



const source = wrapRender(body, ['user'])

console.dir({
    tokens,
    htmlAst,
    processedResults,
    transformedAst,
    body,
    source
}, { depth: null });


console.timeEnd()



writeFileSync('output.js', source, { encoding: 'utf8' })