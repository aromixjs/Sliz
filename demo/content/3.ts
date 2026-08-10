export default {
  name: "3 - complex css",
  expected: "stress",
  source: String.raw`<style>
:root {
    --primary: #3366ff;
    --spacing: 1rem;
    --font: "Inter", sans-serif;
}

*,
*::before,
*::after {
    box-sizing: border-box;
}

body {
    margin: 0;
    min-height: 100vh;
    font-family: var(--font);
}

.container {
    width: min(100% - 2rem, 1200px);
    margin-inline: auto;
}

@media (min-width: 768px) {
    .container {
        width: min(100% - 4rem, 1400px);
    }
}

@supports (display: grid) {
    .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

.foo:hover::before {
    content: "<";
}

[data-value=">"] {
    content: "</style>";
}

/*
    <style>
    </style>
*/

.foo {
    background: url("data:image/svg+xml,<svg></svg>");
}
</style>

<div>CSS test</div>`,
};
