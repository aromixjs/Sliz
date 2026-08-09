export default {
   name: "custom elements",
   expected: "valid",
   source: String.raw`<my-component>
    <slot></slot>
</my-component>

<another-element
    .property={value}
    .onclick={handler}
    @custom-event={handleEvent}
>
    Content
</another-element>

<x-empty />
<y-validated input="test" />`,
}
