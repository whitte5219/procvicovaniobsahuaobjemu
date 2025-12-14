// ================= CONFIG =================
const COHERE_API_KEY = "PK6ZC8iaxpBoEYu2FMXoymt9LmgQuNPcyZt7pZ6U"; // <-- PUT YOUR KEY HERE
const COHERE_MODEL = "command-a-reasoning-08-2025";

// ================= INIT =================
function initAI() {
  const chatBox = document.getElementById("chatBox");
  const aiInput = document.getElementById("aiInput");
  const aiSend  = document.getElementById("aiSend");

  if (!chatBox || !aiInput || !aiSend) {
    console.error("AI init failed: elements not found.");
    return;
  }

  const history = [];

  // ================= HELPERS =================
  function sanitize(text) {
    return text
      .replace(/[*`#>-]/g, "")     // remove markdown symbols
      .replace(/\n{2,}/g, "\n")    // collapse new lines
      .trim();
  }

  function addBubble(text, side) {
    const row = document.createElement("div");
    row.className = "msgRow " + side;

    const bubble = document.createElement("div");
    bubble.className = "bubble " + side;
    bubble.textContent = text;

    row.appendChild(bubble);
    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;

    return bubble;
  }

  function addTypingBubble() {
    const row = document.createElement("div");
    row.className = "msgRow ai";

    const bubble = document.createElement("div");
    bubble.className = "bubble ai";

    const dots = document.createElement("span");
    dots.className = "typingDots";
    dots.textContent = "● ● ●";

    bubble.appendChild(dots);
    row.appendChild(bubble);
    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;

    return row;
  }

  // ================= READY MESSAGE =================
  addBubble("AI je připraven ✅", "ai");

  // ================= SEND MESSAGE =================
  async function sendMessage() {
    const userText = aiInput.value.trim();
    if (!userText) return;

    addBubble(userText, "user");
    aiInput.value = "";

    if (!COHERE_API_KEY) {
      addBubble("Chybí API klíč v souboru ai.js.", "ai");
      return;
    }

    history.push({ role: "user", content: userText });

    const typingRow = addTypingBubble();

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
                "Jsi školní asistent matematiky (ZŠ). " +
                "Vysvětluj česky, velmi jednoduše, krátce, bez markdownu, bez seznamů. " +
                "Používej krátké věty. Maximálně 6–8 řádků. " +
                "Nevypisuj kroky jako seznam, piš normální text."
            },
            ...history
          ]
        })
      });

      const data = await res.json();
      chatBox.removeChild(typingRow);

      if (!res.ok) {
        console.error("Cohere error:", data);
        addBubble("Chyba při odpovědi AI.", "ai");
        return;
      }

      let aiText = "Odpověď nepřišla.";
      if (data?.message?.content?.length) {
        aiText = data.message.content.map(x => x.text).join(" ");
      }

      aiText = sanitize(aiText);
      history.push({ role: "assistant", content: aiText });

      addBubble(aiText, "ai");

    } catch (err) {
      chatBox.removeChild(typingRow);
      console.error(err);
      addBubble("Chyba připojení k AI.", "ai");
    }
  }

  // ================= EVENTS =================
  aiSend.addEventListener("click", sendMessage);
  aiInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
}

// Init safely
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAI);
} else {
  initAI();
}
