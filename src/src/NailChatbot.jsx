import { useState, useRef, useEffect } from "react";

const systemPrompt = `Eres Maya, la asistente virtual de M&X Estética y Uñas, un centro de estética especializado en uñas ubicado en Torrent, Valencia (España). Tu personalidad es cercana, profesional y apasionada por la belleza. Hablas siempre en español.

Información del negocio:
- Nombre: M&X Estética y Uñas
- Dirección: Av. al Vedat, 85, 46900 Torrent, Valencia
- Teléfono: 653 16 73 13
- Web/enlaces: linktr.ee (ahí encontrarán más info y fotos)
- Valoración: 4.1 ⭐ con 36 reseñas en Google Maps
- Horario: Abierto hasta las 21:00 (cierre)
- Accesible para personas con movilidad reducida ♿

Servicios principales (centro de estética y uñas):
- Nail art y diseños de uñas (básico y elaborado)
- Manicura clásica y semipermanente
- Extensiones de uñas (gel, acrílico)
- Pedicura clásica y semipermanente
- Diseños personalizados
- Retirada de uñas

Para consultar precios exactos o disponibilidad, recomienda siempre llamar al 653 16 73 13 o visitar linktr.ee para ver los servicios actualizados y reservar cita.

Consejos que puedes dar:
- Cuidado de cutículas e hidratación
- Tendencias actuales en nail art
- Duración de los diferentes servicios
- Recomendaciones de diseños según ocasión o temporada

Responde siempre de forma amable, breve y con personalidad. Usa emojis con moderación (1-2 por mensaje). Si alguien quiere agendar cita, dales el teléfono 653 16 73 13 y el enlace linktr.ee. Si preguntan algo que no sabes con certeza, ofrece que contacten directamente al salón.`;

const suggestions = [
  "¿Qué servicios ofrecéis?",
  "¿Cómo puedo pedir cita?",
  "¿Dónde estáis ubicados?",
  "¿Cuál es vuestro horario?",
  "¿Hacéis nail art personalizado?",
];

const TypingDots = () => (
  <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "4px 0" }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: "50%", background: "#c9a0a0",
        display: "inline-block", animation: "bounce 1.2s infinite",
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
  </div>
);

