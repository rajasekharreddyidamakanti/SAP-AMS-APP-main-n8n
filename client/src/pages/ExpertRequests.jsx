// src/pages/ExpertRequests.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Box, Card, Typography, Button, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Alert, Table, TableHead, TableRow, TableCell, TableBody,
  Tooltip, IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../context/AuthContext";
import {
  createExpertRequest,
  getPendingExpertRequests,
  getMyExpertRequests,
  getAllExpertRequests,
  acceptExpertRequest,
  rejectExpertRequest,
  resolveExpertRequest,
  closeExpertRequest,
  reassignExpertRequest,
  escalateExpertRequest,
  deleteExpertRequest,
} from "../api/expertRequests";
import { getArticleExperts, getUsers } from "../api/articles";
import { useSearchParams, useNavigate } from "react-router-dom";
import ChatIcon from "@mui/icons-material/Chat";

const SAP_MODULES = [
  "SAP MM", "SAP FI", "SAP CO", "SAP SD", "SAP PP",
  "SAP HR", "SAP PM", "SAP QM", "SAP WM", "ABAP", "Basis", "Other",
];

// Status -> chip color, shared by both the expert/admin table and the
// employee's "my sent requests" table so a status always looks the same.
const STATUS_COLORS = {
  pending:   { bg: "#FFF3E0", color: "#E65100" },
  assigned:  { bg: "#EDE7F6", color: "#4527A0" },
  accepted:  { bg: "#E3F2FD", color: "#1565C0" },
  resolved:  { bg: "#E8F5E9", color: "#2E7D32" },
  closed:    { bg: "#ECEFF1", color: "#455A64" },
  escalated: { bg: "#FFEBEE", color: "#C62828" },
  rejected:  { bg: "#FFEBEE", color: "#C62828" },
  timeout:   { bg: "#FAFAFA", color: "#90A4AE" },
};

const StatusChip = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <Chip
      label={status || "pending"}
      size="small"
      sx={{
        backgroundColor: s.bg, color: s.color, fontWeight: 700,
        fontSize: "0.68rem", height: 22, textTransform: "capitalize",
      }}
    />
  );
};

const ExpertRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ module: "", description: "" });

  // Which user each row's "Assign to" dropdown currently has selected,
  // keyed by request_id — lets each row pick independently.
  const [assignPick, setAssignPick] = useState({});

  // Holds the request id pending delete confirmation (null = no dialog open).
  // Using a custom MUI dialog instead of window.confirm().
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Article-specific Experts logic
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const articleId = searchParams.get("articleId");
  const [articleExperts, setArticleExperts] = useState(null);

  const roles = user?.roles || [];
  const isExpert = roles.includes("Expert") || roles.includes("Team Lead") || roles.includes("Admin");
  const isAdmin = roles.includes("Admin");
  const [allRequests, setAllRequests] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (articleId) {
        const res = await getArticleExperts(articleId);
        setArticleExperts(res.data?.data || res.data);
      } else if (isExpert) {
        const calls = [
          getPendingExpertRequests(),
          getUsers().catch(() => ({ data: [] })),
        ];
        if (isAdmin) calls.push(getAllExpertRequests());

        const results = await Promise.all(calls);
        const pendingRes = results[0];
        const usersRes = results[1];

        const list = pendingRes.data?.data ?? pendingRes.data;
        setRequests(Array.isArray(list) ? list : []);
        const userList = usersRes.data?.data ?? usersRes.data;
        setUsers(Array.isArray(userList) ? userList : []);

        if (isAdmin) {
          const allRes = results[2];
          const allList = allRes.data?.data ?? allRes.data;
          setAllRequests(Array.isArray(allList) ? allList : []);
        }
      } else {
        const res = await getMyExpertRequests();
        const list = res.data?.data ?? res.data;
        setMyRequests(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expert requests.");
    } finally {
      setLoading(false);
    }
  }, [articleId, isAdmin, isExpert]);

  useEffect(() => { load(); }, [load]);

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCreate = async () => {
    if (!form.module || !form.description.trim()) {
      setError("Module and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      await createExpertRequest(form);
      setCreateOpen(false);
      setForm({ module: "", description: "" });
      flash("Expert request submitted successfully!");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (fn, id, successMsg, failMsg) => {
    try {
      await fn(id);
      flash(successMsg);
      load();
    } catch (err) {
      setError(err.response?.data?.message || failMsg);
    }
  };

  // Which request is currently showing the "Accept + reply" dialog,
  // and what the admin has typed into it so far.
  const [acceptDialog, setAcceptDialog] = useState({ open: false, id: null });
  const [replyText, setReplyText] = useState("");

  const openAcceptDialog = (id) => {
    setAcceptDialog({ open: true, id });
    setReplyText("");
  };

  const closeAcceptDialog = () => {
    setAcceptDialog({ open: false, id: null });
    setReplyText("");
  };

  const submitAccept = async () => {
    const { id } = acceptDialog;
    try {
      await acceptExpertRequest(id, replyText);
      flash(replyText.trim() ? "Request accepted and reply sent!" : "Request accepted!");
      closeAcceptDialog();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept request.");
    }
  };

  const handleReject  = (id) => runAction(rejectExpertRequest, id, "Request rejected.", "Failed to reject request.");
  const handleResolve = (id) => runAction(resolveExpertRequest, id, "Request marked as resolved.", "Failed to resolve request.");
  const handleClose   = (id) => runAction(closeExpertRequest, id, "Request closed.", "Failed to close request.");

  const handleAssign = async (id) => {
    const expertId = assignPick[id];
    if (!expertId) {
      setError("Pick a person to assign this to first.");
      return;
    }
    try {
      await reassignExpertRequest(id, expertId);
      flash("Request assigned successfully!");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign request.");
    }
  };

  const handleEscalate = async (id) => {
    const expertId = assignPick[id] || null;
    try {
      await escalateExpertRequest(id, expertId);
      flash("Request escalated.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to escalate request.");
    }
  };

  // Called only from the confirmation dialog's "Delete" button — never
  // directly from a row's Delete button, so there's always a confirm step.
  const handleDeleteRequest = async (id) => {
    try {
      await deleteExpertRequest(id);
      flash("Request deleted.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete request.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0A1929" }}>
            Expert Requests
          </Typography>
          <Typography variant="body2" sx={{ color: "#637381", mt: 0.3 }}>
            Request expert help for a SAP module
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={load} size="small" sx={{ border: "1px solid #E0E0E0", borderRadius: "6px" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained" startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ backgroundColor: "#1565C0", borderRadius: "6px", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: "#0D47A1" } }}
          >
            Request Expert
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2, borderRadius: "6px" }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2, borderRadius: "6px" }}>{success}</Alert>}

      {articleId && articleExperts && (
        <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#0A1929", mb: 2 }}>
            Article Experts & Authors
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { label: "Author", data: articleExperts.primaryAuthor },
              { label: "Co-Author", data: articleExperts.coAuthor },
              ...(articleExperts.departmentExperts || []).map(e => ({ label: "Department Expert", data: e }))
            ].filter(x => x.data).map((expert, idx) => (
              <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, border: "1px solid #EEEEEE", borderRadius: "8px", backgroundColor: "#FAFAFA" }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#0A1929" }}>{expert.data.name}</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#637381" }}>{expert.label} • {expert.data.email}</Typography>
                </Box>
                <Button
                  variant="outlined" size="small" startIcon={<ChatIcon fontSize="small" />}
                  onClick={() => navigate(`/chat?startWith=${expert.data.user_id}`)}
                  sx={{ textTransform: "none", borderRadius: "6px" }}
                >
                  Chat
                </Button>
              </Box>
            ))}
            {(!articleExperts.primaryAuthor && !articleExperts.coAuthor && (!articleExperts.departmentExperts || articleExperts.departmentExperts.length === 0)) && (
              <Typography variant="body2" sx={{ color: "#90A4AE" }}>No specific experts found for this article.</Typography>
            )}
          </Box>
        </Card>
      )}

      {/* Expert / Admin panel — requests that need action, with full lifecycle controls */}
      {isExpert && !articleId && (
        <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", backgroundColor: "#FFFFFF", mb: 3 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #EEEEEE" }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#0A1929" }}>
              Incoming Requests (Expert View)
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={30} sx={{ color: "#1565C0" }} />
            </Box>
          ) : requests.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#90A4AE" }}>No pending expert requests.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                  {["Requester", "Module", "Description", "Status", "Assign To", "Created", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#637381", fontSize: "0.78rem", py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => {
                  const id = req.request_id || req.id;
                  return (
                    <TableRow key={id} sx={{ "&:hover": { backgroundColor: "#F9FAFB" } }}>
                      <TableCell sx={{ fontWeight: 500, color: "#0A1929", fontSize: "0.85rem" }}>
                        {req.requester_name || req.user_name || "—"}
                      </TableCell>
                      <TableCell>
                        <Chip label={req.module || "—"} size="small"
                          sx={{ backgroundColor: "#E3F2FD", color: "#1565C0", fontWeight: 600, fontSize: "0.65rem", height: 20 }} />
                      </TableCell>
                      <TableCell sx={{ color: "#637381", fontSize: "0.82rem", maxWidth: 220 }}>
                        {req.query?.substring(0, 80) || req.description?.substring(0, 80)}
                        {(req.query?.length > 80 || req.description?.length > 80) ? "…" : ""}
                      </TableCell>
                      <TableCell><StatusChip status={req.status} /></TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            displayEmpty
                            value={assignPick[id] || ""}
                            onChange={(e) => setAssignPick((p) => ({ ...p, [id]: e.target.value }))}
                            sx={{ fontSize: "0.78rem" }}
                          >
                            <MenuItem value="" disabled>Choose person…</MenuItem>
                            {users
                              .filter((u) => u.user_id !== user?.userId && u.user_id !== user?.id)
                              .map((u) => (
                                <MenuItem key={u.user_id} value={u.user_id} sx={{ fontSize: "0.8rem" }}>
                                  {u.name} {u.department ? `(${u.department})` : ""}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ color: "#637381", fontSize: "0.8rem" }}>
                        {new Date(req.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          <Tooltip title="Accept & Reply">
                            <IconButton size="small" onClick={() => openAcceptDialog(id)}
                              sx={{ color: "#2E7D32", "&:hover": { backgroundColor: "#E8F5E9" } }}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" onClick={() => handleReject(id)}
                              sx={{ color: "#C62828", "&:hover": { backgroundColor: "#FFEBEE" } }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button size="small" onClick={() => handleAssign(id)}
                            sx={{ textTransform: "none", fontSize: "0.72rem", minWidth: "auto", px: 1 }}>
                            Assign
                          </Button>
                          <Button size="small" color="success" onClick={() => handleResolve(id)}
                            sx={{ textTransform: "none", fontSize: "0.72rem", minWidth: "auto", px: 1 }}>
                            Resolve
                          </Button>
                          <Button size="small" onClick={() => handleClose(id)}
                            sx={{ textTransform: "none", fontSize: "0.72rem", minWidth: "auto", px: 1 }}>
                            Close
                          </Button>
                          <Button size="small" color="warning" onClick={() => handleEscalate(id)}
                            sx={{ textTransform: "none", fontSize: "0.72rem", minWidth: "auto", px: 1 }}>
                            Escalate
                          </Button>
                          <Button size="small" color="error" onClick={() => setDeleteConfirm(id)}
                            sx={{ textTransform: "none", fontSize: "0.72rem", minWidth: "auto", px: 1 }}>
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Admin-only: full system-wide overview of every expert request, regardless of who it's currently assigned to. */}
      {isAdmin && !articleId && (
        <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", backgroundColor: "#FFFFFF", mb: 3 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #EEEEEE" }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#0A1929" }}>
              All Expert Requests (Admin Overview)
            </Typography>
            <Typography variant="body2" sx={{ color: "#90A4AE", mt: 0.3 }}>
              Every request in the system, whoever it's currently assigned to.
            </Typography>
          </Box>
          {allRequests.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#90A4AE" }}>No expert requests yet.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                  {["Requester", "Module", "Description", "Status", "Assigned To", "Created", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#637381", fontSize: "0.78rem", py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {allRequests.map((req) => (
                  <TableRow key={req.request_id} sx={{ "&:hover": { backgroundColor: "#F9FAFB" } }}>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0A1929" }}>
                        {req.requester_name || "—"}
                      </Typography>
                      {req.requester_email && (
                        <Typography sx={{ fontSize: "0.72rem", color: "#90A4AE" }}>{req.requester_email}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={req.module || "—"} size="small"
                        sx={{ backgroundColor: "#E3F2FD", color: "#1565C0", fontWeight: 600, fontSize: "0.65rem", height: 20 }} />
                    </TableCell>
                    <TableCell sx={{ color: "#637381", fontSize: "0.82rem", maxWidth: 220 }}>
                      {req.query?.substring(0, 70)}{req.query?.length > 70 ? "…" : ""}
                    </TableCell>
                    <TableCell><StatusChip status={req.status} /></TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {req.assigned_to_name ? (
                        <Box>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0A1929" }}>
                            {req.assigned_to_name}
                          </Typography>
                          {req.assigned_to_email && (
                            <Typography sx={{ fontSize: "0.72rem", color: "#90A4AE" }}>{req.assigned_to_email}</Typography>
                          )}
                          {req.assigned_to_phone && (
                            <Typography sx={{ fontSize: "0.72rem", color: "#90A4AE" }}>📞 {req.assigned_to_phone}</Typography>
                          )}
                        </Box>
                      ) : "—"}
                    </TableCell>
                    <TableCell sx={{ color: "#637381", fontSize: "0.8rem" }}>
                      {new Date(req.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" color="error" onClick={() => setDeleteConfirm(req.request_id)}
                        sx={{ textTransform: "none", fontSize: "0.72rem" }}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Employee panel — everything THEY have submitted, and its current status */}
      {!isExpert && !articleId && (
        <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", backgroundColor: "#FFFFFF", mb: 3 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #EEEEEE" }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#0A1929" }}>
              My Sent Requests
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={30} sx={{ color: "#1565C0" }} />
            </Box>
          ) : myRequests.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#90A4AE" }}>
                You haven't requested expert help yet.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                  {["Module", "Description", "Status", "Assigned To", "Created", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#637381", fontSize: "0.78rem", py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {myRequests.map((req) => (
                  <TableRow key={req.request_id} sx={{ "&:hover": { backgroundColor: "#F9FAFB" } }}>
                    <TableCell>
                      <Chip label={req.module || "—"} size="small"
                        sx={{ backgroundColor: "#E3F2FD", color: "#1565C0", fontWeight: 600, fontSize: "0.65rem", height: 20 }} />
                    </TableCell>
                    <TableCell sx={{ color: "#637381", fontSize: "0.82rem", maxWidth: 260 }}>
                      {req.query?.substring(0, 80)}{req.query?.length > 80 ? "…" : ""}
                    </TableCell>
                    <TableCell><StatusChip status={req.status} /></TableCell>
                    <TableCell sx={{ color: "#637381", fontSize: "0.85rem" }}>
                      {req.assigned_to_name ? (
                        <Box>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0A1929" }}>
                            {req.assigned_to_name}
                          </Typography>
                          {req.assigned_to_email && (
                            <Typography sx={{ fontSize: "0.75rem", color: "#90A4AE" }}>
                              {req.assigned_to_email}
                            </Typography>
                          )}
                          {req.assigned_to_phone && (
                            <Typography sx={{ fontSize: "0.75rem", color: "#90A4AE" }}>
                              📞 {req.assigned_to_phone}
                            </Typography>
                          )}
                        </Box>
                      ) : "—"}
                    </TableCell>
                    <TableCell sx={{ color: "#637381", fontSize: "0.8rem" }}>
                      {new Date(req.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" color="error" onClick={() => setDeleteConfirm(req.request_id)}
                        sx={{ textTransform: "none", fontSize: "0.72rem" }}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Accept + Reply Dialog */}
      <Dialog open={acceptDialog.open} onClose={closeAcceptDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", fontSize: "1rem" }}>
          Accept Request
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: "#637381", mb: 2 }}>
            Optionally send a reply now — it'll appear as the first message
            in the chat that opens once you accept.
          </Typography>
          <TextField
            label="Reply message (optional)"
            fullWidth
            multiline
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="e.g. Hi, I can help with this — can you share the transaction code you're seeing the error on?"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeAcceptDialog} sx={{ textTransform: "none", color: "#637381" }}>
            Cancel
          </Button>
          <Button
            onClick={submitAccept} variant="contained"
            sx={{ backgroundColor: "#2E7D32", textTransform: "none", fontWeight: 600, borderRadius: "6px", "&:hover": { backgroundColor: "#1B5E20" } }}
          >
            Accept{replyText.trim() ? " & Send Reply" : ""}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog — replaces window.confirm() with an in-app modal */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", fontSize: "1rem" }}>
          Delete Request?
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: "#637381" }}>
            Are you sure you want to delete this expert request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ textTransform: "none", color: "#637381" }}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteRequest(deleteConfirm)} variant="contained" color="error"
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "6px" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Expert Request Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", fontSize: "1rem" }}>
          Request Expert Help
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel>SAP Module</InputLabel>
              <Select value={form.module} label="SAP Module" onChange={(e) => setForm({ ...form, module: e.target.value })}>
                {SAP_MODULES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Describe the issue" fullWidth size="small" multiline rows={4} required
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: "none", color: "#637381" }}>Cancel</Button>
          <Button
            onClick={handleCreate} variant="contained" disabled={submitting}
            sx={{ backgroundColor: "#1565C0", textTransform: "none", fontWeight: 600, borderRadius: "6px", "&:hover": { backgroundColor: "#0D47A1" } }}
          >
            {submitting ? "Submitting…" : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpertRequests;
