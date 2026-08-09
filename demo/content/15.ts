export default {
   name: "invalid self closing on non void",
   expected: "invalid",
   source: String.raw`<div />
<span />
<p />
<section />
<article />
<header />
<footer />
<main />
<form />
<table />`,
}
