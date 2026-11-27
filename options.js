const apiKey = document.getElementById("apiKey");
const targetLang = document.getElementById("targetLang");
const saved = document.getElementById("saved");

for (const [code, name] of core.LANGUAGES) {
  targetLang.append(new Option(name, code));
}

async function load() {
  const s = await messenger.storage.local.get({ apiKey: "", targetLang: "EN-US" });
  apiKey.value = s.apiKey;
  targetLang.value = s.targetLang;
}

let timer;
async function save() {
  await messenger.storage.local.set({ apiKey: apiKey.value.trim(), targetLang: targetLang.value });
  saved.hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => (saved.hidden = true), 1500);
}

apiKey.addEventListener("input", save);
targetLang.addEventListener("change", save);
load();
