export default {
   name: "complex css calc and functions",
   expected: "stress",
   source: String.raw`<style>
.calc {
    width: calc(100% - 2rem);
    height: calc(100vh - 60px);
    margin: calc(var(--spacing) * 2);
}

.clamp {
    font-size: clamp(1rem, 2.5vw, 2rem);
    width: clamp(300px, 50%, 800px);
}

.min-max {
    width: min(100%, 800px);
    height: max(200px, 50vh);
}

.var-complex {
    color: var(--text-color, var(--fallback, black));
    background: linear-gradient(
        var(--angle, 45deg),
        var(--color-1, red),
        var(--color-2, blue)
    );
}

.nested-fn {
    filter: drop-shadow(calc(var(--x) * 1px) calc(var(--y) * 1px) var(--blur, 4px) var(--shadow-color, black));
}

.trig {
    --angle: calc(sin(45deg) * 100px);
    transform: rotate(calc(atan2(var(--y), var(--x)) * 1rad));
}
</style>

<div>CSS functions</div>`,
}
