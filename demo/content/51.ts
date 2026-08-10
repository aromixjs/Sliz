export default {
  name: "51 - regular expressions",
  expected: "stress",
  source: String.raw`<script server>
const simple = /hello/;
const flags = /hello/gi;
const escaped = /hello\/world/;
const characterClass = /[a-z<>{}]/;
const complex = /^(https?:\/\/)?([^\/]+)(\/.*)?$/i;

const result = text
    .replace(/foo/g, "bar")
    .match(/hello\s+world/i);

const regexLike = /<\/server>/;
const regexStyle = /<\/style>/;
</script>

<div>
    Regex test
</div>`,
};
