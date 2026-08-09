export default {
   name: "46 - invalid expression",
   expected: "invalid",
   source: String.raw`<div>
    {user.name
</div>`,
}
