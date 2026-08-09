export default {
   name: "22 - invalid css syntax",
   expected: "invalid",
   source: String.raw`<style>
.foo {
    color: ;
    margin: ;
    ;
    : red;
    color red;
    color: red;
}

{ invalid }

@ {
}

@invalid {
}
</style>`,
}
