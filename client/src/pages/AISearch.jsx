// src/pages/AISearch.jsx
import { useState } from "react";
import {
  Box, Card, Typography, TextField, Button, CircularProgress,
  Alert, Chip, InputAdornment, IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:3001/api";
const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const SEVERITY_COLORS = {
  critical: { bg: "#FDEDED", color: "#C62828" },
  high:     { bg: "#FFF3E0", color: "#E65100" },
  medium:   { bg: "#FFF8E1", color: "#F57F17" },
  low:      { bg: "#E8F5E9", color: "#2E7D32" },
};

const AISearch = () => {
  const navigate = useNavigate();
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults(null); setSummary("");
    try {
      const res = await axios.post(`${API}/ai-search`, { query }, authH());
      const data = res.data?.data || res.data;
      // Backend returns { answer, sources, article? } directly
      setSummary(data?.answer || data?.summary || "");
      // sources = [{ article_id, title, similarity }]
      setResults(data?.sources || data?.articles || data?.results || []);
    } catch (e) {
      setError(e.response?.data?.message || "AI search failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  const clearSearch = () => { setQuery(""); setResults(null); setSummary(""); setError(""); };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: { xs: 2, md: 0 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "#E8EAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AutoAwesomeIcon sx={{ color: "#3949AB", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1.2 }}>AI-Powered Search</Typography>
          <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.3 }}>Ask a question — Gemini will find the best answers from the knowledge base</Typography>
        </Box>
      </Box>

      {/* Search bar */}
      <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "16px", p: 2.5, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder='e.g. "How to fix MIRO invoice posting error in FI module?"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#90A4AE" }} /></InputAdornment>,
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                </InputAdornment>
              ) : null,
              sx: { borderRadius: "10px", backgroundColor: "#FAFAFA" },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <AutoAwesomeIcon />}
            sx={{
              textTransform: "none", fontWeight: 700, backgroundColor: "#3949AB",
              borderRadius: "10px", px: 3, py: 1.6, whiteSpace: "nowrap",
              "&:hover": { backgroundColor: "#303F9F" },
            }}
          >
            {loading ? "Searching…" : "Search"}
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
          {["MIRO posting error", "FI integration issue", "MM goods receipt", "SAP BASIS configuration"].map((q) => (
            <Chip key={q} label={q} size="small" clickable onClick={() => setQuery(q)}
              sx={{ fontSize: "0.75rem", backgroundColor: "#F0F4FF", color: "#3949AB", "&:hover": { backgroundColor: "#E8EAF6" } }} />
          ))}
        </Box>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>{error}</Alert>}

      {/* AI Summary */}
      {summary && (
        <Card elevation={0} sx={{ border: "1px solid #C5CAE9", borderRadius: "12px", p: 3, mb: 3, background: "linear-gradient(135deg, #E8EAF6 0%, #EDE7F6 100%)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <AutoAwesomeIcon sx={{ color: "#3949AB", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1A237E" }}>AI Summary</Typography>
          </Box>
          <Typography sx={{ color: "#283593", fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{summary}</Typography>
        </Card>
      )}

      {/* Results */}
      {results !== null && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <ArticleOutlinedIcon sx={{ fontSize: 20, color: "#42A5F5" }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0A1929" }}>
              {results.length} Related Article{results.length !== 1 ? "s" : ""} Found
            </Typography>
          </Box>

          {results.length === 0 ? (
            <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", py: 8, textAlign: "center" }}>
              <SearchIcon sx={{ fontSize: 48, color: "#CFD8DC", mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#90A4AE", fontWeight: 500 }}>No matching articles found</Typography>
              <Typography variant="body2" sx={{ color: "#B0BEC5", mt: 0.5 }}>Try rephrasing your question</Typography>
            </Card>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {results.map((article, i) => {
                const sevCfg = article.severity ? SEVERITY_COLORS[article.severity] : null;
                return (
                  <Card
                    key={article.article_id || i}
                    elevation={0}
                    onClick={() => navigate(`/articles/${article.article_id}`)}
                    sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 2.5, cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: "#90CAF9", backgroundColor: "#F8FAFF", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(21,101,192,0.08)" } }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.75 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0A1929", flex: 1, pr: 1 }}>
                        {article.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {sevCfg && <Chip label={article.severity} size="small" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, ...sevCfg, textTransform: "capitalize" }} />}
                        {article.module && <Chip label={article.module} size="small" sx={{ height: 20, fontSize: "0.68rem", backgroundColor: "#E3F2FD", color: "#1565C0" }} />}
                      </Box>
                    </Box>
                    {article.summary && (
                      <Typography variant="body2" sx={{ color: "#607D8B", fontSize: "0.83rem", mb: 1, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {article.summary}
                      </Typography>
                    )}
                    {article.tags?.length > 0 && (
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 0.75 }}>
                        {article.tags.slice(0, 5).map((tag) => (
                          <Chip key={tag} label={tag} size="small"
                            sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#F4F6F8", color: "#637381", border: "1px solid #E0E0E0" }} />
                        ))}
                      </Box>
                    )}
                    <Typography variant="caption" sx={{ color: "#B0BEC5", display: "block" }}>
                      Relevance: {article.similarity != null ? `${Math.round(article.similarity * 100)}%` : article.score != null ? `${Math.round(article.score * 100)}%` : "—"}
                    </Typography>
                  </Card>
                );
              })}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AISearch;
