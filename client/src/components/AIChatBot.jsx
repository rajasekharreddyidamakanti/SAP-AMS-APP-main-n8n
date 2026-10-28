// src/components/AIChatBot.jsx
// Floating AI assistant widget — available on every page for all users
import { useState, useRef, useEffect } from "react";
import {
  Box, Typography, IconButton, TextField, Tooltip,
  CircularProgress, Avatar, Fade, Chip,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import MinimizeIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useNavigate } from "react-router-dom";
import { sendBotMessage } from "../api/aibot";
import { useAuth } from "../context/AuthContext";

// ── Markdown-lite renderer ──────────────────────────────────────────────────
// Renders **bold**, *italic*, `code`, bullet lists and numbered lists safely
const renderMarkdown = (text) => {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (!line.trim()) { i++; continue; }

    // Bullet list
    if (/^(?:\*|-) /.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^(?:\*|-) /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^(?:\*|-) /, ""));
        i++;
      }
      elements.push(
        <ul key={i} style={{ margin: "4px 0 4px 16px", padding: 0 }}>
          {items.map((t, j) => (
            <li key={j} style={{ fontSize: "0.83rem", color: "#E0E7EF", lineHeight: 1.6 }}>
              <InlineText text={t} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={i} style={{ margin: "4px 0 4px 16px", padding: 0 }}>
          {items.map((t, j) => (
            <li key={j} style={{ fontSize: "0.83rem", color: "#E0E7EF", lineHeight: 1.6 }}>
              <InlineText text={t} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Heading (### or ##)
    if (/^#{1,3} /.test(line.trim())) {
      const txt = line.trim().replace(/^#{1,3} /, "");
      elements.push(
        <Typography key={i} sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#90CAF9", mt: 1, mb: 0.3 }}>
          <InlineText text={txt} />
        </Typography>
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <Typography key={i} sx={{ fontSize: "0.83rem", color: "#E0E7EF", lineHeight: 1.65, mb: 0.4 }}>
        <InlineText text={line} />
      </Typography>
    );
    i++;
  }
  return elements;
};

// Renders inline **bold**, *italic*, `code`
const InlineText = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part))
          return <strong key={i} style={{ color: "#90CAF9" }}>{part.slice(2, -2)}</strong>;
        if (/^\*[^*]+\*$/.test(part))
          return <em key={i}>{part.slice(1, -1)}</em>;
        if (/^`[^`]+`$/.test(part))
          return (
            <code key={i} style={{
              backgroundColor: "rgba(144,202,249,0.15)", border: "1px solid rgba(144,202,249,0.2)",
              borderRadius: "3px", px: "3px", fontFamily: "monospace", fontSize: "0.78rem", color: "#80DEEA",
              padding: "1px 4px",
            }}>{part.slice(1, -1)}</code>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

// ── Suggested starter questions ─────────────────────────────────────────────
const SUGGESTIONS = [
  "How do I create an article?",
  "What is hypercare phase?",
  "How to raise a support ticket?",
  "Explain SAP FI module",
  "What is a KT session?",
];

// ── Main component ──────────────────────────────────────────────────────────
const AIChatBot = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! I'm **ARIA**, your SAP AMS AI assistant 👋\n\nI can help you with:\n- SAP module questions (FI, CO, MM, SD…)\n- Portal features and navigation\n- AMS processes and best practices\n- Troubleshooting and T-codes\n\nWhat can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setUnread(0);
    }
  }, [open, minimized]);

  const handleSend = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    const userMsg = { role: "user", text: msgText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Build history for API (exclude current message, skip the initial model greeting from history)
    const history = messages
      .filter((m, idx) => !(idx === 0 && m.role === "model")) // skip greeting
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await sendBotMessage(msgText, history);
      const botMsg = { role: "model", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
      if (!open || minimized) setUnread((n) => n + 1);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login", {
          replace: true,
          state: { message: "Your session has expired or is invalid. Please sign in again." },
        });
        return;
      }

      const errText = err.response?.data?.message || "Sorry, I ran into an error. Please try again.";
      setMessages((prev) => [...prev, { role: "model", text: errText, isError: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([{
      role: "model",
      text: "Hello again! I'm **ARIA**, your SAP AMS AI assistant 👋\n\nHow can I help you today?",
    }]);
    setInput("");
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <>
      {/* ── Floating bubble ── */}
      <Box
        sx={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1300,
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1.5,
        }}
      >
        {/* ── Chat panel ── */}
        <Fade in={open}>
          <Box
            sx={{
              width: 380, height: minimized ? 56 : 520,
              backgroundColor: "#0D1B2A",
              border: "1px solid rgba(66,165,245,0.25)",
              borderRadius: "16px",
              display: open ? "flex" : "none",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(66,165,245,0.1)",
              transition: "height 0.25s ease",
            }}
          >
            {/* Header */}
            <Box sx={{
              px: 2, py: 1.2,
              background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)",
              display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0,
            }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #42A5F5 0%, #AB47BC 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, boxShadow: "0 0 10px rgba(66,165,245,0.5)",
              }}>
                <AutoAwesomeIcon sx={{ fontSize: 18, color: "#fff" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.1 }}>ARIA</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#69F0AE", flexShrink: 0 }} />
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>SAP AMS AI Assistant</Typography>
                </Box>
              </Box>
              <Tooltip title="Reset conversation">
                <IconButton onClick={handleReset} size="small" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
                  <RestartAltIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={minimized ? "Expand" : "Minimize"}>
                <IconButton onClick={() => setMinimized((v) => !v)} size="small" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
                  <MinimizeIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#FF8A80" } }}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {!minimized && (
              <>
                {/* Messages */}
                <Box sx={{
                  flex: 1, overflowY: "auto", px: 2, py: 1.5,
                  display: "flex", flexDirection: "column", gap: 1.5,
                  "&::-webkit-scrollbar": { width: 4 },
                  "&::-webkit-scrollbar-thumb": { backgroundColor: "#132337", borderRadius: 2 },
                }}>
                  {messages.map((msg, idx) => (
                    <Box key={idx} sx={{
                      display: "flex", gap: 1,
                      flexDirection: msg.role === "user" ? "row-reverse" : "row",
                      alignItems: "flex-end",
                    }}>
                      {/* Avatar */}
                      {msg.role === "model" ? (
                        <Box sx={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: "linear-gradient(135deg, #42A5F5 0%, #AB47BC 100%)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <AutoAwesomeIcon sx={{ fontSize: 14, color: "#fff" }} />
                        </Box>
                      ) : (
                        <Avatar sx={{ width: 28, height: 28, fontSize: "0.72rem", fontWeight: 700, backgroundColor: "#1565C0", flexShrink: 0 }}>
                          {avatarLetter}
                        </Avatar>
                      )}

                      {/* Bubble */}
                      <Box sx={{
                        maxWidth: "78%",
                        backgroundColor: msg.role === "user"
                          ? "rgba(21,101,192,0.85)"
                          : msg.isError
                            ? "rgba(183,28,28,0.3)"
                            : "rgba(255,255,255,0.07)",
                        border: msg.role === "user"
                          ? "1px solid rgba(66,165,245,0.3)"
                          : msg.isError
                            ? "1px solid rgba(229,115,115,0.3)"
                            : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: msg.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        px: 1.5, py: 1,
                      }}>
                        {msg.role === "model"
                          ? renderMarkdown(msg.text)
                          : <Typography sx={{ fontSize: "0.83rem", color: "#E3F2FD", lineHeight: 1.6 }}>{msg.text}</Typography>
                        }
                      </Box>
                    </Box>
                  ))}

                  {/* Loading indicator */}
                  {loading && (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "linear-gradient(135deg, #42A5F5 0%, #AB47BC 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <AutoAwesomeIcon sx={{ fontSize: 14, color: "#fff" }} />
                      </Box>
                      <Box sx={{
                        backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "14px 14px 14px 2px", px: 1.5, py: 1,
                        display: "flex", gap: 0.5, alignItems: "center",
                      }}>
                        {[0, 1, 2].map((d) => (
                          <Box key={d} sx={{
                            width: 6, height: 6, borderRadius: "50%", backgroundColor: "#42A5F5",
                            animation: "bounce 1.2s infinite",
                            animationDelay: `${d * 0.2}s`,
                            "@keyframes bounce": {
                              "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                              "40%": { transform: "scale(1)", opacity: 1 },
                            },
                          }} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Suggestions (only on first message) */}
                {messages.length === 1 && !loading && (
                  <Box sx={{ px: 2, pb: 1, display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                    {SUGGESTIONS.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        size="small"
                        onClick={() => handleSend(s)}
                        sx={{
                          backgroundColor: "rgba(66,165,245,0.1)",
                          border: "1px solid rgba(66,165,245,0.25)",
                          color: "#90CAF9", fontSize: "0.72rem", cursor: "pointer",
                          "&:hover": { backgroundColor: "rgba(66,165,245,0.2)", borderColor: "rgba(66,165,245,0.5)" },
                          transition: "all 0.15s",
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Input row */}
                <Box sx={{
                  px: 1.5, py: 1.2,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", gap: 1, alignItems: "flex-end",
                  backgroundColor: "rgba(0,0,0,0.2)",
                }}>
                  <TextField
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    maxRows={4}
                    size="small"
                    placeholder="Ask ARIA anything about SAP AMS…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                        fontSize: "0.83rem",
                        color: "#E0E7EF",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                        "&:hover fieldset": { borderColor: "rgba(66,165,245,0.4)" },
                        "&.Mui-focused fieldset": { borderColor: "#42A5F5" },
                      },
                      "& .MuiInputBase-input::placeholder": { color: "#546E7A", opacity: 1 },
                    }}
                  />
                  <IconButton
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    sx={{
                      width: 38, height: 38, flexShrink: 0,
                      background: (input.trim() && !loading)
                        ? "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)"
                        : "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(66,165,245,0.3)",
                      borderRadius: "10px",
                      "&:hover": { background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)" },
                      transition: "all 0.2s",
                    }}
                  >
                    {loading
                      ? <CircularProgress size={16} sx={{ color: "#42A5F5" }} />
                      : <SendIcon sx={{ fontSize: 17, color: (input.trim() && !loading) ? "#fff" : "#546E7A" }} />
                    }
                  </IconButton>
                </Box>
              </>
            )}
          </Box>
        </Fade>

        {/* ── Floating Bubble Button ── */}
        <Tooltip title={open ? "" : "Ask ARIA — AI Assistant"} placement="left">
          <Box
            onClick={() => { setOpen((v) => !v); setMinimized(false); }}
            sx={{
              width: 56, height: 56, borderRadius: "50%", cursor: "pointer",
              background: open
                ? "linear-gradient(135deg, #37474F 0%, #455A64 100%)"
                : "linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: open
                ? "0 4px 20px rgba(0,0,0,0.4)"
                : "0 4px 20px rgba(21,101,192,0.5), 0 0 0 0 rgba(66,165,245,0.4)",
              animation: !open ? "pulse 2.5s infinite" : "none",
              "@keyframes pulse": {
                "0%": { boxShadow: "0 4px 20px rgba(21,101,192,0.5), 0 0 0 0 rgba(66,165,245,0.4)" },
                "70%": { boxShadow: "0 4px 20px rgba(21,101,192,0.5), 0 0 0 12px rgba(66,165,245,0)" },
                "100%": { boxShadow: "0 4px 20px rgba(21,101,192,0.5), 0 0 0 0 rgba(66,165,245,0)" },
              },
              transition: "all 0.2s ease",
              "&:hover": { transform: "scale(1.1)" },
              position: "relative",
            }}
          >
            {open
              ? <CloseIcon sx={{ color: "#fff", fontSize: 24 }} />
              : <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 26 }} />
            }
            {/* Unread badge */}
            {!open && unread > 0 && (
              <Box sx={{
                position: "absolute", top: -2, right: -2,
                width: 18, height: 18, borderRadius: "50%",
                backgroundColor: "#F44336", border: "2px solid #F4F6F8",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Typography sx={{ color: "#fff", fontSize: "0.6rem", fontWeight: 700 }}>{unread}</Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
      </Box>
    </>
  );
};

export default AIChatBot;
