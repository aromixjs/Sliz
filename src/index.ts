import { Char } from "../lib/tokenizer/char";
import { Tokenizer } from "../lib/tokenizer/tokenizer";
import { TokenKind } from "../lib/tokenizer/tokens";

const tokenizer = new Tokenizer()


tokenizer.register({
   kind: TokenKind.TEMPLATE_START,
   match(ctx) {

      if (ctx.source.slice(ctx.cursor, ctx.cursor + 3) === '~T"') {
         return { kind: this.kind, value: '~T"' }
      }
   }
})


tokenizer.register({
   kind: TokenKind.DOT,
   match({ source, cursor }) {
      if (source.charCodeAt(cursor) === Char.Dot && source.charCodeAt(cursor - 1) !== Char.Space) {
         return {
            kind: this.kind,
            value: '.'
         }
      }
   },
})



tokenizer.register({
   kind: TokenKind.TEMPLATE_END,
   match(ctx) {

      if (ctx.source.slice(ctx.cursor, ctx.cursor + 3) === '"T~') {
         return { kind: this.kind, value: '"T~' }
      }

   },
})





const code = `~T"
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

const data = tokenizer.tokenize(code)


console.log(data);
