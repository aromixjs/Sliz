function render(state, props) {
const { user } = state;
let html = '';
if (user) {
html += `<div>`;
html += `
Hello ${user.name}
`;
html += `</div>`;
}
return html;
}