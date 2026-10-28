// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box, Typography, List, ListItem, ListItemIcon, ListItemText,
  Divider, Avatar, Chip, Collapse, Badge
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AddIcon from "@mui/icons-material/Add";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { getNotifications } from "../api/notifications";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";

// Color map for role chips
const ROLE_COLORS = {
  Admin:        { bg: "#B71C1C", text: "#FFFFFF" },
  "Team Lead":  { bg: "#6A1B9A", text: "#FFFFFF" },
  Expert:       { bg: "#1565C0", text: "#FFFFFF" },
  "L2 Support": { bg: "#E65100", text: "#FFFFFF" },
  "L1 Support": { bg: "#2E7D32", text: "#FFFFFF" },
  Employee:     { bg: "#37474F", text: "#FFFFFF" },
};

// Normalize roles
const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles.map((r) => (typeof r === "string" ? r : r?.role_name || ""));
};

// Nav item sx
const navItemSx = (isActive) => ({
  px: 2, py: 0.9, mx: 1, mb: 0.3, borderRadius: "6px", cursor: "pointer",
  borderLeft: isActive ? "3px solid #42A5F5" : "3px solid transparent",
  backgroundColor: isActive ? "rgba(66,165,245,0.18)" : "transparent",
  transition: "all 0.2s ease",
  "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", transform: "translateX(3px)" },
});

 

const NavLabel = ({ children, isActive, small }) => (
  <Typography sx={{ color: "#FFFFFF", fontSize: small ? "0.82rem" : "0.88rem", fontWeight: isActive ? 600 : 400 }}>
    {children}
  </Typography>
);

