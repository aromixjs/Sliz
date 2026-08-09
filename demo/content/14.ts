export default {
   name: "xss injection attempts",
   expected: "invalid",
   source: String.raw`<div>
    {eval("alert(1)")}
    {constructor.constructor("alert(1)")()}
    {window.location = "evil.com"}
    {document.cookie}
</div>`,
}
