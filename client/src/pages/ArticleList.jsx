// src/pages/ArticleList.jsx
// This is the main Knowledge Base page — shows all articles in a table with search

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllArticles, searchArticles } from "../api/articles";
import { canCreate } from "../utils/roleUtils";
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

// Status chip styles
const STATUS_STYLES = {
  published: { label: "Published", color: "#2E7D32", bg: "#E8F5E9" },
  under_review: { label: "Under Review", color: "#E65100", bg: "#FFF3E0" },
  draft: { label: "Draft", color: "#37474F", bg: "#ECEFF1" },
  rejected: { label: "Rejected", color: "#C62828", bg: "#FFEBEE" },
};

// Severity chip styles
const SEVERITY_STYLES = {
  critical: { label: "Critical", color: "#C62828", bg: "#FFEBEE" },
  high: { label: "High", color: "#E65100", bg: "#FFF3E0" },
  medium: { label: "Medium", color: "#1565C0", bg: "#E3F2FD" },
  low: { label: "Low", color: "#2E7D32", bg: "#E8F5E9" },
};

const ArticleList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch all articles on load
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllArticles();
      setArticles(res.data);
    } catch (err) {
      setError("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  };

  // Search articles
  const handleSearch = async () => {
    if (!keyword.trim()) {
      fetchArticles();
      return;
    }
    try {
      setSearching(true);
      setError("");
      const res = await searchArticles(keyword);
      setArticles(res.data);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setKeyword("");
    fetchArticles();
  };

  // Search on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Filter articles by module and status
  const filteredArticles = articles.filter((a) => {
    const matchModule = moduleFilter === "All" || a.module === moduleFilter;
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchModule && matchStatus;
  });

  // Get unique modules for filter dropdown
  const modules = ["All", ...new Set(articles.map((a) => a.module).filter(Boolean))];

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
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0A1929" }}>
            Knowledge Base
          </Typography>
          <Typography variant="body2" sx={{ color: "#637381", mt: 0.3 }}>
            {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} found
          </Typography>
        </Box>

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

      {/* Search + Filter bar */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
          mb: 2,
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Search bar */}
          <TextField
            size="small"
            placeholder="Search articles..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ flex: 1, minWidth: 200, backgroundColor: "#FAFAFA" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ fontSize: 18, color: "#637381" }} />
                </InputAdornment>
              ),
              endAdornment: keyword && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Search button */}
          <Button
            variant="outlined"
            onClick={handleSearch}
            disabled={searching}
            sx={{
              borderRadius: "4px",
              textTransform: "none",
              borderColor: "#E0E0E0",
              color: "#0A1929",
              fontWeight: 500,
              fontSize: "0.85rem",
              "&:hover": { borderColor: "#1565C0", color: "#1565C0" },
            }}
          >
            {searching ? <CircularProgress size={16} /> : "Search"}
          </Button>

          <Divider orientation="vertical" flexItem />

          {/* Module filter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              displayEmpty
              sx={{ fontSize: "0.85rem", backgroundColor: "#FAFAFA" }}
            >
              {modules.map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: "0.85rem" }}>
                  {m === "All" ? "All Modules" : m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status filter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{ fontSize: "0.85rem", backgroundColor: "#FAFAFA" }}
            >
              {["All", "published", "under_review", "draft", "rejected"].map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: "0.85rem" }}>
                  {s === "All" ? "All Statuses" : STATUS_STYLES[s]?.label || s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Articles table */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "#1565C0" }} />
          </Box>
        ) : filteredArticles.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#637381" }}>
              No articles found.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              {/* Table header */}
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F4F6F8" }}>
                  {["Title", "Module", "Severity", "Status", "Date", ""].map(
                    (col) => (
                      <TableCell
                        key={col}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          color: "#637381",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          py: 1.2,
                          borderBottom: "1px solid #E0E0E0",
                        }}
                      >
                        {col}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>

              {/* Table body */}
              <TableBody>
                {filteredArticles.map((article, index) => {
                  const statusStyle =
                    STATUS_STYLES[article.status] || STATUS_STYLES.draft;
                  const severityStyle =
                    SEVERITY_STYLES[article.severity] || SEVERITY_STYLES.low;

                  return (
                    <TableRow
                      key={article.article_id}
                      sx={{
                        backgroundColor:
                          index % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                        "&:hover": { backgroundColor: "#F0F4F8" },
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate(`/articles/${article.article_id}`)
                      }
                    >
                      {/* Title */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: "#0A1929",
                            fontSize: "0.85rem",
                          }}
                        >
                          {article.title}
                        </Typography>
                        {article.summary && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#637381",
                              display: "block",
                              mt: 0.2,
                            }}
                          >
                            {article.summary.length > 60
                              ? article.summary.slice(0, 60) + "..."
                              : article.summary}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Module */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "#637381", fontSize: "0.85rem" }}
                        >
                          {article.module || "—"}
                        </Typography>
                      </TableCell>

                      {/* Severity */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Chip
                          label={severityStyle.label}
                          size="small"
                          sx={{
                            backgroundColor: severityStyle.bg,
                            color: severityStyle.color,
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            height: 20,
                            borderRadius: "4px",
                          }}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Chip
                          label={statusStyle.label}
                          size="small"
                          sx={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            height: 20,
                            borderRadius: "4px",
                          }}
                        />
                      </TableCell>

                      {/* Date */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#637381" }}
                        >
                          {new Date(article.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </Typography>
                      </TableCell>

                      {/* View button */}
                      <TableCell sx={{ py: 1.2 }} align="right">
                        <IconButton
                          size="small"
                          sx={{ color: "#637381" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/articles/${article.article_id}`);
                          }}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
};

export default ArticleList;