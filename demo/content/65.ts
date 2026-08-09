export default {
   name: "complex template literals in expressions",
   expected: "stress",
   source: String.raw`<div>
    {\`hello \${user.name}\`}
    {\`nested \${foo(\`inner \${bar}\`)} end\`}
    {\`multi
line
template\`}
    {\`<div>\${content}</div>\`}
    {\`</server>\`}
    {\`</style>\`}
</div>`,
}
