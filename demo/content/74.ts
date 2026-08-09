export default {
   name: "74 - server html lookalikes",
   expected: "stress",
   source: String.raw`<server>
const html = "<div>Hello</div>";
const html2 = '<span>World</span>';
const close = "</server>";
const close2 = "</style>";
const open = "<server>";
const fake = "<div>{hello}</div>";

const template = \`
    <div>
        \${user.name}
    </div>
\`;

const object = {
    html: "<div></div>",
    close: "</server>",
};
</server>

<div>
    {user.name}
</div>`,
}
