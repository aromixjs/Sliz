export default {
   name: "34 - invalid nested expressions",
   expected: "invalid",
   source: String.raw`<div>
    {arr[0]}
    {arr[)}
    {fn()}
    {fn(]}
    {obj.key}
    {obj.key}}
    {obj[key]}
</div>`,
}
