export default {
   name: "17 - style injection attempts",
   expected: "invalid",
   source: String.raw`<div style="background: url('javascript:alert(1)')">
    Content
</div>

<div style="behavior: url(xss.htc)">
    Content
</div>

<div style="expression(alert(1))">
    Content
</div>`,
}
