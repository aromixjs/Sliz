import { CharCodes } from "./tokenizer/char";
import { Tokenizer } from "./tokenizer/tokenizer";
import { TokenKind } from "./tokenizer/tokens";

const tokenizer = new Tokenizer()


tokenizer.register({
   kind: TokenKind.TEMPLATE_START,
   match(ctx) {
      if (ctx.slice(ctx.cursor, ctx.cursor + 3) === '~T"') {
         return { kind: this.kind, value: '~T"', length: 3 }
      }
      return null
   }
})


tokenizer.register({
   kind: TokenKind.DOT,
   match(ctx) {
      return ctx.peekCode() === CharCodes.Dot ? { kind: this.kind, value: '.', length: 1 } : null
   },
})






const code = `
const userId = prop(v.string())
let filter = state<'all' | 'active' | 'done'>('all')

async function deleteTodo(payload: { id: string }) {
  await db.todos.delete(payload.id)
}

function setFilter(payload: { value: typeof filter }) {
  filter = payload.value
}

const items = await db.todos.list(userId, filter)

~T"
<button .click={setFilter} .value="active">Active</button>
<ul>
  .for(item of items) {
    <li>{item.text} <button .click={deleteTodo} .id={item.id}>×</button></li>
  }
</ul>
.if(items.length === 0) {
  <p>No items</p>
}
"T~
`

const data =tokenizer.tokenize(code)


console.log(data);
