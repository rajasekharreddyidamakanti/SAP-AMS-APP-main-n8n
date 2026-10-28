// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Card, Typography, Button, CircularProgress,
  Divider, Chip, List, ListItem, ListItemText, Avatar,
} from "@mui/material";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getAllArticles } from "../api/articles";
import { getPendingUsers, getPendingRolesWithDetails } from "../api/roles";
import { getPendingTagsWithDetails } from "../api/tags";

const StatCard = ({ icon, label, value, color, subtitle, onClick }) => (
  <Card
    elevation={0}
    onClick={onClick}
    sx={{
      border: "1px solid #E0E0E0",
      borderRadius: "10px",
      p: 2.5,
      backgroundColor: "#FFFFFF",
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease",
      "&:hover": onClick ? { boxShadow: "0 4px 16px rgba(0,0,0,0.10)", transform: "translateY(-2px)" } : {},
    }}
  >
    <Box
      sx={{
        width: 48, height: 48, borderRadius: "10px",
        backgroundColor: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1 }}>
        {value ?? <CircularProgress size={18} />}
      </Typography>
      <Typography variant="body2" sx={{ color: "#637381", mt: 0.3, fontWeight: 500 }}>
        {label}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: color, fontWeight: 600 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Card>
);

const QuickCard = ({ title, items, onViewAll, emptyText, color = "#1565C0" }) => (
  <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", backgroundColor: "#FFFFFF" }}>
    <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body1" sx={{ fontWeight: 700, color: "#0A1929" }}>{title}</Typography>
      <Button size="small" onClick={onViewAll} sx={{ textTransform: "none", color, fontWeight: 600, fontSize: "0.8rem" }}>
        View All
      </Button>
    </Box>
    <Divider />
    {items.length === 0 ? (
      <Box sx={{ px: 3, py: 3, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "#90A4AE" }}>{emptyText || "Nothing pending"}</Typography>
      </Box>
    ) : (
      <List disablePadding>
        {items.slice(0, 5).map((item, i) => (
          <Box key={i}>
            <ListItem sx={{ px: 3, py: 1.2 }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1.5, backgroundColor: `${color}22`, color }}>
                {item.avatar}
              </Avatar>
              <ListItemText
                primary={<Typography variant="body2" sx={{ fontWeight: 600, color: "#0A1929", fontSize: "0.83rem" }}>{item.primary}</Typography>}
                secondary={<Typography variant="caption" sx={{ color: "#90A4AE" }}>{item.secondary}</Typography>}
              />
              {item.chip && (
                <Chip label={item.chip} size="small" sx={{ fontSize: "0.65rem", fontWeight: 700, height: 20, borderRadius: "4px", backgroundColor: `${color}18`, color }} />
              )}
            </ListItem>
            {i < Math.min(items.length, 5) - 1 && <Divider sx={{ mx: 3 }} />}
          </Box>
        ))}
      </List>
    )}
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingRoles, setPendingRoles] = useState([]);
  const [pendingTags, setPendingTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [art, users, roles, tags] = await Promise.allSettled([
          getAllArticles(),
          getPendingUsers(),
          getPendingRolesWithDetails(),
          getPendingTagsWithDetails(),
        ]);
        if (art.status === "fulfilled") setArticles(art.value.data || []);
        if (users.status === "fulfilled") setPendingUsers(users.value.data || []);
        if (roles.status === "fulfilled") setPendingRoles(roles.value.data || []);
        if (tags.status === "fulfilled") setPendingTags(tags.value.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingArticles = articles.filter((a) => a.status === "under_review");
  const publishedArticles = articles.filter((a) => a.status === "published");

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0A1929" }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: "#637381", mt: 0.3 }}>
          Platform overview — manage users, content, and permissions
        </Typography>
      </Box>

      {/* Pending Alerts Row */}
      {(pendingUsers.length > 0 || pendingArticles.length > 0 || pendingRoles.length > 0 || pendingTags.length > 0) && !loading && (
        <Box
          sx={{
            backgroundColor: "#FFF8E1", border: "1px solid #FFE082", borderRadius: "10px",
            px: 3, py: 1.5, mb: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
          }}
        >
          <TrendingUpIcon sx={{ color: "#F57F17", fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#F57F17" }}>
            Pending Actions:
          </Typography>
          {pendingUsers.length > 0 && (
            <Chip label={`${pendingUsers.length} Users`} size="small" onClick={() => navigate("/admin/requests")}
              sx={{ backgroundColor: "#E3F2FD", color: "#1565C0", fontWeight: 700, cursor: "pointer" }} />
          )}
          {pendingArticles.length > 0 && (
            <Chip label={`${pendingArticles.length} Articles`} size="small" onClick={() => navigate("/admin/requests")}
              sx={{ backgroundColor: "#E8F5E9", color: "#2E7D32", fontWeight: 700, cursor: "pointer" }} />
          )}
          {pendingRoles.length > 0 && (
            <Chip label={`${pendingRoles.length} Roles`} size="small" onClick={() => navigate("/admin/roles")}
              sx={{ backgroundColor: "#F3E5F5", color: "#6A1B9A", fontWeight: 700, cursor: "pointer" }} />
          )}
          {pendingTags.length > 0 && (
            <Chip label={`${pendingTags.length} Tags`} size="small" onClick={() => navigate("/admin/tags")}
              sx={{ backgroundColor: "#FFF3E0", color: "#E65100", fontWeight: 700, cursor: "pointer" }} />
          )}
        </Box>
      )}

      {/* Stats Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleOutlinedIcon sx={{ color: "#1565C0", fontSize: 24 }} />}
            label="Pending Users" value={loading ? null : pendingUsers.length}
            color="#1565C0" subtitle={pendingUsers.length > 0 ? "Awaiting approval" : "All clear"}
            onClick={() => navigate("/admin/requests")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ArticleOutlinedIcon sx={{ color: "#2E7D32", fontSize: 24 }} />}
            label="Pending Articles" value={loading ? null : pendingArticles.length}
            color="#2E7D32" subtitle={`${publishedArticles.length} published`}
            onClick={() => navigate("/admin/requests")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ManageAccountsOutlinedIcon sx={{ color: "#6A1B9A", fontSize: 24 }} />}
            label="Role Requests" value={loading ? null : pendingRoles.length}
            color="#6A1B9A" subtitle={pendingRoles.length > 0 ? "Awaiting review" : "None pending"}
            onClick={() => navigate("/admin/roles")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<LocalOfferOutlinedIcon sx={{ color: "#E65100", fontSize: 24 }} />}
            label="Tag Requests" value={loading ? null : pendingTags.length}
            color="#E65100" subtitle={pendingTags.length > 0 ? "Awaiting review" : "None pending"}
            onClick={() => navigate("/admin/tags")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ArticleOutlinedIcon sx={{ color: "#0277BD", fontSize: 24 }} />}
            label="Total Articles" value={loading ? null : articles.length}
            color="#0277BD" subtitle={`${publishedArticles.length} published`}
            onClick={() => navigate("/articles")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HelpOutlineOutlinedIcon sx={{ color: "#00838F", fontSize: 24 }} />}
            label="Support Requests" value="—"
            color="#00838F" subtitle="View all tickets"
            onClick={() => navigate("/support")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<VerifiedUserOutlinedIcon sx={{ color: "#558B2F", fontSize: 24 }} />}
            label="Expert Requests" value="—"
            color="#558B2F" subtitle="Pending expert review"
            onClick={() => navigate("/expert-requests")}
          />
        </Grid>
      </Grid>

      {/* Quick Panels */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <QuickCard
            title="Pending Users"
            color="#1565C0"
            onViewAll={() => navigate("/admin/requests")}
            emptyText="No users pending approval"
            items={pendingUsers.map((u) => ({
              avatar: u.name?.charAt(0)?.toUpperCase() || "U",
              primary: u.name || u.email,
              secondary: u.email,
              chip: "Pending",
            }))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickCard
            title="Pending Articles"
            color="#2E7D32"
            onViewAll={() => navigate("/admin/requests")}
            emptyText="No articles pending review"
            items={pendingArticles.map((a) => ({
              avatar: a.title?.charAt(0)?.toUpperCase() || "A",
              primary: a.title,
              secondary: a.module || "No module",
              chip: "Review",
            }))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickCard
            title="Pending Role Requests"
            color="#6A1B9A"
            onViewAll={() => navigate("/admin/roles")}
            emptyText="No role requests pending"
            items={pendingRoles.map((r) => ({
              avatar: r.user_name?.charAt(0)?.toUpperCase() || "R",
              primary: r.user_name || r.username,
              secondary: `Requested: ${r.role_name}`,
              chip: r.role_name,
            }))}
          />
        </Grid>
      </Grid>

      {/* Quick Navigation */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" sx={{ fontWeight: 700, color: "#0A1929", mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {[
            { label: "Manage Users & Approvals", path: "/admin/requests", color: "#1565C0" },
            { label: "Manage Roles", path: "/admin/roles", color: "#6A1B9A" },
            { label: "Manage Tags", path: "/admin/tags", color: "#E65100" },
            { label: "Knowledge Base", path: "/articles", color: "#2E7D32" },
          ].map((a) => (
            <Grid item xs={12} sm={6} md={3} key={a.path}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate(a.path)}
                sx={{
                  borderColor: a.color, color: a.color, borderRadius: "8px",
                  textTransform: "none", fontWeight: 600, py: 1.2,
                  "&:hover": { backgroundColor: `${a.color}0A`, borderColor: a.color },
                }}
              >
                {a.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
