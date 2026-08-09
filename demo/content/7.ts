export default {
   name: "css complex selectors",
   expected: "stress",
   source: String.raw`<style>
[data-attr="value"] {
    color: red;
}

.class1.class2 {
    color: blue;
}

.class1 .class2 {
    color: green;
}

.class1 > .class2 {
    color: yellow;
}

.class1 + .class2 {
    color: purple;
}

.class1 ~ .class2 {
    color: orange;
}

.class1:hover .class2:focus {
    color: pink;
}

@media (prefers-color-scheme: dark) {
    .class1 {
        color: white;
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>

<div>CSS selectors</div>`,
}
