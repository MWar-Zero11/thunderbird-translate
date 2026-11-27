import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const core = createRequire(import.meta.url)("../core.js");

test("prefers text/plain over text/html", () => {
  const parts = [
    { contentType: "text/html", content: "<p>Hallo</p>" },
    { contentType: "text/plain", content: "Hallo" },
  ];
  assert.deepEqual(core.pickTextPart(parts), { text: "Hallo", isHtml: false });
});

test("falls back to html when plain part is blank", () => {
  const parts = [
    { contentType: "text/plain", content: "   " },
    { contentType: "text/html", content: "<p>Ciao</p>" },
  ];
  assert.deepEqual(core.pickTextPart(parts), { text: "<p>Ciao</p>", isHtml: true });
});

test("returns null for no usable parts", () => {
  assert.equal(core.pickTextPart([]), null);
  assert.equal(core.pickTextPart([{ contentType: "text/calendar", content: "x" }]), null);
});

test("truncates long text and flags it", () => {
  const long = "a".repeat(core.MAX_CHARS + 5);
  const r = core.truncate(long);
  assert.equal(r.text.length, core.MAX_CHARS);
  assert.equal(r.truncated, true);
  assert.deepEqual(core.truncate("  short  "), { text: "short", truncated: false });
});

test("maps DeepL errors to plain English", () => {
  assert.match(core.describeError(403), /API key/);
  assert.match(core.describeError(456), /quota/);
  assert.match(core.describeError(429), /busy/);
  assert.match(core.describeError(500), /HTTP 500/);
});

test("cache key includes language and message id", () => {
  assert.equal(core.cacheKey("<abc@x>", "NL"), "t:NL:<abc@x>");
});
