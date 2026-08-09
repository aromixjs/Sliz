export default {
   name: "10 - dynamic tag names",
   expected: "valid",
   source: String.raw`<div>
    {(() => {
        const Tag = isButton ? 'button' : 'a';
        return <Tag href={url}>{label}</Tag>;
    })()}
</div>

<div>
    {tags.map(tag => {
        const Component = components[tag];
        return <Component key={tag} />;
    })}
</div>`,
}
