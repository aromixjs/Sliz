export default {
  name: "12 - list rendering edge cases",
  expected: "stress",
  source: String.raw`<ul>
    {items.map((item, index) => (
        <li key={item.id}>
            {index}. {item.name}
        </li>
    ))}
</ul>

<div>
    {Object.entries(obj).map(([key, value]) => (
        <div key={key}>{key}: {value}</div>
    ))}
</div>

<table>
    <tbody>
        {rows.map(row => (
            <tr key={row.id}>
                {row.cells.map((cell, i) => (
                    <td key={i}>{cell}</td>
                ))}
            </tr>
        ))}
    </tbody>
</table>`,
};
