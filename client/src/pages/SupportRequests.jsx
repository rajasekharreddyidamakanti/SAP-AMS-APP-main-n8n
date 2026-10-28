// src/pages/SupportRequests.jsx
import { useState, useEffect } from "react";
import {
  Box, Card, Typography, Button, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody,
  Alert, IconButton, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { createSupportRequest, getMyRequests, deleteSupportRequest } from "../api/support";

const PRIORITY_COLORS = {
  low:    { label: "Low",    bg: "#E8F5E9", color: "#2E7D32" },
  medium: { label: "Medium", bg: "#FFF3E0", color: "#E65100" },
  high:   { label: "High",   bg: "#FFEBEE", color: "#C62828" },
};

const STATUS_COLORS = {
  open:       { label: "Open",       bg: "#E3F2FD", color: "#1565C0" },
  assigned:   { label: "Assigned",   bg: "#F3E5F5", color: "#6A1B9A" },
  resolved:   { label: "Resolved",   bg: "#E8F5E9", color: "#2E7D32" },
  escalated:  { label: "Escalated",  bg: "#FFEBEE", color: "#C62828" },
  closed:     { label: "Closed",     bg: "#ECEFF1", color: "#546E7A" },
};

const SAP_MODULES = [
  "SAP MM", "SAP FI", "SAP CO", "SAP SD", "SAP PP",
  "SAP HR", "SAP PM", "SAP QM", "SAP WM", "ABAP", "Basis", "Other",
];

const StatusChip = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.open;
  return (
    <Chip label={s.label} size="small"
      sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.65rem", height: 22, borderRadius: "4px" }} />
  );
};

const PriorityChip = ({ priority }) => {
  const p = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  return (
    <Chip label={p.label} size="small"
      sx={{ backgroundColor: p.bg, color: p.color, fontWeight: 700, fontSize: "0.65rem", height: 22, borderRadius: "4px" }} />
  );
};

const SupportRequests = () => {
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", module: "", priority: "medium",
    deadline: "", notify_all: false,
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyRequests();
      // Backend may wrap in { success, data: [...] }
      const list = res.data?.data ?? res.data;
      setRequests(Array.isArray(list) ? list : []);
    } catch {
      setError("Failed to load support requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.module) {
      setError("Title, description, and module are required.");
      return;
    }
    setSubmitting(true);
    try {
      await createSupportRequest(form);
      setCreateOpen(false);
      setForm({ title: "", description: "", module: "", priority: "medium", deadline: "", notify_all: false });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSupportRequest(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete request.");
    }
  };

  const statusMap = ["", "open", "assigned", "resolved", "escalated", "closed"];

  const filterByTab = (reqs) => {
    if (tab === 0) return reqs;
    return reqs.filter((r) => r.status === statusMap[tab]);
  };

  const filtered = filterByTab(requests);

  const countByStatus = (status) =>
    requests.filter((r) => r.status === status).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0A1929" }}>
            Support Requests
          </Typography>
          <Typography variant="body2" sx={{ color: "#637381", mt: 0.3 }}>
            Raise and track your SAP support tickets
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
            New Ticket
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2, borderRadius: "6px" }}>{error}</Alert>}

      {/* Tabs */}
      <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", backgroundColor: "#FFFFFF" }}>
        <Box sx={{ borderBottom: "1px solid #EEEEEE" }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.85rem", minHeight: 48 } }}>
            <Tab label={`All Tickets (${requests.length})`} />
            <Tab label={`Open (${countByStatus("open")})`} />
            <Tab label={`Assigned (${countByStatus("assigned")})`} />
            <Tab label={`Resolved (${countByStatus("resolved")})`} />
            <Tab label={`Escalated (${countByStatus("escalated")})`} />
            <Tab label={`Closed (${countByStatus("closed")})`} />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "#1565C0" }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#90A4AE" }}>No support tickets found.</Typography>
            <Button onClick={() => setCreateOpen(true)} sx={{ mt: 2, textTransform: "none", color: "#1565C0", fontWeight: 600 }}>
              Create your first ticket
            </Button>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                {["Title", "Module", "Priority", "Status", "Deadline", "Created", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: "#637381", fontSize: "0.78rem", py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((req) => (
                <TableRow key={req.request_id || req.id}
                  sx={{ "&:hover": { backgroundColor: "#F9FAFB" } }}>
                  <TableCell sx={{ fontWeight: 500, color: "#0A1929", fontSize: "0.85rem" }}>
                    {req.title}
                    <Typography variant="caption" sx={{ color: "#90A4AE", display: "block", mt: 0.2 }}>
                      {req.description?.substring(0, 60)}{req.description?.length > 60 ? "…" : ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={req.module || "—"} size="small"
                      sx={{ backgroundColor: "#E3F2FD", color: "#1565C0", fontWeight: 600, fontSize: "0.65rem", height: 20 }} />
                  </TableCell>
                  <TableCell><PriorityChip priority={req.priority} /></TableCell>
                  <TableCell><StatusChip status={req.status} /></TableCell>
                  <TableCell sx={{ color: "#637381", fontSize: "0.8rem" }}>
                    {req.deadline ? new Date(req.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell sx={{ color: "#637381", fontSize: "0.8rem" }}>
                    {new Date(req.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" color="error" onClick={() => handleDelete(req.request_id)}
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", fontSize: "1rem" }}>
          Create Support Ticket
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <TextField
              label="Title" fullWidth size="small" required
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <TextField
              label="Description" fullWidth size="small" multiline rows={3} required
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <FormControl fullWidth size="small" required>
              <InputLabel>SAP Module</InputLabel>
              <Select value={form.module} label="SAP Module" onChange={(e) => setForm({ ...form, module: e.target.value })}>
                {SAP_MODULES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Deadline (optional)" fullWidth size="small" type="date"
              InputLabelProps={{ shrink: true }}
              value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: "none", color: "#637381" }}>Cancel</Button>
          <Button
            onClick={handleCreate} variant="contained" disabled={submitting}
            sx={{ backgroundColor: "#1565C0", textTransform: "none", fontWeight: 600, borderRadius: "6px", "&:hover": { backgroundColor: "#0D47A1" } }}
          >
            {submitting ? "Creating…" : "Create Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportRequests;
