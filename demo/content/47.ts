export default {
   name: "invalid expression",
   expected: "invalid",
   source: String.raw`<div>
    {user.name
</div>`,
}
