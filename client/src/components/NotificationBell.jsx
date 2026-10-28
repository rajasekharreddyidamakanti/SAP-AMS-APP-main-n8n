// src/components/NotificationBell.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, IconButton, Badge, Typography, Divider, Button,
  List, ListItem, ListItemText, Paper, Popper, ClickAwayListener,
  CircularProgress,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { getNotifications, markAllNotificationsRead } from "../api/notifications";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const anchorRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications((res.data || []).slice(0, 8));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 60s
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (!open) loadNotifications();
    setOpen((prev) => !prev);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        size="small"
        sx={{
          color: "#637381",
          "&:hover": { backgroundColor: "rgba(21,101,192,0.08)" },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={9}
          sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}
        >
          <NotificationsNoneIcon sx={{ fontSize: 22 }} />
        </Badge>
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper
            elevation={8}
            sx={{
              width: 340, borderRadius: "12px", overflow: "hidden",
              border: "1px solid #E0E0E0",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              mt: 1,
            }}
          >
            {/* Header */}
            <Box sx={{ px: 2.5, py: 1.8, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEEEEE" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0A1929" }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Box sx={{
                    backgroundColor: "#FFEBEE", color: "#C62828", borderRadius: "10px",
                    px: 0.8, py: 0.1, fontSize: "0.65rem", fontWeight: 700,
                  }}>
                    {unreadCount} new
                  </Box>
                )}
              </Box>
              {unreadCount > 0 && (
                <Button size="small" onClick={handleMarkAll}
                  sx={{ textTransform: "none", color: "#1565C0", fontSize: "0.72rem", fontWeight: 600, p: 0, minWidth: "auto" }}>
                  Mark all read
                </Button>
              )}
            </Box>

            {/* Body */}
            <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={22} sx={{ color: "#1565C0" }} />
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <NotificationsNoneIcon sx={{ fontSize: 36, color: "#CFD8DC", mb: 1 }} />
                  <Typography variant="body2" sx={{ color: "#90A4AE" }}>No notifications</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {notifications.map((n, i) => {
                    const nId = n.notification_id || n.id;
                    return (
                      <Box key={nId}>
                        <ListItem
                          sx={{
                            px: 2.5, py: 1.5,
                            backgroundColor: n.is_read ? "transparent" : "#F8FAFE",
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#F4F6F8" },
                          }}
                        >
                          {!n.is_read && (
                            <FiberManualRecordIcon sx={{ fontSize: 8, color: "#1565C0", mr: 1, flexShrink: 0 }} />
                          )}
                          <ListItemText
                            primary={
                              <Typography variant="body2"
                                sx={{ fontWeight: n.is_read ? 400 : 600, color: "#0A1929", fontSize: "0.82rem", lineHeight: 1.4 }}>
                                {n.message || n.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                                {n.created_at ? new Date(n.created_at).toLocaleString("en-IN", {
                                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                                }) : ""}
                              </Typography>
                            }
                            sx={{ ml: n.is_read ? 1.5 : 0 }}
                          />
                        </ListItem>
                        {i < notifications.length - 1 && <Divider sx={{ mx: 2 }} />}
                      </Box>
                    );
                  })}
                </List>
              )}
            </Box>

            {/* Footer */}
            <Divider />
            <Box sx={{ px: 2.5, py: 1.2, textAlign: "center" }}>
              <Button
                onClick={handleViewAll} size="small"
                sx={{ textTransform: "none", color: "#1565C0", fontWeight: 600, fontSize: "0.8rem" }}
              >
                View all notifications
              </Button>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default NotificationBell;
