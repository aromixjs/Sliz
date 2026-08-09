export default {
   name: "35 - very long expression",
   expected: "stress",
   source: String.raw`<div>
    {veryLongVariableName?.deeply?.nested?.property?.that?.goes?.on?.and?.on?.and?.on?.forever?.with?.many?.levels?.of?.nesting}
</div>`,
}