const SectionHeader = ({ label, open, onToggle }) => (
  <Box
    onClick={onToggle}
    sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      px: 3, mb: 0.5, mt: 1.5, cursor: "pointer",
      "&:hover": { "& .section-label": { color: "#90CAF9" } },
    }}
  >
    <Typography
      className="section-label"
      variant="caption"
      sx={{ color: "#607D8B", letterSpacing: 1, textTransform: "uppercase", fontSize: "0.62rem", fontWeight: 700, transition: "color 0.2s" }}
    >
      {label}
    </Typography>
    {open
      ? <ExpandLessIcon sx={{ fontSize: 14, color: "#607D8B" }} />
      : <ExpandMoreIcon sx={{ fontSize: 14, color: "#607D8B" }} />
    }
  </Box>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const roles = normalizeRoles(user?.roles);
  const isAdmin = roles.includes("Admin");

  const [sections, setSections] = useState({
    main: true,
    knowledgeBase: true,
    support: true,
    communication: true,
    transition: true,
    admin: true,
  });

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadN = async () => {
      try {
        const res = await getNotifications();
        const data = res.data || [];
        setUnreadCount(data.filter(n => !n.is_read).length);
      } catch {}
    };
    loadN();
    const interval = setInterval(loadN, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (key) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => { logout(); navigate("/login"); };

  const primaryRole = roles[0] || "Employee";
  const avatarBg = ROLE_COLORS[primaryRole]?.bg || "#37474F";
  const path = location.pathname;
  const is = (p) => path === p;
  const starts = (p) => path.startsWith(p);

  return (
    <Box sx={{
      width: 252, minHeight: "100vh", backgroundColor: "#0A1929",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* ── App Name ─────────────────────────────────────────────── */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #132337" }}>
        <Typography variant="h6" sx={{ color: "#FFFFFF", fontWeight: 700, letterSpacing: 1, fontSize: "0.98rem" }}>
          SAP AMS
        </Typography>
        <Typography variant="caption" sx={{ color: "#546E7A", display: "block", mt: 0.2, fontSize: "0.7rem" }}>
          Knowledge Platform
        </Typography>
      </Box>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <Box sx={{ flex: 1, py: 1.5, overflowY: "auto", "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#132337", borderRadius: 2 } }}>

        {/* ── Main ── */}
        <SectionHeader label="Main" open={sections.main} onToggle={() => toggleSection("main")} />
        <Collapse in={sections.main}>
          <List disablePadding>
            <ListItem onClick={() => navigate("/")} sx={navItemSx(is("/"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><DashboardOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={is("/")}>Dashboard</NavLabel>} />
            </ListItem>
            <ListItem onClick={() => navigate("/profile")} sx={navItemSx(is("/profile"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><AccountCircleOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={is("/profile")}>My Profile</NavLabel>} />
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ borderColor: "#132337", my: 0.5, mx: 2 }} />

        {/* ── Knowledge Base ── */}
        <SectionHeader label="Knowledge Base" open={sections.knowledgeBase} onToggle={() => toggleSection("knowledgeBase")} />
        <Collapse in={sections.knowledgeBase}>
          <List disablePadding>
            <ListItem onClick={() => navigate("/articles")} sx={navItemSx(starts("/articles") && !is("/articles/new"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><ArticleOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={starts("/articles") && !is("/articles/new")}>All Articles</NavLabel>} />
            </ListItem>
            <ListItem onClick={() => navigate("/articles/new")} sx={navItemSx(is("/articles/new"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><AddIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={is("/articles/new")}>Create Article</NavLabel>} />
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ borderColor: "#132337", my: 0.5, mx: 2 }} />

        {/* ── Support ── */}
        <SectionHeader label="Support" open={sections.support} onToggle={() => toggleSection("support")} />
        <Collapse in={sections.support}>
          <List disablePadding>
            <ListItem onClick={() => navigate("/support")} sx={navItemSx(is("/support"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><HelpOutlineOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={is("/support")}>My Requests</NavLabel>} />
            </ListItem>
            <ListItem onClick={() => navigate("/expert-requests")} sx={navItemSx(is("/expert-requests"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={is("/expert-requests")}>Expert Requests</NavLabel>} />
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ borderColor: "#132337", my: 0.5, mx: 2 }} />

        {/* ── Communication ── */}
        <SectionHeader label="Communication" open={sections.communication} onToggle={() => toggleSection("communication")} />
        <Collapse in={sections.communication}>
          <List disablePadding>
            <ListItem onClick={() => navigate("/chat")} sx={navItemSx(is("/chat"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><ChatBubbleOutlineIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={is("/chat")}>Chat</NavLabel>} />
            </ListItem>
            <ListItem onClick={() => navigate("/notifications")} sx={navItemSx(is("/notifications"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}>
                <Badge color="error" variant="dot" invisible={unreadCount === 0} sx={{ '& .MuiBadge-badge': { top: 3, right: 3 } }}>
                  <NotificationsNoneIcon sx={{ fontSize: 18 }} />
                </Badge>
              </ListItemIcon>
              <ListItemText primary={
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <NavLabel isActive={is("/notifications")}>Notifications</NavLabel>
                  {unreadCount > 0 && (
                    <Chip label={unreadCount} size="small" sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#D32F2F", color: "#FFF", fontWeight: "bold" }} />
                  )}
                </Box>
              } />
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ borderColor: "#132337", my: 0.5, mx: 2 }} />

        {/* ── Transition ── */}
        <SectionHeader label="Transition" open={sections.transition} onToggle={() => toggleSection("transition")} />
        <Collapse in={sections.transition}>
          <List disablePadding>
            <ListItem onClick={() => navigate("/transitions")} sx={navItemSx(is("/transitions"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><AssignmentOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={is("/transitions")}>Dashboard</NavLabel>} />
            </ListItem>
            <ListItem onClick={() => navigate("/certifications")} sx={navItemSx(is("/certifications"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={is("/certifications")}>Certifications</NavLabel>} />
            </ListItem>
            <ListItem onClick={() => navigate("/contacts")} sx={navItemSx(is("/contacts"))}>
              <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><ContactPhoneOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
              <ListItemText primary={<NavLabel isActive={is("/contacts")}>Key Contacts</NavLabel>} />
            </ListItem>
          </List>
        </Collapse>

        {/* ── Admin section ── */}
        {isAdmin && (
          <>
            <Divider sx={{ borderColor: "#132337", my: 0.5, mx: 2 }} />
            <SectionHeader label="Admin" open={sections.admin} onToggle={() => toggleSection("admin")} />
            <Collapse in={sections.admin}>
              <List disablePadding>
                <ListItem onClick={() => navigate("/admin")} sx={navItemSx(is("/admin"))}>
                  <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                  <ListItemText primary={<NavLabel isActive={is("/admin")}>Dashboard</NavLabel>} />
                </ListItem>
                <ListItem onClick={() => navigate("/admin/requests")} sx={navItemSx(is("/admin/requests"))}>
                  <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><HowToRegOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                  <ListItemText primary={<NavLabel isActive={is("/admin/requests")}>Users & Articles</NavLabel>} />
                </ListItem>
                <ListItem onClick={() => navigate("/admin/roles")} sx={navItemSx(is("/admin/roles"))}>
                  <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><ManageAccountsOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                  <ListItemText primary={<NavLabel isActive={is("/admin/roles")}>Manage Roles</NavLabel>} />
                </ListItem>
                <ListItem onClick={() => navigate("/admin/tags")} sx={navItemSx(is("/admin/tags"))}>
                  <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><LocalOfferOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                  <ListItemText primary={<NavLabel isActive={is("/admin/tags")}>Manage Tags</NavLabel>} />
                </ListItem>
                <ListItem onClick={() => navigate("/admin/teams")} sx={navItemSx(is("/admin/teams"))}>
                  <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><GroupsOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                  <ListItemText primary={<NavLabel isActive={is("/admin/teams")}>Support Teams</NavLabel>} />
                </ListItem>
                <ListItem onClick={() => navigate("/articles")} sx={navItemSx(false)}>
                  <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><ArticleOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                  <ListItemText primary={<NavLabel isActive={false}>Articles</NavLabel>} />
                </ListItem>
                <ListItem onClick={() => navigate("/admin/phone-directory")} sx={navItemSx(is("/admin/phone-directory"))}>
                  <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><PhoneOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                  <ListItemText primary={<NavLabel isActive={is("/admin/phone-directory")}>Phone Directory</NavLabel>} />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}
        {/* ── AI Search (all users) ── */}
        <Divider sx={{ borderColor: "#132337", my: 0.5, mx: 2 }} />
        <Box sx={{ px: 3, mb: 0.5, mt: 1.5 }}>
          <Typography variant="caption" sx={{ color: "#607D8B", letterSpacing: 1, textTransform: "uppercase", fontSize: "0.62rem", fontWeight: 700 }}>
            AI Tools
          </Typography>
        </Box>
        <List disablePadding>
          <ListItem onClick={() => navigate("/ai-search")} sx={navItemSx(is("/ai-search"))}>
            <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><AutoAwesomeIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary={<NavLabel isActive={is("/ai-search")}>AI Search</NavLabel>} />
          </ListItem>
          <ListItem onClick={() => navigate("/resume-iq")} sx={navItemSx(is("/resume-iq"))}>
            <ListItemIcon sx={{ minWidth: 32, color: "#90A4AE" }}><DescriptionOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary={<NavLabel isActive={is("/resume-iq")}>ResumeIQ</NavLabel>} />
          </ListItem>
        </List>
      </Box>

      {/* ── User card at bottom ──────────────────────────────────── */}
      <Divider sx={{ borderColor: "#132337" }} />
      <Box sx={{ px: 2.5, py: 1.8 }}>
        {/* Avatar + Name + Email */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Avatar sx={{ width: 34, height: 34, backgroundColor: avatarBg, fontSize: "0.85rem", fontWeight: 700, flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.82rem", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "User"}
            </Typography>
            <Typography sx={{ color: "#546E7A", fontSize: "0.7rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>

        {/* Role badges */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
          {roles.length ? (
            roles.map((role) => {
              const c = ROLE_COLORS[role] || { bg: "#37474F", text: "#FFFFFF" };
              return (
                <Chip key={role} label={role} size="small"
                  sx={{ backgroundColor: c.bg, color: c.text, fontSize: "0.63rem", fontWeight: 700, height: 18, borderRadius: "4px" }} />
              );
            })
          ) : (
            <Chip label="Employee" size="small"
              sx={{ backgroundColor: "#37474F", color: "#FFFFFF", fontSize: "0.63rem", fontWeight: 700, height: 18, borderRadius: "4px" }} />
          )}
        </Box>

        {/* Logout */}
        <Divider sx={{ borderColor: "#132337", mb: 0.8 }} />
        <ListItem
          onClick={handleLogout}
          sx={{
            px: 1, py: 0.5, borderRadius: "6px", cursor: "pointer",
            borderLeft: "3px solid transparent", transition: "all 0.2s ease",
            "&:hover": { backgroundColor: "rgba(244,67,54,0.12)", borderLeft: "3px solid #F44336", transform: "translateX(3px)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "#EF9A9A" }}>
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary={<Typography sx={{ color: "#EF9A9A", fontSize: "0.85rem", fontWeight: 500 }}>Logout</Typography>} />
        </ListItem>
      </Box>
    </Box>
  );
};

export default Sidebar;