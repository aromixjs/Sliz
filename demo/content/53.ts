export default {
  name: "53 - syntax looking text",
  expected: "stress",
  source: String.raw`<div>
    Less than <
    Greater than >
    Slash /
    Closing-looking </not-a-real-tag>
    Braces {hello}
    Multiple {{{{{
    Quotes "hello"
    Apostrophe 'hello'
    Equals =
    Ampersand &
</div>`,
};
