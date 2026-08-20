import { SlizTokenizer } from "../src";
import HtmlParser2Tokenizer from "../node_modules/htmlparser2/dist/Tokenizer.js";

const smallMarkup =
  "<!DOCTYPE html>\n" +
  '<html lang="en">\n' +
  "<head>\n" +
  '  <meta charset="utf-8" />\n' +
  "  <title>{pageTitle}</title>\n" +
  "</head>\n" +
  "<body>\n" +
  '  <nav class="top-nav">\n' +
  '    <a href="/home" data-id="{home.id}">Home</a>\n' +
  '    <a href="/about">About</a>\n' +
  "  </nav>\n" +
  '  <main class="{container}">\n' +
  "    <h1>{greeting + name}</h1>\n" +
  "    <ul>\n" +
  '      {items.map((item) => `<li class="{row}">{item}</li>`)}\n' +
  "    </ul>\n" +
  '    <button .when="{ready}">{submitLabel}</button>\n' +
  "  </main>\n" +
  "</body>\n" +
  "</html>";

function buildMarkup(itemCount: number): string {
  const parts: string[] = [];
  parts.push("<!DOCTYPE html>");
  parts.push('<html lang="en">');
  parts.push("<head>");
  parts.push('  <meta charset="utf-8" />');
  parts.push("  <title>{pageTitle}</title>");
  parts.push("</head>");
  parts.push("<body>");
  parts.push('  <nav class="top-nav">');
  for (let index = 0; index < itemCount; index++) {
    parts.push(
      `    <a href="/item/${index}" data-id="{item${index}.id}" class="{item${index}.cls}">Item ${index}</a>`,
    );
  }
  parts.push("  </nav>");
  parts.push('  <main class="{container}">');
  parts.push("    <h1>{greeting + name}</h1>");
  parts.push("    <ul>");
  parts.push('      {items.map((item) => `<li class="{row}">{item}</li>`)}');
  for (let index = 0; index < itemCount; index++) {
    parts.push(
      `      <li .when="{item${index}.visible}" data-index="${index}">{item${index}.label}</li>`,
    );
  }
  parts.push("    </ul>");
  parts.push("  </main>");
  parts.push("</body>");
  parts.push("</html>");
  return parts.join("\n");
}

function measure(runs: number, run: () => void): number {
  const start = performance.now();
  for (let index = 0; index < runs; index++) {
    run();
  }
  return performance.now() - start;
}

function benchmarkPair(source: string, runs: number, label: string): void {
  let slizEventCount = 0;
  const countEvent = () => {
    slizEventCount++;
  };
  const callbacks = {
    onattribdata: countEvent,
    onattribentity: countEvent,
    onattribend: countEvent,
    onattribname: countEvent,
    oncdata: countEvent,
    onclosetag: countEvent,
    oncomment: countEvent,
    ondeclaration: countEvent,
    onend: countEvent,
    onopentagend: countEvent,
    onopentagname: countEvent,
    onprocessinginstruction: countEvent,
    onselfclosingtag: countEvent,
    ontext: countEvent,
    ontextentity: countEvent,
  };

  const runSliz = () => {
    new SlizTokenizer(source).tokenize();
  };
  const runHtml = () => {
    const tokenizer = new HtmlParser2Tokenizer(
      { xmlMode: false, decodeEntities: false, recognizeSelfClosing: true },
      callbacks,
    );
    tokenizer.write(source);
    tokenizer.end();
  };

  for (let index = 0; index < 3; index++) {
    runSliz();
    runHtml();
  }

  let slizTotal = 0;
  let htmlTotal = 0;
  for (let index = 0; index < runs; index++) {
    slizTotal += measure(1, runSliz);
    htmlTotal += measure(1, runHtml);
  }

  const slizPerRun = slizTotal / runs;
  const htmlPerRun = htmlTotal / runs;
  const slizOpsPerSecond = 1000 / slizPerRun;
  const htmlOpsPerSecond = 1000 / htmlPerRun;
  const ratio = slizPerRun / htmlPerRun;

  const slizTokens = new SlizTokenizer(source).tokenize().length;
  let htmlEvents = 0;
  const countingCallbacks = {
    onattribdata: () => {
      htmlEvents++;
    },
    onattribentity: () => {
      htmlEvents++;
    },
    onattribend: () => {
      htmlEvents++;
    },
    onattribname: () => {
      htmlEvents++;
    },
    oncdata: () => {
      htmlEvents++;
    },
    onclosetag: () => {
      htmlEvents++;
    },
    oncomment: () => {
      htmlEvents++;
    },
    ondeclaration: () => {
      htmlEvents++;
    },
    onend: () => {
      htmlEvents++;
    },
    onopentagend: () => {
      htmlEvents++;
    },
    onopentagname: () => {
      htmlEvents++;
    },
    onprocessinginstruction: () => {
      htmlEvents++;
    },
    onselfclosingtag: () => {
      htmlEvents++;
    },
    ontext: () => {
      htmlEvents++;
    },
    ontextentity: () => {
      htmlEvents++;
    },
  };
  const htmlCounter = new HtmlParser2Tokenizer(
    { xmlMode: false, decodeEntities: false, recognizeSelfClosing: true },
    countingCallbacks,
  );
  htmlCounter.write(source);
  htmlCounter.end();

  console.log(`=== ${label} (${source.length} bytes) ===`);
  console.log(
    `  sliz:        ${slizPerRun.toFixed(3)} ms/op  ${slizOpsPerSecond.toFixed(0)} ops/s  ${slizTokens} tokens`,
  );
  console.log(
    `  htmlparser2: ${htmlPerRun.toFixed(3)} ms/op  ${htmlOpsPerSecond.toFixed(0)} ops/s  ${htmlEvents} events`,
  );
  if (ratio > 1) {
    console.log(`  result: sliz is ${ratio.toFixed(1)}x SLOWER than htmlparser2`);
  } else {
    console.log(`  result: sliz is ${(1 / ratio).toFixed(1)}x FASTER than htmlparser2`);
  }
  console.log("");
}

benchmarkPair(smallMarkup, 2000, "small markup");
benchmarkPair(buildMarkup(2000), 300, "large markup (2000 rows)");
benchmarkPair(buildMarkup(10000), 60, "huge markup (10000 rows)");