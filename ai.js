// === CONFIG ===
const COHERE_API_KEY = ""; // <-- paste your key here
const COHERE_MODEL = "command-a-reasoning-08-2025";

function initAI() {
  const chatBox = document.getElementById("chatBox");
  const aiInput = document.getElementById("aiInput");
  const aiSend  = document.getElementById("aiSend");

  if (!chatBox || !aiInput || !aiSend) {
    console.error("AI init failed: elements not found. Check ids in index.html.");
    return;
  }

  const history = [];

  function addMessage(text, cls) {
    const div = document.createElement("div");
    div.className = cls;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // visible proof the script is running
  addMessage("AI je připraven ✅ (ai.js se načetl)", "chatAI");

  async function sendMessage() {
    const userText = aiInput.value.trim();
    if (!userText) return;

    addMessage(userText, "chatUser");
    aiInput.value = "";

    if (!COHERE_API_KEY) {
      addMessage("Chybí API klíč. Vlož ho do ai.js do COHERE_API_KEY.", "chatAI");
      return;
    }

    const loading = document.createElement("div");
    loading.className = "chatAI";
    loading.textContent = "AI píše…";
    chatBox.appendChild(loading);
    chatBox.scrollTop = chatBox.scrollHeight;

    history.push({ role: "user", content: userText });

    try {
      const res = await fetch("https://api.cohere.com/v2/chat", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + COHERE_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: COHERE_MODEL,
          messages: [
            {
              role: "system",
              content:
                "Jsi školní asistent pro matematiku (ZŠ). Vysvětluj česky, jednoduše, krok za krokem. " +
                "Zaměř se na rozdíl: obvod/obsah/povrch/objem a tvary: čtverec, obdélník, kruh, trojúhelník, krychle, kvádr."
            },
            ...history
          ]
        })
      });

      const data = await res.json();

      // remove loading
      chatBox.removeChild(loading);

      if (!res.ok) {
        console.error("Cohere error:", res.status, data);
        addMessage(`Chyba API (${res.status}). Otevři Console (F12) pro detail.`, "chatAI");
        return;
      }

      let aiText = "Odpověď nepřišla.";
      if (data?.message?.content?.length) {
        aiText = data.message.content.map(x => x.text).join("\n").trim();
      }

      history.push({ role: "assistant", content: aiText });
      addMessage(aiText, "chatAI");

    } catch (err) {
      try { chatBox.removeChild(loading); } catch {}
      console.error(err);
      addMessage("Chyba při komunikaci (síť/CORS). Otevři Console (F12).", "chatAI");
    }
  }

  aiSend.addEventListener("click", sendMessage);
  aiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

// Init even if DOMContentLoaded already fired
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAI);
} else {
  initAI();
}
