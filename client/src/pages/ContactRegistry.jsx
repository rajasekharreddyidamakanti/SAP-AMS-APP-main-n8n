// src/pages/ContactRegistry.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Box, Card, Typography, Button, Chip, CircularProgress, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Snackbar, Switch, FormControlLabel, IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import {
  getAllContacts, createContact, updateContact, deleteContact,
  getContactHistory, getOnCallContacts,
  getAllEscalationPaths, setEscalationPath,
} from "../api/contacts";
import { getUsers } from "../api/articles";

const SAP_MODULES = ["Finance", "HR", "Supply Chain", "MM", "SD", "PP", "QM", "PM"];

const LEVEL_CHIP = {
  1: { label: "L1", bg: "#E8F5E9", color: "#2E7D32" },
  2: { label: "L2", bg: "#FFF8E1", color: "#F57F17" },
  3: { label: "L3", bg: "#FDEDED", color: "#C62828" },
};

const TH = ({ children }) => (
  <TableCell sx={{ fontWeight: 700, color: "#0A1929", fontSize: "0.75rem",
    textTransform: "uppercase", letterSpacing: 0.5, backgroundColor: "#F5F7FA", py: 1.4 }}>
    {children}
  </TableCell>
);

const emptyForm = {
  user_id: "", name: "", email: "", phone: "", role: "", sap_module: "",
  escalation_level: "", is_on_call: false, on_call_start: "", on_call_end: "", notes: "",
};

