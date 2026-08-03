import { Tokenizer } from "@lib/tokenizer/tokenizer";
import { ServerStartMatcher } from "./matchers/ServerStart";
import { ServerCodeMatcher } from "./matchers/ServerCode";
import { ServerEndMatcher } from "./matchers/ServerEnd";
import { ViewStartMatcher } from "./matchers/ViewStart";
import { ViewEndMatcher } from "./matchers/ViewEnd";
import { DotMatcher } from "./matchers/Dot";
import { ExpressionStartMatcher } from "./matchers/ExpressionStart";
import { ExpressionCodeMatcher } from "./matchers/ExpressionCode";
import { ExpressionEndMatcher } from "./matchers/ExpressionEnd";
import { OpenTagMatcher } from "./matchers/OpenTag";
import { CloseTagMatcher } from "./matchers/CloseTag";
import { SelfCloseTagMatcher } from "./matchers/SelfClosingTag";
import { TagEndMatcher } from "./matchers/TagEnd";
import { IdentifierMatcher } from "./matchers/Identifier";
import { EqualsMatcher } from "./matchers/Equals";
import { TextMatcher } from "./matchers/Text";

const tokenizer = new Tokenizer();

tokenizer.register(new ServerStartMatcher());
tokenizer.register(new ServerCodeMatcher());
tokenizer.register(new ServerEndMatcher());

tokenizer.register(new ViewStartMatcher());
tokenizer.register(new ViewEndMatcher());

tokenizer.register(new OpenTagMatcher());
tokenizer.register(new CloseTagMatcher());
tokenizer.register(new SelfCloseTagMatcher());
tokenizer.register(new TagEndMatcher());

tokenizer.register(new IdentifierMatcher());
tokenizer.register(new EqualsMatcher());

tokenizer.register(new DotMatcher());

tokenizer.register(new ExpressionStartMatcher());
tokenizer.register(new ExpressionCodeMatcher());
tokenizer.register(new ExpressionEndMatcher());

tokenizer.register(new TextMatcher());

const code = `<server>
const user = await getUser();
const myName = "user"
const username = 'name1'
const backtick=\`data\`
async function updateName(name) {
    await db.users.update(user.id, { name });
}
</server>
<view>
<div .when={user}>
Hello {user.name}
</view>`;

const data = tokenizer.tokenize(code);


console.log(data);
