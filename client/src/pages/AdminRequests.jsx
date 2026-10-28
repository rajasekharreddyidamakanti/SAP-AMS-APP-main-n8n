// src/pages/AdminRequests.jsx
import { useEffect, useState } from "react";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
} from "../api/roles";
import {
  getPendingArticles,
  approveArticle,
  rejectArticle,
} from "../api/articles";
// Added for testing the project
import {
  getAllSupportRequests,
  closeSupportRequest,
  escalateSupportRequest,
  assignSupportRequest,
  resolveSupportRequest,  
} from "../api/support";

import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import axios from "axios";

const AdminRequests = () => {
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  // Added for Testing for the project
  const [supportRequests, setSupportRequests] = useState([]); 
  // 
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Simple confirm dialog (approve actions, article reject)
  const [confirm, setConfirm] = useState({ open: false, id: null, action: null, type: null });

  // Reject-with-reason dialog (new user rejection only)
  const [userRejectDialog, setUserRejectDialog] = useState({ open: false, id: null });
  const [userRejectReason, setUserRejectReason] = useState("");
  const [userRejectError, setUserRejectError] = useState("");

  // Reject-with-reason dialog (article rejection)
  const [articleRejectDialog, setArticleRejectDialog] = useState({ open: false, id: null });
  const [articleRejectReason, setArticleRejectReason] = useState("");
  const [articleRejectError, setArticleRejectError] = useState("");

  // AI Review
  const [aiDialog, setAiDialog]   = useState({ open: false, articleId: null });
  const [aiResult, setAiResult]   = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,   setAiError]   = useState("");

  const fetchPendingUsers = async () => {
    try {
      const res = await getPendingUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingArticles = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPendingArticles();
      setArticles(res.data);
    } catch (err) {
      setError("Failed to load article requests.");
    } finally {
      setLoading(false);
    }
  };

