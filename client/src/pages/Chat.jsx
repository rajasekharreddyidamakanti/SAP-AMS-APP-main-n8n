// src/pages/Chat.jsx  — Rebuilt: author-based chat with email notification
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Card, Typography, TextField, IconButton, CircularProgress,
  Avatar, Divider, InputAdornment, Alert, List, ListItem,
  ListItemAvatar, ListItemText, Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:3001/api";
const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const ROLE_COLORS = {
  Admin: "#B71C1C", "Team Lead": "#6A1B9A", Expert: "#1565C0",
  "L2 Support": "#E65100", "L1 Support": "#2E7D32", Employee: "#37474F",
};
const avatarColor = (roles) => {
  const primary = Array.isArray(roles) ? roles[0] : roles;
  return ROLE_COLORS[primary] || "#37474F";
};

const MessageBubble = ({ message, isOwn }) => (
  <Box sx={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start", mb: 1.5 }}>
    {!isOwn && (
      <Avatar sx={{ width: 30, height: 30, mr: 1, mt: 0.5, backgroundColor: "#1565C0", fontSize: "0.75rem", flexShrink: 0 }}>
        {message.sender_name?.charAt(0)?.toUpperCase() || "U"}
      </Avatar>
    )}
    <Box sx={{ maxWidth: "65%" }}>
      {!isOwn && (
        <Typography variant="caption" sx={{ color: "#90A4AE", ml: 0.5, display: "block", mb: 0.3 }}>
          {message.sender_name}
        </Typography>
      )}
      <Box sx={{
        backgroundColor: isOwn ? "#1565C0" : "#F5F5F5",
        color: isOwn ? "#FFFFFF" : "#212121",
        borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        px: 2, py: 1.2,
      }}>
        <Typography variant="body2" sx={{ fontSize: "0.88rem", lineHeight: 1.5 }}>
          {message.content || message.message}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{
        color: "#B0BEC5", display: "block", mt: 0.3,
        textAlign: isOwn ? "right" : "left", ml: isOwn ? 0 : 0.5,
      }}>
        {new Date(message.sent_at || message.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </Typography>
    </Box>
  </Box>
);

const Chat = () => {
  const { user } = useAuth();
  const [contacts,    setContacts]    = useState([]);
  const [selected,    setSelected]    = useState(null);  // selected contact object
  const [sessionId,   setSessionId]   = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");

  const [searchParams] = useSearchParams();
  const startWith = searchParams.get("startWith");
  const [loadingCont, setLoadingCont] = useState(true);
  const [loadingMsg,  setLoadingMsg]  = useState(false);
  const [sending,     setSending]     = useState(false);
  const [error,       setError]       = useState("");
  const bottomRef = useRef(null);

  // ── Load messages whenever sessionId changes ─────────────────────
  const loadMessages = useCallback(async (sid) => {
    if (!sid) return;
    setLoadingMsg(true);
    try {
      const res = await axios.get(`${API}/chat/${sid}/messages`, authH());
      setMessages(res.data?.data || res.data || []);
    } catch { setMessages([]); }
    finally  { setLoadingMsg(false); }
  }, []);

  // ── Select a contact → start / get session  ─────────────────────
  const handleSelectContact = useCallback(async (contact) => {
    setSelected(contact);
    setMessages([]);
    setSessionId(null);
    setError("");
    try {
      // Create or get session + trigger email notification if new
      const res = await axios.post(
        `${API}/chat/start`,
        { recipient_id: contact.user_id, article_id: contact.article_id || null },
        authH()
      );
      const sid = res.data?.data?.session_id || res.data?.session_id;
      setSessionId(sid);
      if (sid) await loadMessages(sid);
    } catch (e) {
      setError(e.response?.data?.message || "Could not start chat.");
    }
  }, [loadMessages]);

  // ── Load article authors (contacts) ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/chat/contacts`, authH());
        let data = res.data?.data || res.data || [];
        data = data.filter((c) => c.user_id !== user?.user_id);
        
        if (startWith) {
          let preSelected = data.find(c => String(c.user_id) === String(startWith));
          if (!preSelected) {
            // Need to fetch user details if not in contacts
            const usrRes = await axios.get(`${API}/users`, authH());
            const allUsers = usrRes.data?.data || usrRes.data || [];
            preSelected = allUsers.find(c => String(c.user_id) === String(startWith) || String(c.id) === String(startWith));
            if (preSelected) {
                preSelected = { ...preSelected, user_id: preSelected.user_id || preSelected.id };
                data = [preSelected, ...data];
            }
          }
          if (preSelected) handleSelectContact(preSelected);
        }

        setContacts(data);
      } catch { setContacts([]); }
      finally   { setLoadingCont(false); }
    })();
  }, [user, startWith, handleSelectContact]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);



  // ── Send message ─────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !sessionId) return;
    setInput("");
    setSending(true);
    try {
      await axios.post(`${API}/chat/${sessionId}/messages`, { content: text }, authH());
      await loadMessages(sessionId);
    } catch { setError("Failed to send message."); }
    finally   { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 120px)" }}>
      {/* ── Left: Contacts ────────────────────────────────────────── */}
      <Card elevation={0} sx={{ width: 280, flexShrink: 0, border: "1px solid #E0E0E0", borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #EEEEEE" }}>
          <Typography variant="body1" sx={{ fontWeight: 700, color: "#0A1929", fontSize: "0.9rem" }}>
            Article Authors
          </Typography>
          <Typography variant="caption" sx={{ color: "#90A4AE" }}>
            Start a conversation with an expert
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {loadingCont ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress size={24} sx={{ color: "#1565C0" }} />
            </Box>
          ) : contacts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5, px: 2 }}>
              <PersonOutlineOutlinedIcon sx={{ fontSize: 40, color: "#CFD8DC", mb: 1 }} />
              <Typography variant="body2" sx={{ color: "#90A4AE" }}>No article authors found</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {contacts.map((c) => (
                <ListItem
                  key={c.user_id}
                  onClick={() => handleSelectContact(c)}
                  sx={{
                    py: 1.5, px: 2, cursor: "pointer",
                    backgroundColor: selected?.user_id === c.user_id ? "rgba(21,101,192,0.08)" : "transparent",
                    borderLeft: selected?.user_id === c.user_id ? "3px solid #1565C0" : "3px solid transparent",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                    transition: "all 0.15s ease",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 36, height: 36, backgroundColor: avatarColor(c.roles), fontSize: "0.9rem", fontWeight: 700 }}>
                      {c.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  {/* /<ListItemText
                   // primary={<Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0A1929" }}>{c.name}</Typography>}
                   // secondary={
                    //  <Chip label={c.department || "SAP AMS"} size="small"
                    //    sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#EEF2FF", color: "#3730A3", mt: 0.3 }} />
                   // }
                  ///> */}

                   {/* This has been added for testing the database */}
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0A1929" }}>{c.name}</Typography>}
                    secondary={
                      <>
                        <Chip label={c.department || "SAP AMS"} size="small"
                          sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#EEF2FF", color: "#3730A3", mt: 0.3 }} />
                        {c.phone_number && (
                          <Typography variant="caption" sx={{ display: "block", color: "#90A4AE", mt: 0.3 }}>
                            📞 {c.phone_number}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Card>

      {/* ── Right: Chat Window ───────────────────────────────────── */}
      <Card elevation={0} sx={{ flex: 1, border: "1px solid #E0E0E0", borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selected ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#90A4AE" }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 64, color: "#CFD8DC", mb: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#607D8B" }}>Select a contact to start chatting</Typography>
            <Typography variant="body2" sx={{ color: "#90A4AE", mt: 0.5 }}>
              Choose an article author from the left panel
            </Typography>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #EEEEEE", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, backgroundColor: avatarColor(selected?.roles), fontSize: "0.9rem", fontWeight: 700 }}>
                {selected.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "#0A1929", fontSize: "0.9rem" }}>{selected.name}</Typography>
                <Typography variant="caption" sx={{ color: "#90A4AE" }}>{selected.email}</Typography>
              </Box>
              <Box sx={{ ml: "auto" }}>
                <Chip label={selected.department || "SAP AMS"} size="small"
                  sx={{ fontSize: "0.72rem", backgroundColor: "#E3F2FD", color: "#1565C0" }} />
              </Box>
            </Box>

            {error && <Alert severity="error" onClose={() => setError("")} sx={{ mx: 2, mt: 1, borderRadius: "6px" }}>{error}</Alert>}

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
              {loadingMsg ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <CircularProgress size={28} sx={{ color: "#1565C0" }} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 6 }}>
                  <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: "#CFD8DC", mb: 2 }} />
                  <Typography variant="body2" sx={{ color: "#90A4AE" }}>
                    No messages yet. Start the conversation!
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#B0BEC5", display: "block", mt: 0.5 }}>
                    {selected.name} will receive an email notification.
                  </Typography>
                </Box>
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.message_id || i}
                    message={msg}
                    isOwn={msg.sender_id === user?.user_id || msg.sender_id === user?.id}
                  />
                ))
              )}
              <div ref={bottomRef} />
            </Box>

            <Divider />

            {/* Input */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <TextField fullWidth multiline maxRows={4} size="small"
                placeholder="Type a message… (Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!sessionId}
                InputProps={{
                  sx: {
                    borderRadius: "10px", backgroundColor: "#F5F7FA",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#1565C0" },
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSend} disabled={!input.trim() || sending || !sessionId}
                        sx={{
                          backgroundColor: "#1565C0", color: "#FFFFFF", width: 34, height: 34,
                          "&:hover": { backgroundColor: "#0D47A1" },
                          "&:disabled": { backgroundColor: "#E0E0E0", color: "#9E9E9E" },
                        }}>
                        {sending ? <CircularProgress size={16} sx={{ color: "#FFF" }} /> : <SendIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};

export default Chat;
