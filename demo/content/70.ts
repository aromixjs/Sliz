export default {
   name: "70 - large attribute",
   expected: "stress",
   source: String.raw`<div
    data-json='{"user":{"id":123,"name":"John","roles":["admin","editor"],"metadata":{"a":1,"b":2,"c":[1,2,3]}}}'
    data-long="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
>
    Large attribute
</div>`,
}
