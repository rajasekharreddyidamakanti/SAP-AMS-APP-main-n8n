// src/components/Topbar.jsx
// This is the top header bar that appears on all pages

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box, Typography, IconButton, Tooltip, Chip,
} from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import NotificationBell from "./NotificationBell";

// Maps URL path to a readable page title
const PAGE_TITLES = {
  "/": "Dashboard",
  "/admin": "Admin Dashboard",
  "/articles": "Knowledge Base",
  "/articles/new": "Create Article",
  "/support": "Support Requests",
  "/expert-requests": "Expert Requests",
  "/chat": "Chat",
  "/notifications": "Notifications",
  "/transitions": "Transition Dashboard",
  "/admin/requests": "User & Article Approvals",
  "/admin/roles": "Manage Roles",
  "/admin/tags": "Manage Tags",
  "/profile": "My Profile",
};

// Role chip colors — same as sidebar
const ROLE_COLORS = {
  Admin: "#F44336",
  "Team Lead": "#9C27B0",
  Expert: "#1565C0",
  "L2 Support": "#F57C00",
  "L1 Support": "#388E3C",
  Employee: "#607D8B",
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    if (location.pathname.endsWith("/edit")) return "Edit Article";
    if (location.pathname.startsWith("/articles/") && location.pathname !== "/articles/new")
      return "Article Details";
    return PAGE_TITLES[location.pathname] || "SAP AMS";
  };

  // Get primary role from array
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const primaryRole = roles[0] || user?.role || "Employee";

  return (
    <Box
      sx={{
        height: 56,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E0E0E0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        flexShrink: 0,
      }}
    >
      {/* Left — Page title */}
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "#0A1929", fontSize: "0.95rem" }}
      >
        {getPageTitle()}
      </Typography>

      {/* Right — Bell + User info + logout */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {/* Notification Bell */}
        <NotificationBell />

        {/* Separator */}
        <Box sx={{ width: 1, height: 20, backgroundColor: "#E0E0E0" }} />

        {/* User name */}
        <Typography variant="body2" sx={{ color: "#637381", fontSize: "0.85rem" }}>
          {user?.name || "User"}
        </Typography>

        {/* Role chip */}
        <Chip
          label={primaryRole}
          size="small"
          sx={{
            backgroundColor: ROLE_COLORS[primaryRole] || "#607D8B",
            color: "#FFFFFF",
            fontSize: "0.65rem",
            fontWeight: 600,
            height: 20,
            borderRadius: "4px",
          }}
        />

        {/* Logout button */}
        <Tooltip title="Sign Out">
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{
              color: "#637381",
              "&:hover": { color: "#F44336", backgroundColor: "rgba(244, 67, 54, 0.08)" },
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Topbar;