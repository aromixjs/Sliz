import { Tokenizer } from "@lib/tokenizer/tokenizer";
import { ServerStartMatcher } from "./matchers/ServerScript";



const tokenizer = new Tokenizer();

tokenizer.register(new ServerStartMatcher)




const code = `<server>
const user = await getUser();

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
