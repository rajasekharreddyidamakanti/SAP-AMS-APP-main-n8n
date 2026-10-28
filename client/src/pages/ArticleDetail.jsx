// src/pages/ArticleDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getArticleById,
  deleteArticle,
  updateArticleStatus,
} from "../api/articles";
import { useAuth } from "../context/AuthContext";
import {
  canEdit,
  canDelete,
  canApproveRoles,
} from "../utils/roleUtils";
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  TextField,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SectionManager from "../components/SectionManager";

const STATUS_STYLES = {
  published: { label: "Published", color: "#2E7D32", bg: "#E8F5E9" },
  under_review: { label: "Under Review", color: "#E65100", bg: "#FFF3E0" },
  draft: { label: "Draft", color: "#37474F", bg: "#ECEFF1" },
  rejected: { label: "Rejected", color: "#C62828", bg: "#FFEBEE" },
};

const SEVERITY_STYLES = {
  critical: { label: "Critical", color: "#C62828", bg: "#FFEBEE" },
  high: { label: "High", color: "#E65100", bg: "#FFF3E0" },
  medium: { label: "Medium", color: "#1565C0", bg: "#E3F2FD" },
  low: { label: "Low", color: "#2E7D32", bg: "#E8F5E9" },
};

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [article, setArticle] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Rejection dialog state
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await getArticleById(id);
        setArticle(res.data.article);
        setAttachments(res.data.attachments || []);
      } catch (err) {
        setError(
          "Failed to load article. It may not exist or you may not have permission to view it."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  // Delete article
  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteArticle(id);
      navigate("/articles");
    } catch (err) {
      setError("Failed to delete article.");
      setDeleteDialog(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Approve article — reloads attachments after approval
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await updateArticleStatus(id, "published");
      // Re-fetch so attachments are now returned by backend
      const res = await getArticleById(id);
      setArticle(res.data.article);
      setAttachments(res.data.attachments || []);
      setSuccessMsg("Article approved and published successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to approve article.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject article — reason is required
  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setRejectError("Rejection reason is required.");
      return;
    }
    try {
      setActionLoading(true);
      await updateArticleStatus(id, "rejected", rejectionReason);
      setArticle((prev) => ({
        ...prev,
        status: "rejected",
        rejection_reason: rejectionReason,
      }));
      setAttachments([]); // hide attachments immediately on rejection
      setRejectDialog(false);
      setRejectionReason("");
      setRejectError("");
      setSuccessMsg("Article rejected.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reject article."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size={32} sx={{ color: "#1565C0" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate("/articles")}
          sx={{ textTransform: "none", color: "#637381", mb: 2 }}
        >
          Back to Knowledge Base
        </Button>
        <Alert severity="error" sx={{ borderRadius: "4px" }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!article) return null;

  const statusStyle = STATUS_STYLES[article.status] || STATUS_STYLES.draft;
  const severityStyle = SEVERITY_STYLES[article.severity] || SEVERITY_STYLES.low;

  // Check if the logged-in user is the author
  const isAuthor =
    user?.id === article.created_by || user?.userId === article.created_by;

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackOutlinedIcon />}
        onClick={() => navigate("/articles")}
        sx={{
          textTransform: "none",
          color: "#637381",
          mb: 2,
          fontSize: "0.85rem",
          "&:hover": { color: "#0A1929" },
        }}
      >
        Back to Knowledge Base
      </Button>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: "4px" }}>
          {successMsg}
        </Alert>
      )}

      {/* Main article card */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
          mb: 2,
        }}
      >
        {/* Article header */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            {/* Title + chips */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#0A1929", mb: 1 }}
              >
                {article.title}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {/* Status */}
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
                {/* Severity */}
                <Chip
                  label={severityStyle.label}
                  size="small"
                  sx={{
                    backgroundColor: severityStyle.bg,
                    color: severityStyle.color,
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    height: 22,
                    borderRadius: "4px",
                  }}
                />
                {/* Module */}
                {article.module && (
                  <Chip
                    label={article.module}
                    size="small"
                    sx={{
                      backgroundColor: "#EEF2FF",
                      color: "#3730A3",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                      height: 22,
                      borderRadius: "4px",
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>

              {/* Approve / Reject — Admin only, when under_review */}
              {canApproveRoles(user) && article.status === "under_review" && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircleOutlinedIcon />}
                    onClick={handleApprove}
                    disabled={actionLoading}
                    sx={{
                      backgroundColor: "#2E7D32",
                      borderRadius: "4px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      "&:hover": { backgroundColor: "#1B5E20" },
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={() => setRejectDialog(true)}
                    disabled={actionLoading}
                    sx={{
                      borderColor: "#C62828",
                      color: "#C62828",
                      borderRadius: "4px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      "&:hover": {
                        borderColor: "#B71C1C",
                        backgroundColor: "#FFEBEE",
                      },
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}

              {/* Edit button */}
              {canEdit(user) && (
                <Tooltip title="Edit Article">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/articles/${id}/edit`)}
                    sx={{
                      border: "1px solid #E0E0E0",
                      borderRadius: "4px",
                      color: "#637381",
                      "&:hover": {
                        color: "#1565C0",
                        borderColor: "#1565C0",
                        backgroundColor: "#E3F2FD",
                      },
                    }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Delete button — Admin only */}
              {canDelete(user) && (
                <Tooltip title="Delete Article">
                  <IconButton
                    size="small"
                    onClick={() => setDeleteDialog(true)}
                    sx={{
                      border: "1px solid #E0E0E0",
                      borderRadius: "4px",
                      color: "#637381",
                      "&:hover": {
                        color: "#C62828",
                        borderColor: "#C62828",
                        backgroundColor: "#FFEBEE",
                      },
                    }}
                  >
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Expert Request (visible for published articles) */}
              {article.status === 'published' && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/expert-requests?articleId=${id}`)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    color: "#0288D1",
                    borderColor: "#03A9F4",
                    "&:hover": { backgroundColor: "#E1F5FE", borderColor: "#0288D1" },
                  }}
                >
                  Expert Request
                </Button>
              )}
            </Box>
          </Box>


         {/* Meta info */}
          <Box sx={{ mt: 2, display: "flex", gap: 3, flexWrap: "wrap" }}>
            {article.project_name && (
              <Typography variant="caption" sx={{ color: "#637381" }}>
                <strong>Project:</strong> {article.project_name}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: "#637381" }}>
              <strong>Department:</strong> {article.department || "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#637381" }}>
              <strong>Created:</strong>{" "}
              {new Date(article.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Typography>
            {article.updated_at && (
              <Typography variant="caption" sx={{ color: "#637381" }}>
                <strong>Last Updated:</strong>{" "}
                {new Date(article.updated_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Summary */}
        {article.summary && (
          <>
            <Box sx={{ px: 3, py: 2, backgroundColor: "#F9FAFB" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#637381",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Summary
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#0A1929", mt: 0.5, lineHeight: 1.6 }}
              >
                {article.summary}
              </Typography>
            </Box>
            <Divider />
          </>
        )}

        {/* Full content */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: "#637381",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              display: "block",
              mb: 1.5,
            }}
          >
            Content
          </Typography>
          <Box
            sx={{
              color: "#0A1929",
              fontSize: "0.9rem",
              lineHeight: 1.8,
              "& h1, & h2, & h3": { color: "#0A1929", fontWeight: 600 },
              "& p": { marginBottom: "0.75rem" },
              "& ul, & ol": { paddingLeft: "1.5rem" },
              "& strong": { fontWeight: 600 },
              "& code": {
                backgroundColor: "#F4F6F8",
                padding: "2px 6px",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "0.85rem",
              },
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Box>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 2 }}>
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
                Tags
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {article.tags.map((tag, i) => (
                  <Chip
                    key={i}
                    label={tag}
                    size="small"
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
            </Box>
          </>
        )}

        {/* ── Rejection reason ── only visible to the article author */}
        {article.status === "rejected" &&
          article.rejection_reason &&
          isAuthor && (
            <>
              <Divider />
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  backgroundColor: "#FFEBEE",
                  borderTop: "1px solid #FFCDD2",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#C62828",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Rejection Reason
                </Typography>
                <Typography variant="body2" sx={{ color: "#B71C1C" }}>
                  {article.rejection_reason}
                </Typography>
              </Box>
            </>
          )}
      </Card>

      {/* Sections */}
      <SectionManager articleId={id} />

      {/* Attachments — only shown when article is published */}
      {attachments.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mt: 2,
            border: "1px solid #E0E0E0",
            borderRadius: "6px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Box sx={{ px: 3, py: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#0A1929", mb: 1.5 }}
            >
              Attachments ({attachments.length})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {attachments.map((file) => (
                <Box
                  key={file.attachment_id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    border: "1px solid #E0E0E0",
                    borderRadius: "4px",
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  {/* File info + tags */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AttachFileOutlinedIcon
                        sx={{ fontSize: 16, color: "#637381" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#0A1929", fontSize: "0.85rem" }}
                      >
                        {file.file_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#B0BEC5" }}
                      >
                        {file.file_type}
                      </Typography>
                    </Box>

                    {/* Attachment tags */}
                    {file.tags && file.tags.length > 0 && (
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5, pl: 3.2 }}>
                        {file.tags.map((tag, i) => (
                          <Chip
                            key={i}
                            label={tag}
                            size="small"
                            sx={{
                              backgroundColor: "#F4F6F8",
                              color: "#637381",
                              fontSize: "0.65rem",
                              height: 18,
                              borderRadius: "4px",
                              border: "1px solid #E0E0E0",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Download button */}
                  <Tooltip title="Download">
                    <IconButton
                      size="small"
                      component="a"
                      href={`http://localhost:3001/${file.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#637381" }}
                    >
                      <DownloadOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Box>
        </Card>
      )}

      {/* ── Rejection reason dialog ── */}
      <Dialog
        open={rejectDialog}
        onClose={() => {
          setRejectDialog(false);
          setRejectError("");
          setRejectionReason("");
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            border: "1px solid #E0E0E0",
            borderRadius: "6px",
            minWidth: 420,
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 600, color: "#0A1929", fontSize: "1rem" }}
        >
          Reject Article
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#637381", mb: 2 }}>
            Provide a reason for rejection. This will only be visible to the
            article author.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="e.g. Missing screenshots, incorrect steps, needs more detail..."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              setRejectError("");
            }}
            error={!!rejectError}
            helperText={rejectError}
            sx={{ backgroundColor: "#FAFAFA" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setRejectDialog(false);
              setRejectError("");
              setRejectionReason("");
            }}
            sx={{
              textTransform: "none",
              color: "#637381",
              borderRadius: "4px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectSubmit}
            disabled={actionLoading}
            variant="contained"
            sx={{
              backgroundColor: "#C62828",
              borderRadius: "4px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#B71C1C" },
            }}
          >
            {actionLoading ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation dialog ── */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        PaperProps={{
          elevation: 0,
          sx: { border: "1px solid #E0E0E0", borderRadius: "6px" },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 600, color: "#0A1929", fontSize: "1rem" }}
        >
          Delete Article
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#637381" }}>
            Are you sure you want to delete{" "}
            <strong>"{article.title}"</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            sx={{
              textTransform: "none",
              color: "#637381",
              borderRadius: "4px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={actionLoading}
            variant="contained"
            sx={{
              backgroundColor: "#C62828",
              borderRadius: "4px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#B71C1C" },
            }}
          >
            {actionLoading ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArticleDetail;