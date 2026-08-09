export default {
   name: "62 - mixed content patterns",
   expected: "valid",
   source: String.raw`<div>
    Text before
    <span>element</span>
    text between
    <br>
    text after
    <!-- comment -->
    more text
    <strong>bold</strong>
    final text
</div>`,
}
