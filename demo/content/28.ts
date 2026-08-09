export default {
   name: "28 - table complex structure",
   expected: "valid",
   source: String.raw`<table>
    <caption>Product List</caption>
    <colgroup>
        <col span="2">
        <col>
    </colgroup>
    <thead>
        <tr>
            <th scope="col">Name</th>
            <th scope="col">Price</th>
            <th scope="col">Stock</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Product 1</td>
            <td>$10</td>
            <td>5</td>
        </tr>
        <tr>
            <td>Product 2</td>
            <td>$20</td>
            <td>0</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="2">Total</td>
            <td>5</td>
        </tr>
    </tfoot>
</table>`,
}
