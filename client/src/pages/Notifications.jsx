// src/pages/Notifications.jsx
import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Button, Chip, CircularProgress,
  List, ListItem, ListItemText, ListItemIcon, Divider, Alert,
  IconButton, Tooltip,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api/notifications";

const TYPE_COLORS = {
  role_request: "#6A1B9A",
  tag_request:  "#E65100",
  article:      "#1565C0",
  support:      "#00838F",
  expert:       "#2E7D32",
  system:       "#37474F",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getNotifications();
      // Backend wraps in { success, data: [...] }
      const list = res.data?.data ?? res.data;
      setNotifications(Array.isArray(list) ? list : []);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id || n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      setError("Failed to mark as read.");
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      setError("Failed to mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0A1929" }}>
              Notifications
            </Typography>
            {unread > 0 && (
              <Chip
                label={`${unread} unread`}
                size="small"
                sx={{ backgroundColor: "#FFEBEE", color: "#C62828", fontWeight: 700, fontSize: "0.72rem", height: 22 }}
              />
            )}
          </Box>
          <Typography variant="body2" sx={{ color: "#637381", mt: 0.3 }}>
            Stay updated on platform activity
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={load} size="small" sx={{ border: "1px solid #E0E0E0", borderRadius: "6px" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {unread > 0 && (
            <Button
              variant="outlined" size="small" startIcon={<DoneAllIcon fontSize="small" />}
              onClick={handleMarkAllRead} disabled={markingAll}
              sx={{
                borderColor: "#1565C0", color: "#1565C0", borderRadius: "6px",
                textTransform: "none", fontWeight: 600,
                "&:hover": { backgroundColor: "#E3F2FD" },
              }}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2, borderRadius: "6px" }}>{error}</Alert>}

      <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", backgroundColor: "#FFFFFF" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "#1565C0" }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <NotificationsNoneIcon sx={{ fontSize: 56, color: "#CFD8DC", mb: 2 }} />
            <Typography variant="body1" sx={{ color: "#90A4AE", fontWeight: 500 }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#B0BEC5", mt: 0.5 }}>
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((n, i) => {
              const isRead = n.is_read;
              const nId = n.notification_id || n.id;
              const color = TYPE_COLORS[n.type] || TYPE_COLORS.system;

              return (
                <Box key={nId}>
                  <ListItem
                    onClick={() => !isRead && handleMarkRead(nId)}
                    sx={{
                      px: 3, py: 2,
                      backgroundColor: isRead ? "transparent" : "#F8FAFE",
                      cursor: isRead ? "default" : "pointer",
                      transition: "background-color 0.2s",
                      "&:hover": { backgroundColor: "#F4F6F8" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box
                        sx={{
                          width: 36, height: 36, borderRadius: "50%",
                          backgroundColor: `${color}18`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <NotificationsNoneIcon sx={{ color, fontSize: 18 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: isRead ? 400 : 700, color: "#0A1929", fontSize: "0.88rem" }}>
                            {n.message || n.title}
                          </Typography>
                          {!isRead && (
                            <FiberManualRecordIcon sx={{ fontSize: 8, color: "#1565C0" }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: "#90A4AE" }}>
                          {n.type && (
                            <Chip
                              label={n.type.replace(/_/g, " ")}
                              size="small"
                              sx={{ mr: 1, backgroundColor: `${color}18`, color, fontWeight: 700, fontSize: "0.6rem", height: 18, borderRadius: "3px" }}
                            />
                          )}
                          {n.created_at ? new Date(n.created_at).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          }) : ""}
                        </Typography>
                      }
                    />
                    {!isRead && (
                      <Tooltip title="Mark as read">
                        <Button
                          size="small" variant="text"
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(nId); }}
                          sx={{ textTransform: "none", color: "#1565C0", fontSize: "0.75rem", minWidth: "auto", fontWeight: 600 }}
                        >
                          Read
                        </Button>
                      </Tooltip>
                    )}
                  </ListItem>
                  {i < notifications.length - 1 && <Divider sx={{ mx: 3 }} />}
                </Box>
              );
            })}
          </List>
        )}
      </Card>
    </Box>
  );
};

export default Notifications;
