import { Tokenizer } from "@lib/tokenizer/tokenizer";
import { ServerStartMatcher } from "./matchers/ServerStart";
import { ServerCodeMatcher } from "./matchers/ServerCode";
import { ServerEndMatcher } from "./matchers/ServerEnd";
import { ViewStartMatcher } from "./matchers/ViewStart";
import { ViewEndMatcher } from "./matchers/ViewEnd";



const tokenizer = new Tokenizer();

tokenizer.register(new ServerStartMatcher)
tokenizer.register(new ServerCodeMatcher)
tokenizer.register(new ServerEndMatcher)
tokenizer.register(new ViewStartMatcher)
tokenizer.register(new ViewEndMatcher)

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
Hello {user.name}
</view>`;

const data = tokenizer.tokenize(code);


console.log(data);
