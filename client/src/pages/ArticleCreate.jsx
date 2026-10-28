// src/pages/ArticleCreate.jsx
// Any authenticated user can create articles — admin approval still required before publishing

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createArticle, uploadAttachment, getUsers } from "../api/articles";
import {
  Box, Card, Typography, TextField, Button, Select, MenuItem,
  FormControl, FormLabel, Chip, Alert, CircularProgress,
  Divider, Grid, IconButton, OutlinedInput,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const SAP_MODULES = [
  "Finance (FI)", "Controlling (CO)", "Human Resources (HR)",
  "Materials Management (MM)", "Sales & Distribution (SD)",
  "Production Planning (PP)", "Quality Management (QM)",
  "Plant Maintenance (PM)", "Project System (PS)", "BASIS",
];
const SEVERITIES = ["critical", "high", "medium", "low"];
const STATUSES   = ["draft", "under_review"];
const VISIBILITY_OPTIONS = ["public", "private", "restricted"];
const DEPARTMENTS = ["Finance", "HR", "MM", "SD", "PP", "QM", "PM"];

const ArticleCreate = () => {
  const navigate   = useNavigate();
  // Any logged-in user can create articles

  const [form, setForm] = useState({
    title: "", summary: "", content: "",
    modules: [],          // multi-select
    severity: "medium", status: "draft",
    visibility: "public", visibility_role: "Employee",
    department: "", project_name: "", tags: [],
  });
  const [tagInput, setTagInput]   = useState("");
  const [files,    setFiles]      = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState("");

  // moved useEffect import to top
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsersList(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (err) {
        console.error("Failed to load users for co-author selection", err);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  // ── article-level tags ──────────────────────────────────────────
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(",", "");
      if (tag && !form.tags.includes(tag))
        setForm((p) => ({ ...p, tags: [...p.tags, tag] }));
      setTagInput("");
    }
  };
  const handleRemoveTag = (tag) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  // ── file handling ───────────────────────────────────────────────
  const handleFileChange = (e) =>
    setFiles((p) => [
      ...p,
      ...Array.from(e.target.files).map((f) => ({ file: f, tags: [], tagInput: "" })),
    ]);
  const handleRemoveFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));
  const handleFileTagInputChange = (i, v) =>
    setFiles((p) => p.map((f, idx) => (idx === i ? { ...f, tagInput: v } : f)));
  const handleFileTagKeyDown = (i, e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      setFiles((p) =>
        p.map((f, idx) => {
          if (idx !== i) return f;
          const tag = f.tagInput.trim().replace(",", "");
          if (!tag || f.tags.includes(tag)) return { ...f, tagInput: "" };
          return { ...f, tags: [...f.tags, tag], tagInput: "" };
        })
      );
    }
  };
  const handleRemoveFileTag = (i, tag) =>
    setFiles((p) =>
      p.map((f, idx) => (idx === i ? { ...f, tags: f.tags.filter((t) => t !== tag) } : f))
    );

  // ── submit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.content.trim()) { setError("Content is required."); return; }
    if (!form.visibility) { setError("Please select a visibility."); return; }
    if (!form.department) { setError("Please select a department."); return; }
    try {
      setLoading(true); setError("");
      // module: send as first selected or joined string (backend expects a string)
      const payload = {
        ...form,
        module: form.modules.join(", ") || "General",
        co_author_id: form.co_author_id || null, // send co_author_id if selected
      };
      const res = await createArticle(payload);
      const newId = res.data.article?.article_id || res.data?.article_id;
      if (files.length > 0 && newId)
        for (const { file, tags } of files)
          await uploadAttachment(newId, file, tags);
      navigate(`/articles/${newId}`);
    } catch (err) {
      const validationMessage = err.response?.data?.errors?.[0]?.msg;
      setError(validationMessage || err.response?.data?.message || "Failed to create article. Please try again.");
    } finally { setLoading(false); }
  };


  return (
    <Box>
      <Button startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate("/articles")}
        sx={{ textTransform: "none", color: "#637381", mb: 2, fontSize: "0.85rem", "&:hover": { color: "#0A1929" } }}>
        Back to Knowledge Base
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "4px" }}>{error}</Alert>}

      {/* Section 1 — Article Details */}
      <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "6px", mb: 2 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E0E0E0" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0A1929" }}>Article Details</Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>Title *</FormLabel>
              <TextField fullWidth size="small" placeholder="e.g. MIRO Invoice Posting Error — Solution"
                value={form.title} onChange={(e) => handleChange("title", e.target.value)}
                sx={{ mt: 0.5, backgroundColor: "#FAFAFA" }} />
            </Grid>
            <Grid item xs={12}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>Summary</FormLabel>
              <TextField fullWidth size="small" multiline rows={2}
                placeholder="Brief description of the issue and solution"
                value={form.summary} onChange={(e) => handleChange("summary", e.target.value)}
                sx={{ mt: 0.5, backgroundColor: "#FAFAFA" }} />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Section 2 — Classification */}
      <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "6px", mb: 2 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E0E0E0" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0A1929" }}>Classification</Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Grid container spacing={2.5}>
            {/* Project Name */}
            <Grid item xs={12}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>Project Name</FormLabel>
              <TextField fullWidth size="small" placeholder="e.g. S/4HANA Migration Phase 2"
                value={form.project_name} onChange={(e) => handleChange("project_name", e.target.value)}
                sx={{ mt: 0.5, backgroundColor: "#FAFAFA" }} />
            </Grid>

            {/* Multi-Module */}
            <Grid item xs={12} sm={6}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>SAP Module(s)</FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select
                  multiple
                  value={form.modules}
                  onChange={(e) => handleChange("modules", e.target.value)}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((v) => <Chip key={v} label={v} size="small" sx={{ height: 20, fontSize: "0.72rem" }} />)}
                    </Box>
                  )}
                  sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}
                >
                  {SAP_MODULES.map((m) => (
                    <MenuItem key={m} value={m} sx={{ fontSize: "0.875rem" }}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Department */}
            <Grid item xs={12} sm={6}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>Department</FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select value={form.department} onChange={(e) => handleChange("department", e.target.value)}
                  displayEmpty sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}>
                  <MenuItem value="" disabled sx={{ fontSize: "0.875rem" }}>Select department</MenuItem>
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d} sx={{ fontSize: "0.875rem" }}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Severity */}
            <Grid item xs={12} sm={6}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>Severity</FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select value={form.severity} onChange={(e) => handleChange("severity", e.target.value)}
                  sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}>
                  {SEVERITIES.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: "0.875rem", textTransform: "capitalize" }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>Status</FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select value={form.status} onChange={(e) => handleChange("status", e.target.value)}
                  sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}>
                  {STATUSES.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: "0.875rem" }}>
                      {s === "under_review" ? "Submit for Review" : "Save as Draft"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Visibility */}
            <Grid item xs={12} sm={6}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>Visibility</FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select value={form.visibility} onChange={(e) => handleChange("visibility", e.target.value)}
                  sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}>
                  {VISIBILITY_OPTIONS.map((v) => (
                    <MenuItem key={v} value={v} sx={{ fontSize: "0.875rem", textTransform: "capitalize" }}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Co-Author */}
            <Grid item xs={12} sm={6}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>Co-Author (Optional)</FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select value={form.co_author_id || ""} onChange={(e) => handleChange("co_author_id", e.target.value)}
                  displayEmpty sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}>
                  <MenuItem value="" sx={{ fontSize: "0.875rem", color: "#9e9e9e" }}>Select a co-author</MenuItem>
                  {usersList.map((u) => (
                    <MenuItem key={u.user_id} value={u.user_id} sx={{ fontSize: "0.875rem" }}>
                      {u.name} ({u.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}>Tags</FormLabel>
              <TextField fullWidth size="small" placeholder="Type a tag and press Enter (e.g. MIRO, invoice, FI)"
                value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                sx={{ mt: 0.5, backgroundColor: "#FAFAFA" }} />
              {form.tags.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  {form.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" onDelete={() => handleRemoveTag(tag)}
                      sx={{ backgroundColor: "#F4F6F8", color: "#637381", fontSize: "0.75rem", height: 24, borderRadius: "4px", border: "1px solid #E0E0E0" }} />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Section 3 — Content */}
      <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "6px", mb: 2 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E0E0E0" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0A1929" }}>Content *</Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5 }}>
          <TextField fullWidth multiline rows={12} label="Content"
            placeholder="Write the article content here..."
            value={form.content} onChange={(e) => handleChange("content", e.target.value)}
            sx={{ mt: 1, "& .MuiOutlinedInput-root": { backgroundColor: "#FAFAFA" } }} />
        </Box>
      </Card>

      {/* Section 4 — Attachments */}
      <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "6px", mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E0E0E0" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0A1929" }}>Attachments</Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Button component="label" variant="outlined" startIcon={<AttachFileOutlinedIcon />}
            sx={{ borderRadius: "4px", textTransform: "none", borderColor: "#E0E0E0", color: "#637381", fontSize: "0.85rem", "&:hover": { borderColor: "#1565C0", color: "#1565C0" } }}>
            Attach Files
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>
          {files.length > 0 && (
            <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {files.map((entry, index) => (
                <Box key={index} sx={{ p: 1.5, border: "1px solid #E0E0E0", borderRadius: "4px", backgroundColor: "#FAFAFA" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AttachFileOutlinedIcon sx={{ fontSize: 16, color: "#637381" }} />
                      <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "#0A1929" }}>{entry.file.name}</Typography>
                      <Typography variant="caption" sx={{ color: "#B0BEC5" }}>({(entry.file.size / 1024).toFixed(1)} KB)</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                      <CloseOutlinedIcon sx={{ fontSize: 14, color: "#637381" }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <TextField fullWidth size="small" placeholder="Tags for this file — type and press Enter"
                      value={entry.tagInput}
                      onChange={(e) => handleFileTagInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleFileTagKeyDown(index, e)}
                      sx={{ backgroundColor: "#FFFFFF" }} />
                    {entry.tags.length > 0 && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                        {entry.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small"
                            onDelete={() => handleRemoveFileTag(index, tag)}
                            sx={{ backgroundColor: "#F4F6F8", color: "#637381", fontSize: "0.72rem", height: 22, borderRadius: "4px", border: "1px solid #E0E0E0" }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Card>

      {/* Action buttons */}
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
        <Button onClick={() => navigate("/articles")}
          sx={{ textTransform: "none", borderRadius: "4px", color: "#637381", border: "1px solid #E0E0E0", px: 3, "&:hover": { borderColor: "#0A1929", color: "#0A1929" } }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}
          sx={{ backgroundColor: "#1565C0", borderRadius: "4px", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { backgroundColor: "#0D47A1" } }}>
          {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Create Article"}
        </Button>
      </Box>
    </Box>
  );
};

export default ArticleCreate;