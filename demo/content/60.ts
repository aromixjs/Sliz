export default {
   name: "60 - html entities",
   expected: "valid",
   source: String.raw`<div>
    &amp; &lt; &gt; &quot; &apos;
    &#65; &#x41;
    &nbsp; &copy; &reg; &trade;
    &hearts; &clubs; &diams;
    &Alpha; &Beta; &Gamma;
    &alpha; &beta; &gamma;
</div>`,
}
