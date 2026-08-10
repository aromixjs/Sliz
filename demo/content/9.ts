export default {
  name: "9 - lexer nightmare",
  expected: "stress",
  source: String.raw`<script server lang="ts">
const value = \`hello \${user?.name ?? "anonymous"}\`;

const regex = /^(foo|bar)\\/(baz)?$/gi;

const object = {
    text: "</script>",
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
    </script>
    </style>
    <div>
    {foo}
*/

const fn = (value: string) => {
    return value
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};
</script>

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
};
