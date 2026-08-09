export default {
   name: "48 - javascript comments",
   expected: "valid",
   source: String.raw`<server>
/*
    block comment
    <server>
    </server>
    </style>
*/

const foo = 123;

// normal comment
const bar = 456; // trailing comment

/*
 * another comment
 *
 * <div>
 * {something}
 * </div>
 */

const value = {
    foo: 1,
    // foo: 2,
    bar: 3,
};
</server>

<div>
    Hello
</div>`,
}
