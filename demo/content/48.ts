export default {
   name: "all javascript strings",
   expected: "stress",
   source: String.raw`<server lang="ts">
const a = "normal string";
const b = 'single quoted string';

const c = "string with <tag>";
const d = 'string with </server>';
const e = "string with </style>";
const f = "string with > and < and /";

const escaped = "hello \\"world\\"";
const singleEscaped = 'hello \\'world\\'';

const multiline = \`hello
world
this is multiline
\`;

const interpolation = \`hello \${user.name}\`;

const nested = \`outer \${foo(\`inner \${bar}\`)} end\`;

const html = \`<div>Hello</div>\`;
const closing = \`</server>\`;
const css = \`</style>\`;
</server>`,
}
