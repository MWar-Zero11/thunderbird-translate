// Pure helpers shared by popup.js and test/core.test.mjs (no browser APIs here).
const MAX_CHARS = 100000; // DeepL request limit is 128 KiB; leave headroom for JSON + multibyte.

const LANGUAGES = [
  ["EN-US", "English (US)"],
  ["EN-GB", "English (UK)"],
  ["NL", "Dutch"],
  ["DE", "German"],
  ["FR", "French"],
  ["ES", "Spanish"],
  ["IT", "Italian"],
  ["PT-PT", "Portuguese"],
];

// From messages.listInlineTextParts(): prefer plain text, else first HTML part.
function pickTextPart(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const plain = parts.find((p) => p.contentType === "text/plain" && p.content.trim());
  if (plain) return { text: plain.content, isHtml: false };
  const html = parts.find((p) => p.contentType === "text/html" && p.content.trim());
  if (html) return { text: html.content, isHtml: true };
  return null;
}

function truncate(text) {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_CHARS) return { text: trimmed, truncated: false };
  return { text: trimmed.slice(0, MAX_CHARS), truncated: true };
}

// Plain-English message for a non-2xx DeepL response.
function describeError(status) {
  switch (status) {
    case 403: return "DeepL rejected the API key. Check it in the add-on settings.";
    case 456: return "Your free DeepL quota for this month is used up.";
    case 429: return "DeepL is busy. Wait a moment and click Translate again.";
    case 413: return "This email is too long for DeepL to translate in one go.";
    default: return `DeepL returned an error (HTTP ${status}). Try again later.`;
  }
}

function cacheKey(headerMessageId, targetLang) {
  return `t:${targetLang}:${headerMessageId}`;
}

const core = { MAX_CHARS, LANGUAGES, pickTextPart, truncate, describeError, cacheKey };
if (typeof module !== "undefined") module.exports = core;
else globalThis.core = core;
