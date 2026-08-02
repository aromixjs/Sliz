import { Tokenizer } from "@lib/tokenizer/tokenizer";
import { TemplateEnd } from "./matchers/TemplateEnd";
import {TemplateStart} from './matchers/TemplateStart'



const tokenizer = new Tokenizer();

tokenizer.register(new TemplateStart);
tokenizer.register(new TemplateEnd)




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
`;

const data = tokenizer.tokenize(code);


console.log(data);
