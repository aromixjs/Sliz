export default {
  name: "74 - server html lookalikes",
  expected: "stress",
  source: String.raw`<script server>
const html = "<div>Hello</div>";
const html2 = '<span>World</span>';
const close = "</script>";
const close2 = "</style>";
const open = "<script server>";
const fake = "<div>{hello}</div>";

const template = \`
    <div>
        \${user.name}
    </div>
\`;

const object = {
    html: "<div></div>",
    close: "</script>",
};
</script>

<div>
    {user.name}
</div>`,
};
