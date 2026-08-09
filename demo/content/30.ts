export default {
   name: "30 - cdata and comments",
   expected: "valid",
   source: String.raw`<div>
    <!-- Regular comment -->
    <!-- Multi
         line
         comment -->
    <!-- <div>Nested HTML in comment</div> -->
    <!-- {expression} -->
    <!-- </server> -->
    <!-- </style> -->
    Content
</div>`,
}
