# Thunderbird Translate — design (2026-11-27)

## Intent
Marc receives email in other languages and Thunderbird has no built-in translation.
A Translate button in the message header shows the English translation of the open email.

## Goals
- One click: translate the open message into the target language (default English US).
- Zero configuration beyond pasting a DeepL API Free key once.
- Plain-English errors for: no key, bad key, quota exceeded, no message open.

## Non-goals (v1)
Translating replies as you type, attachments, inline replacement of the message body,
auto-translating every incoming mail, source-language picking (DeepL auto-detects).

## Anti-goals
Never render translated text as HTML (textContent only). Never ship or log the API key.

## Constraints
- Thunderbird 161 installed; APIs used need TB >= 137 (`messengerUtilities.convertToPlainText`).
- Manifest V2 (still fully supported by Thunderbird; avoids MV3 background-script uncertainty).
- DeepL free host `api-free.deepl.com`, header `Authorization: DeepL-Auth-Key <key>`,
  JSON body, request limit 128 KiB → text truncated at 100,000 chars with a notice.
- `target_lang` must be a variant (`EN-US` / `EN-GB`); bare `EN` is rejected.
- Free plan: 500,000 characters per month.

## Approaches considered
1. **Gemini (Marc's existing key)** — best quality, content goes to Google. Dropped: Marc chose free.
2. **DeepL API Free** — chosen. Excellent on European languages, free tier is enough.
3. Inline replacement of the message body via a message display script — nicer, but a second
   runtime surface. Deferred until the popup version is in daily use.

## Design
- `manifest.json` (MV2): `message_display_action` with `default_popup`, permissions
  `messagesRead`, `storage`, host `https://api-free.deepl.com/*`. No background script.
- `popup.js`: find the displayed message → `messages.listInlineTextParts` (prefer text/plain,
  else `convertToPlainText` of text/html) → cache check → POST DeepL → render.
  Translations cached in `storage.local` per `headerMessageId` + target language.
- `options.html/js`: API key + target language select.
- `core.js`: pure functions (pick text part, truncate, map DeepL errors) shared with the
  node self-check `test/core.test.mjs`.
- `scripts/build.ps1`: zips the add-on to `dist/thunderbird-translate.xpi`.

## Left to the builder
Popup sizing, icon, exact copy of error messages.
