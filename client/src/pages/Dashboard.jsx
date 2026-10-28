// src/pages/Dashboard.jsx
// This is the home page — shows stats about the knowledge base

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllArticles } from "../api/articles"; 
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { canCreate } from "../utils/roleUtils";

// Status chip styles
const STATUS_STYLES = {
  published: { label: "Published", color: "#2E7D32", bg: "#E8F5E9" },
  under_review: { label: "Under Review", color: "#E65100", bg: "#FFF3E0" },
  draft: { label: "Draft", color: "#37474F", bg: "#ECEFF1" },
  rejected: { label: "Rejected", color: "#C62828", bg: "#FFEBEE" },
};

// Single stat card component
const StatCard = ({ icon, label, value, color }) => (
  <Card
    elevation={0}
    sx={{
      border: "1px solid #E0E0E0",
      borderRadius: "6px",
      p: 3,
      backgroundColor: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "6px",
        backgroundColor: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1 }}
      >
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: "#637381", mt: 0.3 }}>
        {label}
      </Typography>
    </Box>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await getAllArticles();
        setArticles(res.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Calculate stats
  const total = articles.length;
  const published = articles.filter((a) => a.status === "published").length;
  const underReview = articles.filter((a) => a.status === "under_review").length;
  const drafts = articles.filter((a) => a.status === "draft").length;

  // 5 most recent articles
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size={32} sx={{ color: "#1565C0" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#0A1929" }}
          >
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#637381", mt: 0.3 }}>
            Here's an overview of the knowledge base
          </Typography>
        </Box>

        {/* Show Create button only if user has permission */}
        {canCreate(user) && (
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => navigate("/articles/new")}
            sx={{
              backgroundColor: "#1565C0",
              borderRadius: "4px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": { backgroundColor: "#0D47A1" },
            }}
          >
            New Article
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
          {error}
        </Alert>
      )}

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ArticleOutlinedIcon sx={{ color: "#1565C0", fontSize: 22 }} />}
            label="Total Articles"
            value={total}
            color="#1565C0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleOutlinedIcon sx={{ color: "#2E7D32", fontSize: 22 }} />}
            label="Published"
            value={published}
            color="#2E7D32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HourglassEmptyOutlinedIcon sx={{ color: "#E65100", fontSize: 22 }} />}
            label="Under Review"
            value={underReview}
            color="#E65100"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EditNoteOutlinedIcon sx={{ color: "#37474F", fontSize: 22 }} />}
            label="Drafts"
            value={drafts}
            color="#37474F"
          />
        </Grid>
      </Grid>

      {/* Recent articles */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Card header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: "#0A1929" }}
          >
            Recent Articles
          </Typography>
          <Button
            size="small"
            onClick={() => navigate("/articles")}
            sx={{
              textTransform: "none",
              color: "#1565C0",
              fontWeight: 500,
              fontSize: "0.8rem",
            }}
          >
            View All
          </Button>
        </Box>
        <Divider />

        {/* Article rows */}
        {recentArticles.length === 0 ? (
          <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#637381" }}>
              No articles found.
            </Typography>
          </Box>
        ) : (
          recentArticles.map((article, index) => {
            const statusStyle =
              STATUS_STYLES[article.status] || STATUS_STYLES.draft;
            return (
              <Box key={article.article_id}>
                <Box
                  onClick={() => navigate(`/articles/${article.article_id}`)}
                  sx={{
                    px: 3,
                    py: 1.8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#F9FAFB" },
                  }}
                >
                  {/* Title + module */}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#0A1929",
                        fontSize: "0.875rem",
                      }}
                    >
                      {article.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#637381" }}
                    >
                      {article.module} •{" "}
                      {new Date(article.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </Typography>
                  </Box>

                  {/* Status chip */}
                  <Chip
                    label={statusStyle.label}
                    size="small"
                    sx={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      fontWeight: 600,
                      fontSize: "0.65rem",
                      height: 22,
                      borderRadius: "4px",
                    }}
                  />
                </Box>
                {index < recentArticles.length - 1 && (
                  <Divider sx={{ mx: 3 }} />
                )}
              </Box>
            );
          })
        )}
      </Card>
    </Box>
  );
};

export default Dashboard;