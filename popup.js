const $ = (id) => document.getElementById(id);
const DEEPL_URL = "https://api-free.deepl.com/v2/translate";

function show(status, text, { error = false, note = "" } = {}) {
  $("status").textContent = status;
  $("status").className = error ? "error" : "";
  $("out").textContent = text; // textContent only: translated text is untrusted
  $("copy").hidden = !text || error;
  $("note").hidden = !note;
  $("note").textContent = note;
}

async function displayedMessage() {
  const [tab] = await messenger.tabs.query({ active: true, currentWindow: true });
  if (!tab) return null;
  const list = await messenger.messageDisplay.getDisplayedMessages(tab.id);
  const messages = Array.isArray(list) ? list : list.messages; // MV2 returns an array, MV3 a MessageList
  return messages[0] || null;
}

async function messageText(messageId) {
  const parts = await messenger.messages.listInlineTextParts(messageId);
  const picked = core.pickTextPart(parts);
  if (!picked) return "";
  if (!picked.isHtml) return picked.text;
  return messenger.messengerUtilities.convertToPlainText(picked.text);
}

async function translate(text, targetLang, apiKey) {
  const res = await fetch(DEEPL_URL, {
    method: "POST",
    headers: { "Authorization": `DeepL-Auth-Key ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: [text], target_lang: targetLang }),
  });
  if (!res.ok) throw new Error(core.describeError(res.status));
  const data = await res.json();
  const t = data.translations && data.translations[0];
  if (!t) throw new Error("DeepL sent back an empty translation.");
  return { text: t.text, from: t.detected_source_language };
}

async function run() {
  const { apiKey = "", targetLang = "EN-US" } = await messenger.storage.local.get(["apiKey", "targetLang"]);
  if (!apiKey.trim()) {
    return show("Add your DeepL API key", "Click the gear button and paste the key from your DeepL account (it ends in :fx).", { error: true });
  }
  const msg = await displayedMessage();
  if (!msg) return show("No email open", "Open an email, then click Translate.", { error: true });

  const key = core.cacheKey(msg.headerMessageId, targetLang);
  const cached = (await messenger.storage.local.get(key))[key];
  if (cached) return show(`Translated from ${cached.from || "?"} (cached)`, cached.text);

  const raw = await messageText(msg.id);
  if (!raw.trim()) return show("Nothing to translate", "This email has no readable text.", { error: true });
  const { text, truncated } = core.truncate(raw);

  try {
    const result = await translate(text, targetLang, apiKey.trim());
    await messenger.storage.local.set({ [key]: result });
    show(`Translated from ${result.from}`, result.text, {
      note: truncated ? `Only the first ${core.MAX_CHARS.toLocaleString()} characters were translated.` : "",
    });
  } catch (e) {
    show("Translation failed", e.message, { error: true });
  }
}

$("copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText($("out").textContent);
  $("copy").textContent = "Copied";
  setTimeout(() => ($("copy").textContent = "Copy"), 1200);
});
$("settings").addEventListener("click", () => messenger.runtime.openOptionsPage());

run().catch((e) => show("Something went wrong", e.message, { error: true }));