export default function NailChatbot() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "¡Hola! Soy Maya 💅 la asistente de M&X Estética y Uñas en Torrent. Estoy aquí para ayudarte con nuestros servicios. ¿En qué puedo ayudarte?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setShowSuggestions(false);
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "Lo siento, no pude responder. Inténtalo de nuevo.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Ups, hubo un problema de conexión. Inténtalo de nuevo 🙏" }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>💅</div>
          <div style={styles.avatarDot} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.headerName}>M&X Estética y Uñas</div>
          <div style={styles.headerSub}>Maya · Asistente virtual · En línea</div>
        </div>
        <div style={styles.ratingBadge}>⭐ 4.1</div>
      </div>

      {/* Location bar */}
      <div style={styles.locationBar}>
        <span style={styles.locationIcon}>📍</span>
        <span>Av. al Vedat, 85 · Torrent, Valencia · Abierto hasta las 21:00</span>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className="msg-appear"
            style={{ ...styles.msgRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animationDelay: `${i * 0.04}s` }}>
            {msg.role === "assistant" && <div style={styles.botIcon}>✿</div>}
            <div style={msg.role === "user" ? styles.userBubble : styles.botBubble}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.msgRow, justifyContent: "flex-start" }} className="msg-appear">
            <div style={styles.botIcon}>✿</div>
            <div style={styles.botBubble}><TypingDots /></div>
          </div>
        )}

        {showSuggestions && messages.length === 1 && (
          <div style={styles.suggestions} className="msg-appear">
            <div style={styles.suggestLabel}>Preguntas frecuentes:</div>
            {suggestions.map((s, i) => (
              <button key={i} style={styles.chip} onClick={() => sendMessage(s)} className="chip-btn">{s}</button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe tu mensaje..."
          rows={1}
          style={styles.textarea}
          className="chat-input"
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          style={{ ...styles.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }} className="send-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <a href="tel:653167313" style={styles.footerLink}>📞 653 16 73 13</a>
        <span style={styles.footerDivider}>·</span>
        <a href="https://linktr.ee" target="_blank" rel="noreferrer" style={styles.footerLink}>🔗 linktr.ee</a>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    display: "flex", flexDirection: "column",
    height: "100vh", maxWidth: 480, margin: "0 auto",
    background: "#fdf8f5", overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #3d1a4f 50%, #6b2d6b 100%)",
    padding: "16px 18px",
    display: "flex", alignItems: "center", gap: 12,
    boxShadow: "0 4px 20px rgba(60,20,80,0.3)",
    flexShrink: 0, zIndex: 10,
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: {
    width: 44, height: 44, borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, border: "2px solid rgba(230,180,230,0.4)",
  },
  avatarDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: "50%",
    background: "#7ee8a2", border: "2px solid #1a1a2e",
  },
  headerName: {
    color: "#f0e0ff", fontSize: 15, fontWeight: "700",
    letterSpacing: "0.04em",
  },
  headerSub: {
    color: "rgba(240,220,255,0.55)", fontSize: 11,
    letterSpacing: "0.07em", fontFamily: "sans-serif",
  },
  ratingBadge: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(230,180,230,0.3)",
    borderRadius: 20, padding: "4px 10px",
    color: "#f0e0ff", fontSize: 12,
    fontFamily: "sans-serif", flexShrink: 0,
  },
  locationBar: {
    background: "rgba(60,20,80,0.06)",
    borderBottom: "1px solid rgba(120,60,150,0.12)",
    padding: "7px 16px",
    fontSize: 11, color: "#6b3d7a",
    display: "flex", alignItems: "center", gap: 5,
    fontFamily: "sans-serif", flexShrink: 0,
  },
  locationIcon: { fontSize: 13 },
  messages: {
    flex: 1, overflowY: "auto",
    padding: "18px 14px 8px",
    display: "flex", flexDirection: "column", gap: 10,
    backgroundImage: `
      radial-gradient(circle at 15% 15%, rgba(180,130,200,0.07) 0%, transparent 50%),
      radial-gradient(circle at 85% 85%, rgba(150,120,200,0.05) 0%, transparent 50%)
    `,
  },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 7 },
  botIcon: { fontSize: 15, color: "#9060b0", flexShrink: 0, marginBottom: 2 },
  botBubble: {
    background: "white",
    border: "1px solid rgba(160,110,190,0.2)",
    borderRadius: "18px 18px 18px 4px",
    padding: "11px 14px", fontSize: 14.5, lineHeight: 1.65,
    color: "#2a1a3a", maxWidth: "78%",
    boxShadow: "0 2px 12px rgba(100,50,130,0.09)",
    whiteSpace: "pre-wrap",
  },
  userBubble: {
    background: "linear-gradient(135deg, #3d1a4f, #6b2d6b)",
    borderRadius: "18px 18px 4px 18px",
    padding: "11px 14px", fontSize: 14.5, lineHeight: 1.65,
    color: "#f0e0ff", maxWidth: "78%",
    boxShadow: "0 2px 14px rgba(60,20,80,0.25)",
    whiteSpace: "pre-wrap",
  },
  suggestions: {
    display: "flex", flexWrap: "wrap", gap: 7,
    marginTop: 4, paddingLeft: 22,
  },
  suggestLabel: {
    width: "100%", fontSize: 10.5, color: "#9060b0",
    letterSpacing: "0.08em", textTransform: "uppercase",
    fontFamily: "sans-serif", marginBottom: 2,
  },
  chip: {
    background: "white",
    border: "1px solid rgba(160,110,190,0.35)",
    borderRadius: 20, padding: "7px 13px",
    fontSize: 12.5, color: "#4a2060",
    cursor: "pointer", fontFamily: "'Cormorant Garamond', serif",
    transition: "all 0.2s", lineHeight: 1,
  },
  inputArea: {
    display: "flex", alignItems: "flex-end", gap: 9,
    padding: "10px 14px 12px",
    background: "white",
    borderTop: "1px solid rgba(160,110,190,0.15)",
    flexShrink: 0,
  },
  textarea: {
    flex: 1, resize: "none",
    border: "1px solid rgba(160,110,190,0.3)",
    borderRadius: 22, padding: "10px 15px",
    fontSize: 14.5, fontFamily: "'Cormorant Garamond', serif",
    color: "#2a1a3a", background: "#fdf8ff", outline: "none",
    lineHeight: 1.5, overflowY: "hidden",
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: "50%",
    background: "linear-gradient(135deg, #3d1a4f, #8b3d8b)",
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, boxShadow: "0 4px 14px rgba(60,20,80,0.3)",
    transition: "all 0.2s",
  },
  footer: {
    textAlign: "center", padding: "6px 16px 10px",
    background: "white", flexShrink: 0,
    display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
  },
  footerLink: {
    fontSize: 12, color: "#6b2d6b",
    textDecoration: "none", fontFamily: "sans-serif",
    letterSpacing: "0.03em",
  },
  footerDivider: { color: "#ccc", fontSize: 14 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: #ede0f5; }
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-5px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .msg-appear { animation: fadeUp 0.3s ease forwards; opacity: 0; }
  .chip-btn:hover {
    background: #f8f0ff !important;
    border-color: rgba(120,60,160,0.5) !important;
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(100,40,130,0.12);
  }
  .send-btn:hover:not(:disabled) {
    transform: scale(1.07);
    box-shadow: 0 6px 18px rgba(60,20,80,0.4) !important;
  }
  .chat-input:focus {
    border-color: rgba(130,60,170,0.45) !important;
    box-shadow: 0 0 0 3px rgba(130,60,170,0.08);
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(120,60,160,0.2); border-radius: 4px; }
`;