// Added it for testing the project

    const fetchSupportRequests = async () => {
    try {
      const res = await getAllSupportRequests();
      setSupportRequests(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load support requests", err);
    }
  };
  useEffect(() => {
    fetchPendingUsers();
    fetchPendingArticles();
    // Added this line for testing the project
    fetchSupportRequests();
    //
  }, []);

  // ── User registration actions ──
  const approvePendingUser = async (id) => {
    setActionLoading(id);
    try {
      await approveUser(id);
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
      setToast({ open: true, message: "User approved. They can now log in.", severity: "success" });
    } catch (err) {
      setToast({ open: true, message: "Approval failed.", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const openUserRejectDialog = (id) => {
    setUserRejectDialog({ open: true, id });
    setUserRejectReason("");
    setUserRejectError("");
  };

  const closeUserRejectDialog = () => {
    setUserRejectDialog({ open: false, id: null });
    setUserRejectReason("");
    setUserRejectError("");
  };

  const submitUserReject = async () => {
    if (!userRejectReason.trim()) {
      setUserRejectError("A rejection reason is required.");
      return;
    }
    const { id } = userRejectDialog;
    setActionLoading(id);
    try {
      await rejectUser(id, userRejectReason);
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
      setToast({
        open: true,
        message: "User rejected and removed. They can register again.",
        severity: "info",
      });
      closeUserRejectDialog();
    } catch (err) {
      setToast({ open: true, message: "Reject failed.", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  // ── AI Review ──
  const openAiReview = async (articleId) => {
    setAiDialog({ open: true, articleId });
    setAiResult(null); setAiError(""); setAiLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3001/api/ai-review/${articleId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setAiResult(res.data?.data || res.data);
    } catch (e) {
      setAiError(e.response?.data?.message || "AI review failed.");
    } finally { setAiLoading(false); }
  };

  // ── Article actions ──
  const approvePendingArticle = async (id) => {
    setActionLoading(id);
    try {
      await approveArticle(id);
      fetchPendingArticles();
      setToast({ open: true, message: "Article approved successfully.", severity: "success" });
    } catch (err) {
      setToast({ open: true, message: "Failed to approve article.", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const openArticleRejectDialog = (id) => {
    setArticleRejectDialog({ open: true, id });
    setArticleRejectReason("");
    setArticleRejectError("");
  };

  const closeArticleRejectDialog = () => {
    setArticleRejectDialog({ open: false, id: null });
    setArticleRejectReason("");
    setArticleRejectError("");
  };

  const submitArticleReject = async () => {
    if (!articleRejectReason.trim()) {
      setArticleRejectError("A rejection reason is required.");
      return;
    }
    const { id } = articleRejectDialog;
    setActionLoading(id);
    try {
      await rejectArticle(id, articleRejectReason);
      fetchPendingArticles();
      setToast({ open: true, message: "Article rejected and sent back to author.", severity: "info" });
      closeArticleRejectDialog();
    } catch (err) {
      setToast({ open: true, message: "Failed to reject article.", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirm = (id, action, type) => setConfirm({ open: true, id, action, type });
  const closeConfirm = () => setConfirm({ open: false, id: null, action: null, type: null });

  const handleConfirm = () => {
    const { id, action, type } = confirm;
    closeConfirm();

    if (type === "user") {
      approvePendingUser(id);
    } else {
      if (action === "approve") approvePendingArticle(id);
      // Rejection is handled directly by submitArticleReject now.
    }
  };

  const confirmTitle = () => {
    if (confirm.type === "user") return "Approve New User?";
    return confirm.action === "approve" ? "Approve Article?" : "Reject Article?";
  };

  const confirmBody = () => {
    if (confirm.type === "user")
      return "This will grant the user access to the portal. They will be able to log in immediately.";
    return confirm.action === "approve"
      ? "This article will be published and become visible to users."
      : "This article will be rejected and sent back to the author.";
  };

  return (
    <Box sx={{ p: 4, maxWidth: 960, mx: "auto" }}>

      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 28, color: "#42A5F5" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1.2 }}>
            Admin Requests
          </Typography>
          <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.3 }}>
            Review and action pending approvals
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, value) => setTab(value)}
        sx={{ mb: 3 }}
      >
        <Tab label={`New Users (${users.length})`} />
        <Tab label={`Article Requests (${articles.length})`} />
        <Tab label={`Support Requests (${supportRequests.length})`} />
      </Tabs>

      {/* Error banner */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} sx={{ color: "#42A5F5" }} />
        </Box>
      ) : (
        <>
          {/* ── Tab 0 — New Users ── */}
          {tab === 0 && (
            <Card
              elevation={0}
              sx={{ border: "1px solid #E0E7EF", borderRadius: "8px" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F5F7FA" }}>
                    {["Name", "Email", "Department", "Registered", "Actions"].map((col, i) => (
                      <TableCell
                        key={col}
                        align={i === 4 ? "center" : "left"}
                        sx={{
                          fontWeight: 700,
                          color: "#0A1929",
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {users.map((u) => {
                    const isActioning = actionLoading === u.user_id;
                    return (
                      <TableRow
                        key={u.user_id}
                        sx={{
                          "&:last-child td": { border: 0 },
                          opacity: isActioning ? 0.5 : 1,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#0A1929" }}>
                            {u.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontSize: "0.85rem", color: "#455A64" }}>
                            {u.email}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={u.department || "—"}
                            size="small"
                            sx={{
                              backgroundColor: "#EEF2FF",
                              color: "#3730A3",
                              fontWeight: 600,
                              fontSize: "0.72rem",
                              height: 22,
                              borderRadius: "4px",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontSize: "0.85rem", color: "#607D8B" }}>
                            {u.created_at
                              ? new Date(u.created_at).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          {isActioning ? (
                            <CircularProgress size={20} sx={{ color: "#42A5F5" }} />
                          ) : (
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => openConfirm(u.user_id, "approve", "user")}
                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem" }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => openUserRejectDialog(u.user_id)}
                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem" }}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 40, color: "#B0BEC5", mb: 1, display: "block", mx: "auto" }} />
                        <Typography sx={{ color: "#607D8B", fontWeight: 500 }}>
                          No pending registrations
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#90A4AE", mt: 0.5 }}>
                          All new user accounts have been actioned.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* ── Tab 1 — Article table ── */}
          {tab === 1 && (
            <Card
              elevation={0}
              sx={{ border: "1px solid #E0E7EF", borderRadius: "8px" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F5F7FA" }}>
                    {["Title", "Department", "Status", "Actions"].map((col, i) => (
                      <TableCell
                        key={col}
                        align={i === 3 ? "center" : "left"}
                        sx={{
                          fontWeight: 700,
                          color: "#0A1929",
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {articles.map((article) => (
                    <TableRow
                      key={article.article_id}
                      sx={{ "&:last-child td": { border: 0 } }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#0A1929" }}>
                          {article.title}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem", color: "#455A64" }}>
                          {article.department || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: "0.85rem", color: "#455A64", textTransform: "capitalize" }}>
                          {article.status}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => openAiReview(article.article_id)}
                            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#5B21B6", borderColor: "#7C3AED", "&:hover": { backgroundColor: "#F5F3FF", borderColor: "#5B21B6" } }}
                          >
                            AI Review
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => openConfirm(article.article_id, "approve", "article")}
                            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem" }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => openArticleRejectDialog(article.article_id)}
                            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem" }}
                            disabled={actionLoading === article.article_id}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {articles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 40, color: "#B0BEC5", mb: 1, display: "block", mx: "auto" }} />
                        <Typography sx={{ color: "#607D8B", fontWeight: 500 }}>
                          No pending articles
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#90A4AE", mt: 0.5 }}>
                          All article review requests have been actioned.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* ── Tab 2 — Support Requests ── */}
      {tab === 2 && (
        <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "8px" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F5F7FA" }}>
                {["Title", "Priority", "Status", "Requested By", "Assigned To" , "Actions"].map((col) => (
                  <TableCell key={col} sx={{ fontWeight: 700 }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            {/* <TableBody>
              {supportRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No support requests found.</TableCell>
                </TableRow>
              ) : (
                supportRequests.map((req) => (
                  <TableRow key={req.request_id}>
                    <TableCell>{req.title}</TableCell>
                    <TableCell>
                      <Chip label={req.priority} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={req.status} size="small" />
                    </TableCell>
                    <TableCell>{req.requester_id}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        onClick={async () => {
                          await closeSupportRequest(req.request_id);
                          fetchSupportRequests();
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        size="small"
                        color="warning"
                        onClick={async () => {
                          await escalateSupportRequest(req.request_id);
                          fetchSupportRequests();
                        }}
                      >
                        Escalate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody> */}
            
          <TableBody>
              {supportRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No support requests found.</TableCell>
                </TableRow>
              ) : (
                supportRequests.map((req) => (
                  <TableRow key={req.request_id}>
                    <TableCell>{req.title}</TableCell>
                    <TableCell>
                      <Chip label={req.priority} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={req.status} size="small" />
                    </TableCell>
                    <TableCell>{req.requester_id}</TableCell>
                    <TableCell>{req.assigned_to_name || "—"}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        onClick={async () => {
                          await assignSupportRequest(req.request_id);
                          fetchSupportRequests();
                        }}
                      >
                        Assign to me
                      </Button>


                      <Button
                        size="small"
                        color="success"
                        onClick={async () => {
                          await resolveSupportRequest(req.request_id);
                          fetchSupportRequests();
                        }}
                      >
                        Resolve
                      </Button>
                      
                      <Button
                        size="small"
                        onClick={async () => {
                          await closeSupportRequest(req.request_id);
                          fetchSupportRequests();
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        size="small"
                        color="warning"
                        onClick={async () => {
                          await escalateSupportRequest(req.request_id);
                          fetchSupportRequests();
                        }}
                      >
                        Escalate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
        </Card>
      )}
      {/* ── Simple confirm dialog (approve user / approve+reject article) ── */}
      <Dialog
        open={confirm.open}
        onClose={closeConfirm}
        PaperProps={{ sx: { borderRadius: "8px", minWidth: 320 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>
          {confirmTitle()}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#455A64", fontSize: "0.9rem" }}>
            {confirmBody()}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={closeConfirm}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            size="small"
            color={confirm.action === "approve" ? "success" : "error"}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Yes, {confirm.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reject-with-reason dialog (new user only) ── */}
      <Dialog
        open={userRejectDialog.open}
        onClose={closeUserRejectDialog}
        PaperProps={{ sx: { borderRadius: "8px", minWidth: 420 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>
          Reject Registration
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#455A64", fontSize: "0.9rem", mb: 2 }}>
            Provide a reason for rejecting this registration. The user will see this
            message once, the next time they try to log in, then they will need to
            register again.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="e.g. Please use your official company email address to register."
            value={userRejectReason}
            onChange={(e) => {
              setUserRejectReason(e.target.value);
              setUserRejectError("");
            }}
            error={!!userRejectError}
            helperText={userRejectError}
            sx={{ backgroundColor: "#FAFAFA" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={closeUserRejectDialog}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitUserReject}
            variant="contained"
            size="small"
            color="error"
            disabled={!!actionLoading}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Reject & Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Article Reject Reason Dialog */}
      <Dialog open={articleRejectDialog.open} onClose={closeArticleRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", borderBottom: "1px solid #E0E7EF", pb: 2 }}>
          Reject Article
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ color: "#607D8B", mb: 2, fontSize: "0.9rem" }}>
            Please specify why this article is being rejected (e.g. Needs more detail, Formatting incorrect). The author will see this feedback.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            size="small"
            value={articleRejectReason}
            onChange={(e) => {
              setArticleRejectReason(e.target.value);
              if (articleRejectError) setArticleRejectError("");
            }}
            error={!!articleRejectError}
            helperText={articleRejectError}
            sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#F8FAFE" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={closeArticleRejectDialog}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitArticleReject}
            variant="contained"
            size="small"
            color="error"
            disabled={!!actionLoading}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Reject Article"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── AI Review Dialog ── */}
      <Dialog open={aiDialog.open} onClose={() => setAiDialog({ open: false, articleId: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", borderBottom: "1px solid #E0E7EF", pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "#7C3AED" }} /> AI Article Assistant
        </DialogTitle>
        <DialogContent sx={{ mt: 2, minHeight: 200 }}>
          {aiLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 2 }}>
              <CircularProgress size={32} sx={{ color: "#7C3AED" }} />
              <Typography sx={{ color: "#607D8B" }}>Analyzing article and verifying content metadata...</Typography>
            </Box>
          ) : aiError ? (
            <Alert severity="error">{aiError}</Alert>
          ) : aiResult ? (
            <Box>
              <Typography sx={{ fontWeight: 600, color: "#0A1929", mb: 1 }}>AI Summary Analysis:</Typography>
              <Typography sx={{ color: "#455A64", mb: 3, fontSize: "0.95rem", lineHeight: 1.6 }}>
                {aiResult.summary || "No summary analysis available."}
              </Typography>

              <Typography sx={{ fontWeight: 600, color: "#0A1929", mb: 1 }}>Metadata Suggestions:</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
                <Typography variant="body2" sx={{ color: "#455A64" }}><strong>Module:</strong> {aiResult.module || "Unknown"}</Typography>
                <Typography variant="body2" sx={{ color: "#455A64" }}><strong>Department:</strong> {aiResult.department || "Unknown"}</Typography>
                <Typography variant="body2" sx={{ color: "#455A64" }}><strong>Severity:</strong> {aiResult.severity || "Unknown"}</Typography>
              </Box>

              <Typography sx={{ fontWeight: 600, color: "#0A1929", mb: 1 }}>Suggested Tags:</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(aiResult.suggestedTags || []).map((tag, i) => (
                  <Chip key={i} label={tag} size="small" sx={{ backgroundColor: "#F3E8FF", color: "#6B21A8", fontWeight: 600 }} />
                ))}
                {!(aiResult.suggestedTags?.length) && (
                  <Typography variant="body2" sx={{ color: "#CFD8DC", fontStyle: "italic" }}>No tags suggested</Typography>
                )}
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAiDialog({ open: false, articleId: null })} sx={{ textTransform: "none", color: "#607D8B", fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>



      {/* Toast feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminRequests;