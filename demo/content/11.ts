export default {
  name: "11 - ugly whitespace",
  expected: "valid",
  source: String.raw`   <script server    lang = "ts"   >
const     foo      =      "bar"




const       value=await      load(
    foo
)
</script>



<style      >
body     {
        margin: 0;
        padding: 0;
    }
</style    >

<div      class = "foo"       id = "bar"    >
    Hello
</div>`,
};
