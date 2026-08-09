export default {
   name: "8 - many attributes",
   expected: "valid",
   source: String.raw`<div
    id="main"
    class="container mx-auto px-4"
    title="hello world"
    aria-label="Main content"
    data-id="123"
    data-user-id="abc-123"
    role="main"
    tabindex="0"
    hidden
    disabled
    draggable="true"
    spellcheck="false"
>
    Content
</div>`,
}
