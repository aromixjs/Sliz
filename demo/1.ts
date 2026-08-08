import { compile } from "../src";
import { SyntaxKind } from "../src/tokenizer/token";

const code = `<server lang="ts">
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

const output = compile({
  fileName: "Home.sliz",
  source: code,
  diagnostics: [],
});
console.dir(output.tokens.filter((i) => i.kind !== SyntaxKind.Unknown), {
  depth: null,
});
