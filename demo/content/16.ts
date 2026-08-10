export default {
  name: "16 - script injection in html",
  expected: "invalid",
  source: String.raw`<div>
    <script>alert('xss')</script>
    <img src=x onerror="alert(1)">
    <svg onload="alert(1)">
    <iframe src="javascript:alert(1)">
    <a href="javascript:alert(1)">Click</a>
    <body onload="alert(1)">
    <input onfocus="alert(1)" autofocus>
    <marquee onstart="alert(1)">
</div>`,
};
