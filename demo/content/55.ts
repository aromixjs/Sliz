export default {
   name: "css closing tag lookalikes",
   expected: "stress",
   source: String.raw`<style>
.foo::before {
    content: "</style>";
}

.bar {
    background-image: url("</style>");
}

.baz {
    content: '<div>';
}

/* </style> */

.foo {
    --value: "</style>";
}
</style>

<div>
    after style
</div>`,
}
