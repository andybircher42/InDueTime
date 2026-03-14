#!/usr/bin/env node

/**
 * Converts docs/user-guide.md to a standalone HTML page for GitHub Pages.
 * Output: _site/guide/index.html
 *
 * Uses a simple regex-based markdown-to-HTML converter (no dependencies).
 */

const fs = require("fs");
const path = require("path");

const md = fs.readFileSync(
  path.join(__dirname, "..", "docs", "user-guide.md"),
  "utf-8",
);

/** Minimal markdown → HTML converter. Handles what we actually use. */
function markdownToHtml(src) {
  const lines = src.split("\n");
  const out = [];
  let inList = false;
  let inCode = false;
  let inTable = false;
  let tableRows = [];

  function inline(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/&mdash;/g, "—")
      .replace(/ — /g, " — ");
  }

  function flushTable() {
    if (tableRows.length === 0) return;
    out.push("<table>");
    tableRows.forEach((row, i) => {
      const tag = i === 0 ? "th" : "td";
      const cells = row
        .split("|")
        .filter((c) => c.trim() !== "")
        .map((c) => `<${tag}>${inline(c.trim())}</${tag}>`)
        .join("");
      out.push(`<tr>${cells}</tr>`);
    });
    out.push("</table>");
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code blocks
    if (line.startsWith("```")) {
      if (inCode) {
        out.push("</code></pre>");
        inCode = false;
      } else {
        if (inList) { out.push("</ul>"); inList = false; }
        flushTable();
        out.push("<pre><code>");
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      out.push(line.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      continue;
    }

    // Blank lines
    if (line.trim() === "") {
      if (inList) { out.push("</ul>"); inList = false; }
      flushTable();
      continue;
    }

    // Horizontal rules
    if (/^---+$/.test(line.trim())) {
      flushTable();
      out.push("<hr>");
      continue;
    }

    // Table rows
    if (line.includes("|") && line.trim().startsWith("|")) {
      // Skip separator rows like |-------|-------|
      if (/^\|[\s-|]+\|$/.test(line.trim())) {
        continue;
      }
      inTable = true;
      tableRows.push(line);
      continue;
    } else {
      flushTable();
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      if (inList) { out.push("</ul>"); inList = false; }
      const level = headingMatch[1].length;
      const id = headingMatch[2]
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      out.push(`<h${level} id="${id}">${inline(headingMatch[2])}</h${level}>`);
      continue;
    }

    // List items
    if (line.match(/^- /)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }

    // Paragraphs
    out.push(`<p>${inline(line)}</p>`);
  }

  if (inList) out.push("</ul>");
  flushTable();

  return out.join("\n");
}

const body = markdownToHtml(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>In Due Time — User Guide</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a2e;
      background: #faf9f7;
      padding: 24px 16px 64px;
      max-width: 680px;
      margin: 0 auto;
    }

    h1 {
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 4px;
      color: #2d3a4a;
    }

    h1 + p { color: #6b7280; margin-bottom: 24px; }

    h2 {
      font-size: 1.3rem;
      font-weight: 700;
      margin-top: 40px;
      margin-bottom: 12px;
      color: #2d3a4a;
      border-bottom: 2px solid #e8e4df;
      padding-bottom: 6px;
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 8px;
      color: #374151;
    }

    p { margin-bottom: 12px; }

    strong { font-weight: 600; }

    ul {
      margin-bottom: 12px;
      padding-left: 24px;
    }

    li { margin-bottom: 6px; }

    code {
      font-family: "SF Mono", Menlo, Consolas, monospace;
      font-size: 0.9em;
      background: #f0ede8;
      padding: 2px 6px;
      border-radius: 4px;
    }

    pre {
      background: #f0ede8;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      overflow-x: auto;
    }

    pre code {
      background: none;
      padding: 0;
      font-size: 0.85em;
      line-height: 1.5;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }

    th, td {
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1px solid #e8e4df;
    }

    th {
      font-weight: 600;
      color: #6b7280;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    hr {
      border: none;
      border-top: 2px solid #e8e4df;
      margin: 24px 0;
    }

    a {
      color: #4a7c96;
      text-decoration: none;
    }

    a:hover { text-decoration: underline; }

    @media (prefers-color-scheme: dark) {
      body { background: #1a1a2e; color: #e5e5e5; }
      h1, h2 { color: #f0ede8; }
      h3 { color: #d1d5db; }
      h1 + p { color: #9ca3af; }
      h2 { border-bottom-color: #374151; }
      code { background: #2d2d44; }
      pre { background: #2d2d44; }
      th { color: #9ca3af; }
      th, td { border-bottom-color: #374151; }
      hr { border-top-color: #374151; }
      a { color: #7bb8d0; }
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;

const outDir = path.join(__dirname, "..", "_site", "guide");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log("Built _site/guide/index.html");