const ContactRegistry = () => {
  const [tab, setTab] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [escalationPaths, setEscalationPaths] = useState([]);
  const [onCall, setOnCall] = useState([]);
  const [users, setUsers] = useState([]);
  const [moduleFilter, setModuleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [formDialog, setFormDialog] = useState({ open: false, editingId: null });
  const [form, setForm] = useState(emptyForm);

  const [historyDialog, setHistoryDialog] = useState({ open: false, contact: null, rows: [] });

  const [pathForm, setPathForm] = useState({ sap_module: "", level_1_contact: "", level_2_contact: "", level_3_contact: "" });

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [c, e, oc, userResponse] = await Promise.all([
        getAllContacts(moduleFilter ? { sap_module: moduleFilter } : {}),
        getAllEscalationPaths(),
        getOnCallContacts(moduleFilter || undefined),
        getUsers(),
      ]);
      setContacts(c.data.data || []);
      setEscalationPaths(e.data.data || []);
      setOnCall(oc.data.data || []);
      setUsers(userResponse.data.data || userResponse.data || []);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load contact registry", "error");
    } finally {
      setLoading(false);
    }
  }, [moduleFilter]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openCreate = () => { setForm(emptyForm); setFormDialog({ open: true, editingId: null }); };
  const openEdit = (contact) => {
    setForm({
      user_id: contact.user_id || "",
      name: contact.name || "", email: contact.email || "", phone: contact.phone || "",
      role: contact.role || "", sap_module: contact.sap_module || "",
      escalation_level: contact.escalation_level || "", is_on_call: !!contact.is_on_call,
      on_call_start: contact.on_call_start || "", on_call_end: contact.on_call_end || "",
      notes: contact.notes || "",
    });
    setFormDialog({ open: true, editingId: contact.contact_id });
  };

  const submitForm = async () => {
    try {
      const payload = { ...form, user_id: form.user_id || null, escalation_level: form.escalation_level || null };
      if (formDialog.editingId) {
        await updateContact(formDialog.editingId, payload);
        showToast("Contact updated");
      } else {
        await createContact(payload);
        showToast("Contact created");
      }
      setFormDialog({ open: false, editingId: null });
      loadAll();
    } catch (err) {
      showToast(err?.response?.data?.message || "Save failed", "error");
    }
  };

  const removeContact = async (id) => {
    if (!window.confirm("Delete this contact?")) return;
    try {
      await deleteContact(id);
      showToast("Contact deleted");
      loadAll();
    } catch (err) {
      showToast(err?.response?.data?.message || "Delete failed", "error");
    }
  };

  const openHistory = async (contact) => {
    try {
      const res = await getContactHistory(contact.contact_id);
      setHistoryDialog({ open: true, contact, rows: res.data.data || [] });
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not load history", "error");
    }
  };

  const submitEscalationPath = async () => {
    if (!pathForm.sap_module) return showToast("Pick a SAP module", "error");
    try {
      await setEscalationPath({
        sap_module: pathForm.sap_module,
        level_1_contact: pathForm.level_1_contact || null,
        level_2_contact: pathForm.level_2_contact || null,
        level_3_contact: pathForm.level_3_contact || null,
      });
      showToast("Escalation path saved");
      setPathForm({ sap_module: "", level_1_contact: "", level_2_contact: "", level_3_contact: "" });
      loadAll();
    } catch (err) {
      showToast(err?.response?.data?.message || "Save failed", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Key Contact Registry</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>
          Add Contact
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Contacts" />
        <Tab label="Escalation Paths" />
        <Tab label={<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <PhoneInTalkOutlinedIcon fontSize="small" /> On-Call
        </Box>} />
      </Tabs>

      <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>SAP Module</InputLabel>
        <Select
          label="SAP Module"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <MenuItem value="">All Modules</MenuItem>
          {SAP_MODULES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
      ) : tab === 0 ? (
        <Card variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TH>Name</TH><TH>Role</TH><TH>Module</TH><TH>Level</TH>
                <TH>Contact Info</TH><TH>On-Call</TH><TH>Actions</TH>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((c) => (
                <TableRow key={c.contact_id} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.role || "—"}</TableCell>
                  <TableCell>{c.sap_module || "—"}</TableCell>
                  <TableCell>
                    {c.escalation_level
                      ? <Chip size="small" label={LEVEL_CHIP[c.escalation_level].label}
                          sx={{ bgcolor: LEVEL_CHIP[c.escalation_level].bg, color: LEVEL_CHIP[c.escalation_level].color, fontWeight: 700 }} />
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.email}</Typography>
                    <Typography variant="body2" color="text.secondary">{c.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    {c.is_on_call
                      ? <Chip size="small" label={`${c.on_call_start || "?"}–${c.on_call_end || "?"}`}
                          sx={{ bgcolor: "#E3F2FD", color: "#1565C0" }} />
                      : <Chip size="small" label="Off" variant="outlined" />}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openHistory(c)} title="History">
                      <HistoryOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openEdit(c)} title="Edit">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => removeContact(c.contact_id)} title="Delete">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {contacts.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No contacts yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      ) : tab === 1 ? (
        <>
          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Set escalation path</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Module</InputLabel>
                <Select label="Module" value={pathForm.sap_module}
                  onChange={(e) => setPathForm({ ...pathForm, sap_module: e.target.value })}>
                  {SAP_MODULES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
              {[1, 2, 3].map((lvl) => (
                <FormControl key={lvl} size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>{`Level ${lvl} Contact`}</InputLabel>
                  <Select
                    label={`Level ${lvl} Contact`}
                    value={pathForm[`level_${lvl}_contact`]}
                    onChange={(e) => setPathForm({ ...pathForm, [`level_${lvl}_contact`]: e.target.value })}
                  >
                    <MenuItem value="">—</MenuItem>
                    {contacts.map((c) => <MenuItem key={c.contact_id} value={c.contact_id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              ))}
              <Button variant="contained" onClick={submitEscalationPath}>Save</Button>
            </Box>
          </Card>

          <Card variant="outlined">
            <Table>
              <TableHead>
                <TableRow><TH>Module</TH><TH>Level 1</TH><TH>Level 2</TH><TH>Level 3</TH></TableRow>
              </TableHead>
              <TableBody>
                {escalationPaths.map((p) => (
                  <TableRow key={p.path_id} hover>
                    <TableCell>{p.sap_module}</TableCell>
                    <TableCell>{p.level_1_name || "—"}</TableCell>
                    <TableCell>{p.level_2_name || "—"}</TableCell>
                    <TableCell>{p.level_3_name || "—"}</TableCell>
                  </TableRow>
                ))}
                {escalationPaths.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center">No escalation paths configured.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        <Card variant="outlined">
          <Table>
            <TableHead>
              <TableRow><TH>Name</TH><TH>Module</TH><TH>Phone</TH><TH>Window</TH></TableRow>
            </TableHead>
            <TableBody>
              {onCall.map((c) => (
                <TableRow key={c.contact_id} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.sap_module || "—"}</TableCell>
                  <TableCell>{c.phone || "—"}</TableCell>
                  <TableCell>{c.on_call_start} – {c.on_call_end}</TableCell>
                </TableRow>
              ))}
              {onCall.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center">Nobody is on-call right now.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={formDialog.open} onClose={() => setFormDialog({ open: false, editingId: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{formDialog.editingId ? "Edit Contact" : "Add Contact"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} fullWidth />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
          <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Link to existing user (optional)</InputLabel>
            <Select
              label="Link to existing user (optional)"
              value={form.user_id}
              onChange={(e) => {
                const userId = e.target.value;
                const selected = users.find((user) => String(user.user_id || user.id) === String(userId));
                setForm({
                  ...form,
                  user_id: userId,
                  ...(selected ? {
                    name: selected.name || form.name,
                    email: selected.email || form.email,
                  } : {}),
                });
              }}
            >
              <MenuItem value="">No linked user</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.user_id || user.id} value={user.user_id || user.id}>
                  {user.name || user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>SAP Module</InputLabel>
            <Select label="SAP Module" value={form.sap_module} onChange={(e) => setForm({ ...form, sap_module: e.target.value })}>
              {SAP_MODULES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Escalation Level</InputLabel>
            <Select label="Escalation Level" value={form.escalation_level}
              onChange={(e) => setForm({ ...form, escalation_level: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              <MenuItem value={1}>Level 1</MenuItem>
              <MenuItem value={2}>Level 2</MenuItem>
              <MenuItem value={3}>Level 3</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={form.is_on_call} onChange={(e) => setForm({ ...form, is_on_call: e.target.checked })} />}
            label="Currently on-call"
          />
          {form.is_on_call && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="On-call start" type="time" value={form.on_call_start}
                onChange={(e) => setForm({ ...form, on_call_start: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="On-call end" type="time" value={form.on_call_end}
                onChange={(e) => setForm({ ...form, on_call_end: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            </Box>
          )}
          <TextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            multiline minRows={2} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialog({ open: false, editingId: null })}>Cancel</Button>
          <Button variant="contained" onClick={submitForm}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* History dialog */}
      <Dialog open={historyDialog.open} onClose={() => setHistoryDialog({ open: false, contact: null, rows: [] })} maxWidth="sm" fullWidth>
        <DialogTitle>History — {historyDialog.contact?.name}</DialogTitle>
        <DialogContent>
          {historyDialog.rows.length === 0 ? (
            <Alert severity="info">No linked support requests for this contact yet.</Alert>
          ) : (
            historyDialog.rows.map((r) => (
              <Box key={r.request_id} sx={{ py: 1, borderBottom: "1px solid #eee" }}>
                <Typography variant="body2" fontWeight={600}>{r.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {r.related_module || "General"} · {r.status} · {new Date(r.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog({ open: false, contact: null, rows: [] })}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactRegistry;
