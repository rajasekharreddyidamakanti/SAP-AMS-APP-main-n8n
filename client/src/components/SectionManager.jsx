import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  TextField,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import {
  getSectionsByArticle,
  createSection,
  updateSection,
  deleteSection,
} from "../api/sections";

const emptySection = {
  title: "",
  content: "",
  tags: [],
};

const SectionManager = ({ articleId }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptySection);
  const [tagInput, setTagInput] = useState("");

  const loadSections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSectionsByArticle(articleId);
      setSections(res.data);
    } catch (err) {
      setError("Failed to load sections.");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const resetForm = () => {
    setForm(emptySection);
    setTagInput("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    try {
      setError("");
      if (editingId) {
        await updateSection(editingId, form);
      } else {
        await createSection({
          article_id: articleId,
          ...form,
        });
      }

      resetForm();
      await loadSections();
    } catch {
      setError("Unable to save section.");
    }
  };

  const handleEdit = (section) => {
    setEditingId(section.section_id);

    setForm({
      title: section.title,
      content: section.content,
      tags: section.tags || [],
    });
    setTagInput("");

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this section?")) return;

    try {
      await deleteSection(id);
      loadSections();
    } catch {
      setError("Unable to delete section.");
    }
  };

  // Add a tag when user presses Enter or comma
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

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        mt: 3,
        border: "1px solid #E0E0E0",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Sections
        </Typography>

        {!showForm && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            Add Section
          </Button>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {showForm && (
          <Card
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Section Title"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />

              <TextField
                label="Section Content"
                multiline
                rows={5}
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
              />

              {/* Section tags */}
              <Box>
                <TextField
                  fullWidth
                  size="small"
                  label="Section Tags"
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                {form.tags.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
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
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SaveOutlinedIcon />}
                  onClick={handleSave}
                >
                  {editingId ? "Update" : "Save"}
                </Button>

                <Button
                  color="inherit"
                  startIcon={<CloseOutlinedIcon />}
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Card>
        )}

        {sections.length === 0 ? (
          <Typography color="text.secondary">
            No sections added yet.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {sections.map((section) => (
              <Card
                key={section.section_id}
                variant="outlined"
                sx={{ p: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                  >
                    {section.title}
                  </Typography>

                  <Box>
                    <IconButton
                      onClick={() => handleEdit(section)}
                    >
                      <EditOutlinedIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() =>
                        handleDelete(section.section_id)
                      }
                    >
                      <DeleteOutlineOutlinedIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    mt: 1,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {section.content}
                </Typography>

                {/* Section tag chips */}
                {section.tags && section.tags.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
                    {section.tags.map((tag, i) => (
                      <Chip
                        key={i}
                        label={tag}
                        size="small"
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
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Card>
  );
};
export default SectionManager;