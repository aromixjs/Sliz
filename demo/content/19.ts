export default {
  name: "19 - invalid attribute names",
  expected: "invalid",
  source: String.raw`<div
    123="invalid"
    -name="invalid"
    .name="invalid"
    @event="invalid"
    #id="invalid"
    space name="invalid"
    tab	name="invalid"
>
    Content
</div>`,
};
