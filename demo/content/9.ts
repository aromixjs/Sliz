export default {
   name: "9 - lexer nightmare",
   expected: "stress",
   source: String.raw`<server lang="ts">
const value = \`hello \${user?.name ?? "anonymous"}\`;

const regex = /^(foo|bar)\\/(baz)?$/gi;

const object = {
    text: "</server>",
    nested: {
        value: \`</style>\`,
        array: [
            1,
            2,
            3,
            {
                html: "<div>{foo}</div>",
            },
        ],
    },
};

/*
    Fake tags:
    </server>
    </style>
    <div>
    {foo}
*/

const fn = (value: string) => {
    return value
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};
</server>

<style>
.foo::before {
    content: "</style>";
}

/*
    fake closing tag:
    </style>
*/

.bar {
    content: "<div>{foo}</div>";
}
</style>

<div>
    {value}
</div>`,
}
