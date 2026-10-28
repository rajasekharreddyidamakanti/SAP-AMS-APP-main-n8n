// src/pages/ArticleEdit.jsx
// This page is for editing an existing article — pre-fills all fields with current data

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticleById, updateArticle, uploadAttachment } from "../api/articles";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const MODULES = [
  "Finance", "HR", "Supply Chain", "Sales",
  "Procurement", "Production", "Quality Management", "Plant Maintenance",
];
const SEVERITIES = ["critical", "high", "medium", "low"];
const STATUSES = ["draft", "under_review", "published"];
const VISIBILITY_ROLES = ["Employee", "L1 Support", "L2 Support", "Expert", "Team Lead", "Admin"];
const DEPARTMENTS = ["Finance", "HR", "MM", "SD", "PP", "QM", "PM"];



const ArticleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    module: "",
    severity: "medium",
    status: "draft",
    visibility_role: "Employee",
    department: "",
    project_name: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  // Each entry: { file: File, tags: string[], tagInput: string }
  const [newFiles, setNewFiles] = useState([]);

  const [existingAttachments, setExistingAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load existing article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await getArticleById(id);
        const a = res.data.article;
        setForm({
          title: a.title || "",
          summary: a.summary || "",
          content: a.content || "",
          module: a.module || "",
          severity: a.severity || "medium",
          status: a.status || "draft",
          visibility_role: a.visibility_role || "Employee",
          department: a.department || "",
          project_name: a.project_name || "",
          tags: a.tags || [],
        });
        setExistingAttachments(res.data.attachments || []);
      } catch (err) {
        setError("Failed to load article.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(",", "");
      if (tag && !form.tags.includes(tag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Handle new file selection
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).map((file) => ({
      file,
      tags: [],
      tagInput: "",
    }));
    setNewFiles((prev) => [...prev, ...selected]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Update the tag-input text for a specific new-file row
  const handleFileTagInputChange = (index, value) => {
    setNewFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, tagInput: value } : f))
    );
  };

  // Add a tag to a specific new file when Enter/comma pressed
  const handleFileTagKeyDown = (index, e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      setNewFiles((prev) =>
        prev.map((f, i) => {
          if (i !== index) return f;
          const tag = f.tagInput.trim().replace(",", "");
          if (!tag || f.tags.includes(tag)) return { ...f, tagInput: "" };
          return { ...f, tags: [...f.tags, tag], tagInput: "" };
        })
      );
    }
  };

  // Remove a tag from a specific new file
  const handleRemoveFileTag = (index, tag) => {
    setNewFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, tags: f.tags.filter((t) => t !== tag) } : f
      )
    );
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.content.trim() || form.content === "<p><br></p>") {
      setError("Content is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Step 1 — Update the article
      await updateArticle(id, form);

      // Step 2 — Upload any new attachments, each with its own tags
      if (newFiles.length > 0) {
        for (const { file, tags } of newFiles) {
          await uploadAttachment(id, file, tags);
        }
      }

      navigate(`/articles/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update article. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size={32} sx={{ color: "#1565C0" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackOutlinedIcon />}
        onClick={() => navigate(`/articles/${id}`)}
        sx={{
          textTransform: "none",
          color: "#637381",
          mb: 2,
          fontSize: "0.85rem",
          "&:hover": { color: "#0A1929" },
        }}
      >
        Back to Article
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "4px" }}>
          {error}
        </Alert>
      )}

      {/* Section 1 — Article Details */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
          mb: 2,
        }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E0E0E0" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0A1929" }}>
            Article Details
          </Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Grid container spacing={2.5}>
            {/* Title */}
            <Grid item xs={12}>
              <FormLabel
                sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}
              >
                Title *
              </FormLabel>
              <TextField
                fullWidth
                size="small"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                sx={{ mt: 0.5, backgroundColor: "#FAFAFA" }}
              />
            </Grid>

            {/* Summary */}
            <Grid item xs={12}>
              <FormLabel
                sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}
              >
                Summary
              </FormLabel>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={form.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
                sx={{ mt: 0.5, backgroundColor: "#FAFAFA" }}
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Section 2 — Classification */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
          mb: 2,
        }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E0E0E0" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0A1929" }}>
            Classification
          </Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Grid container spacing={2.5}>
            {/* Project Name */}
            <Grid item xs={12}>
              <FormLabel
                sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}
              >
                Project Name
              </FormLabel>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. S/4HANA Migration Phase 2"
                value={form.project_name}
                onChange={(e) => handleChange("project_name", e.target.value)}
                sx={{ mt: 0.5, backgroundColor: "#FAFAFA" }}
              />
            </Grid>

            {/* Module */}
            <Grid item xs={12} sm={6}>
              <FormLabel
                sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}
              >
                SAP Module
              </FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select
                  value={form.module}
                  onChange={(e) => handleChange("module", e.target.value)}
                  sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}
                >
                  {MODULES.map((m) => (
                    <MenuItem key={m} value={m} sx={{ fontSize: "0.875rem" }}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Department */}
            <Grid item xs={12} sm={6}>
              <FormLabel
                sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}
              >
                Department
              </FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  displayEmpty
                  sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.875rem" }}>
                    Select department
                  </MenuItem>
                  {DEPARTMENTS.map((d) => (
                    <MenuItem key={d} value={d} sx={{ fontSize: "0.875rem" }}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Severity */}
            <Grid item xs={12} sm={6}>
              <FormLabel
                sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}
              >
                Severity
              </FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select
                  value={form.severity}
                  onChange={(e) => handleChange("severity", e.target.value)}
                  sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}
                >
                  {SEVERITIES.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: "0.875rem" }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <FormLabel
                sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}
              >
                Status
              </FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}
                >
                  {STATUSES.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: "0.875rem" }}>
                      {s === "under_review"
                        ? "Submit for Review"
                        : s === "draft"
                        ? "Save as Draft"
                        : "Published"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Visibility Role */}
            <Grid item xs={12} sm={6}>
              <FormLabel
                sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}
              >
                Visible To
              </FormLabel>
              <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                <Select
                  value={form.visibility_role}
                  onChange={(e) =>
                    handleChange("visibility_role", e.target.value)
                  }
                  sx={{ backgroundColor: "#FAFAFA", fontSize: "0.875rem" }}
                >
                  {VISIBILITY_ROLES.map((r) => (
                    <MenuItem key={r} value={r} sx={{ fontSize: "0.875rem" }}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <FormLabel
                sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#0A1929" }}
              >
                Tags
              </FormLabel>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                sx={{ mt: 0.5, backgroundColor: "#FAFAFA" }}
              />
              {form.tags.length > 0 && (
                <Box
                  sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}
                >
                  {form.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{
                        backgroundColor: "#F4F6F8",
                        color: "#637381",
                        fontSize: "0.75rem",
                        height: 24,
                        borderRadius: "4px",
                        border: "1px solid #E0E0E0",
                      }}
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Section 3 — Content */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
          mb: 2,
        }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E0E0E0" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0A1929" }}>
            Content *
          </Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5 }}>
         <TextField
            fullWidth
            multiline
            rows={12}
            label="Content"
            value={form.content}
            onChange={(e) =>
                handleChange("content", e.target.value)
            }
          />
        </Box>
      </Card>

      {/* Section 4 — Attachments */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
          mb: 3,
        }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E0E0E0" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0A1929" }}>
            Attachments
          </Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5 }}>

          {/* Existing attachments */}
          {existingAttachments.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#637381",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  display: "block",
                  mb: 1,
                }}
              >
                Existing Files
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {existingAttachments.map((file) => (
                  <Box
                    key={file.attachment_id}
                    sx={{
                      p: 1.2,
                      border: "1px solid #E0E0E0",
                      borderRadius: "4px",
                      backgroundColor: "#FAFAFA",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AttachFileOutlinedIcon
                        sx={{ fontSize: 16, color: "#637381" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.85rem", color: "#0A1929" }}
                      >
                        {file.file_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                        {file.file_type}
                      </Typography>
                    </Box>

                    {/* Existing attachment tags (read-only) */}
                    {file.tags && file.tags.length > 0 && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1, pl: 3.5 }}>
                        {file.tags.map((tag, i) => (
                          <Chip
                            key={i}
                            label={tag}
                            size="small"
                            sx={{
                              backgroundColor: "#F4F6F8",
                              color: "#637381",
                              fontSize: "0.7rem",
                              height: 20,
                              borderRadius: "4px",
                              border: "1px solid #E0E0E0",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Upload new files */}
          <Button
            component="label"
            variant="outlined"
            startIcon={<AttachFileOutlinedIcon />}
            sx={{
              borderRadius: "4px",
              textTransform: "none",
              borderColor: "#E0E0E0",
              color: "#637381",
              fontSize: "0.85rem",
              "&:hover": { borderColor: "#1565C0", color: "#1565C0" },
            }}
          >
            Attach New Files
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>

          {newFiles.length > 0 && (
            <Box
              sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              {newFiles.map((entry, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    border: "1px solid #E0E0E0",
                    borderRadius: "4px",
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  {/* File name row */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AttachFileOutlinedIcon
                        sx={{ fontSize: 16, color: "#637381" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.85rem", color: "#0A1929" }}
                      >
                        {entry.file.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                        ({(entry.file.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveNewFile(index)}
                    >
                      <CloseOutlinedIcon sx={{ fontSize: 14, color: "#637381" }} />
                    </IconButton>
                  </Box>

                  {/* Per-file tag input */}
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Tags for this file — type and press Enter"
                      value={entry.tagInput}
                      onChange={(e) => handleFileTagInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleFileTagKeyDown(index, e)}
                      sx={{ backgroundColor: "#FFFFFF" }}
                    />
                    {entry.tags.length > 0 && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                        {entry.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onDelete={() => handleRemoveFileTag(index, tag)}
                            sx={{
                              backgroundColor: "#F4F6F8",
                              color: "#637381",
                              fontSize: "0.72rem",
                              height: 22,
                              borderRadius: "4px",
                              border: "1px solid #E0E0E0",
                            }}
                          />
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
        <Button
          onClick={() => navigate(`/articles/${id}`)}
          sx={{
            textTransform: "none",
            borderRadius: "4px",
            color: "#637381",
            border: "1px solid #E0E0E0",
            px: 3,
            "&:hover": { borderColor: "#0A1929", color: "#0A1929" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            backgroundColor: "#1565C0",
            borderRadius: "4px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": { backgroundColor: "#0D47A1" },
          }}
        >
          {saving ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            "Save Changes"
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ArticleEdit;