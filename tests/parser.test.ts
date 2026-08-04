import { Parser } from "@lib/html.parser";
import { describe, expect, it } from "vitest";

describe("parser basics", () => {
  it("returns an empty array for empty input", () => {
    const parser = new Parser();
    parser.write("");
    expect(parser.end()).toEqual([]);
  });

  it("parses a single element with text", () => {
    const parser = new Parser();
    parser.write("<div>hello</div>");
    expect(parser.end()).toEqual([
      {
        type: "element",
        tag: "div",
        attributes: {},
        children: [{ type: "text", value: "hello" }],
      },
    ]);
  });

  it("parses nested elements", () => {
    const parser = new Parser();
    parser.write("<div><span>hi</span></div>");
    expect(parser.end()).toEqual([
      {
        type: "element",
        tag: "div",
        attributes: {},
        children: [
          {
            type: "element",
            tag: "span",
            attributes: {},
            children: [{ type: "text", value: "hi" }],
          },
        ],
      },
    ]);
  });

  it("parses multiple roots", () => {
    const parser = new Parser();
    parser.write("<p>one</p><p>two</p>");
    const nodes = parser.end();
    expect(nodes).toHaveLength(2);
    expect(nodes.map((n) => n.type)).toEqual(["element", "element"]);
    expect(nodes.map((n) => (n.type === "element" ? n.tag : null))).toEqual([
      "p",
      "p",
    ]);
  });

  it("parses attributes", () => {
    const parser = new Parser();
    parser.write('<div id="main" class="box" disabled>');
    const node = parser.end()[0];
    expect(node.type).toBe("element");
    if (node.type === "element") {
      expect(node.attributes).toEqual({
        id: "main",
        class: "box",
        disabled: "",
      });
    }
  });

  it("parses aromix directive attributes", () => {
    const parser = new Parser();
    parser.write('<div .when="{user}" .for="{item in items}" @click="{handle}">x</div>');
    const node = parser.end()[0];
    if (node.type === "element") {
      expect(node.attributes).toEqual({
        ".when": "{user}",
        ".for": "{item in items}",
        "@click": "{handle}",
      });
    }
  });

  it("preserves whitespace around text but drops whitespace-only nodes", () => {
    const parser = new Parser();
    parser.write("<div>\n  <b>bold</b>\n  tail\n</div>");
    const node = parser.end()[0];
    if (node.type !== "element") throw new Error("expected element");
    const texts = node.children.filter((c) => c.type === "text");
    expect(texts.map((t) => (t.type === "text" ? t.value : ""))).toEqual([
      "\n  tail\n",
    ]);
  });

  it("drops root-level text", () => {
    const parser = new Parser();
    parser.write("plain <b>bold</b> tail");
    expect(parser.end().map((n) => n.type)).toEqual(["element"]);
  });

  it("parses self-closing and void elements", () => {
    const parser = new Parser();
    parser.write("<div><img src='x.png'/><br></div>");
    const node = parser.end()[0];
    if (node.type !== "element") throw new Error("expected element");
    expect(
      node.children.map((c) => (c.type === "element" ? c.tag : null))
    ).toEqual(["img", "br"]);
  });

  it("auto-closes unclosed tags", () => {
    const parser = new Parser();
    parser.write("<div><span>hi</div>");
    const node = parser.end()[0];
    if (node.type !== "element") throw new Error("expected element");
    expect(node.tag).toBe("div");
    expect(node.children[0]).toMatchObject({
      type: "element",
      tag: "span",
    });
  });
});

