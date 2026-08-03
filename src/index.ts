import { Tokenizer } from "@lib/tokenizer/tokenizer";
import { ServerStartMatcher } from "./matchers/ServerStart";
import { ServerCodeMatcher } from "./matchers/ServerCode";
import { ServerEndMatcher } from "./matchers/ServerEnd";



const tokenizer = new Tokenizer();

tokenizer.register(new ServerStartMatcher)
tokenizer.register(new ServerCodeMatcher)
tokenizer.register(new ServerEndMatcher)



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
    <div>
        Hello {user.name}
    </div>

    <button client:click="edit">
        Edit
    </button>
</view>
`;

const data = tokenizer.tokenize(code);


console.log(data);
