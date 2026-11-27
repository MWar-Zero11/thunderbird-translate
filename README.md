# Thunderbird Translate

Translate the open email with one click, using the free DeepL API.

## Install (once)
1. Get a free key: https://www.deepl.com/pro-api, "Sign up for free" (DeepL API Free), then in your account open API Keys. Free keys end in `:fx`.
2. Build the add-on: `.\scripts\build.ps1` writes `dist/thunderbird-translate.xpi`.
3. Thunderbird: menu, Add-ons and Themes, gear icon, **Install Add-on From File...**, pick the `.xpi`.
4. Open the add-on's **Options**, paste the key, choose the language.

## Use
Open an email and click **Translate** in the message header toolbar. The translation appears in a panel. **Copy** copies it. Translations are cached per message.

## Develop
- `node --test test/core.test.mjs` runs the self-check for the pure helpers in `core.js`.
- Temporary load without building: Add-ons Manager, gear icon, Debug Add-ons, Load Temporary Add-on, pick `manifest.json`.
- Design: `docs/superpowers/specs/2026-11-27-thunderbird-translate-design.md`.

Free plan: 500,000 characters per month. Never commit a key.