describe("parser entities and comments", () => {
  it("ignores comments", () => {
    const parser = new Parser();
    parser.write("<!-- note --><p>text</p><!-- tail -->");
    const nodes = parser.end();
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ type: "element", tag: "p" });
  });

  it("decodes html entities in text", () => {
    const parser = new Parser();
    parser.write("<p>&amp; &#60;</p>");
    const node = parser.end()[0];
    if (node.type !== "element") throw new Error("expected element");
    const text = node.children
      .filter((c) => c.type === "text")
      .map((t) => (t.type === "text" ? t.value : ""))
      .join("");
    expect(text).toBe("&<");
  });

  it("decodes entities in attributes too", () => {
    const parser = new Parser();
    parser.write('<a href="/x?a=1&amp;b=2">link</a>');
    const node = parser.end()[0];
    if (node.type !== "element") throw new Error("expected element");
    expect(node.attributes.href).toBe("/x?a=1&b=2");
  });
});

describe("parser server blocks", () => {
  it("parses a server block as a plain element", () => {
    const parser = new Parser();
    parser.write("<server>\nconst x = 1;\n</server>");
    const node = parser.end()[0];
    expect(node).toMatchObject({
      type: "element",
      tag: "server",
    });
    if (node.type === "element") {
      expect(node.children[0]).toMatchObject({
        type: "text",
        value: "\nconst x = 1;\n",
      });
    }
  });

  it("keeps braces and other code text intact", () => {
    const parser = new Parser();
    parser.write("<div>{user.name} <span .when={user}>ok</span></div>");
    const node = parser.end()[0];
    if (node.type !== "element") throw new Error("expected element");
    const values = node.children
      .filter((c) => c.type === "text")
      .map((t) => (t.type === "text" ? t.value : ""));
    expect(values.join(" ")).toContain("{user.name}");
  });
});

describe("parser lifecycle / reuse", () => {
  it("cannot reuse the same parser without reset() (documented limitation)", () => {
    const parser = new Parser();
    parser.write("<div>one</div>");
    expect(parser.end()).toMatchObject([{ tag: "div" }]);

    parser.write("<span>two</span>");
    expect(parser.end()).toMatchObject([{ tag: "div" }]);
  });

  it("reset() clears state and enables reuse", () => {
    const parser = new Parser();
    parser.write("<div>one</div>");
    expect(parser.end()).toMatchObject([{ tag: "div" }]);

    parser.reset();
    parser.write("<span>two</span>");
    expect(parser.end()).toMatchObject([{ tag: "span" }]);
  });

  it("reset() between parse runs yields independent results", () => {
    const parser = new Parser();
    parser.write("<div>one</div>");
    parser.end();
    parser.reset();
    parser.write("<span>two</span>");
    const second = parser.end();
    expect(second).toMatchObject([{ tag: "span" }]);
    expect(JSON.stringify(second)).not.toContain("one");
  });
});

describe("parser robustness", () => {
  it("handles deeply nested elements without stack overflow", () => {
    const depth = 1000;
    const parser = new Parser();
    parser.write("<div>".repeat(depth) + "x" + "</div>".repeat(depth));
    expect(parser.end()).toHaveLength(1);
  });

  it("handles text that looks like tags", () => {
    const parser = new Parser();
    parser.write("<p>1 &lt; 2 &gt; 0 && 3 &gt;= 1</p>");
    const node = parser.end()[0];
    if (node.type !== "element") throw new Error("expected element");
    const text = node.children
      .filter((c) => c.type === "text")
      .map((t) => (t.type === "text" ? t.value : ""))
      .join("");
    expect(text).toContain("<");
    expect(text).toContain(">");
  });

  it("handles large inputs quickly", () => {
    const parser = new Parser();
    parser.write("<div class='x'>hi</div>".repeat(2000));
    const start = performance.now();
    const nodes = parser.end();
    expect(nodes).toHaveLength(2000);
    expect(performance.now() - start).toBeLessThan(2000);
  });

  it("handles unicode text", () => {
    const parser = new Parser();
    parser.write("<p>日本語 테스트 🎉</p>");
    const node = parser.end()[0];
    if (node.type !== "element") throw new Error("expected element");
    expect(node.children[0]).toMatchObject({
      type: "text",
      value: "日本語 테스트 🎉",
    });
  });
});
