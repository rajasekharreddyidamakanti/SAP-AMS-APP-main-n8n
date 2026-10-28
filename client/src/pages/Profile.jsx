// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../api/profile";
import { getRoles, requestRole } from "../api/roles";
import {
  Box, Typography, Card, Avatar, Chip,
  Table, TableHead, TableBody, TableRow, TableCell,
  Button, CircularProgress, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Select, MenuItem, FormControl,
  InputLabel, Tooltip, TextField,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AddModeratorOutlinedIcon from "@mui/icons-material/AddModeratorOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

const ROLE_COLORS = {
  Admin:        { bg: "#FDEDED", text: "#B71C1C", border: "#EF9A9A" },
  "Team Lead":  { bg: "#F3E5F5", text: "#6A1B9A", border: "#CE93D8" },
  Expert:       { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
  "L2 Support": { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
  "L1 Support": { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  Employee:     { bg: "#ECEFF1", text: "#455A64", border: "#B0BEC5" },
};
const roleChipSx = (name) => {
  const c = ROLE_COLORS[name] || { bg: "#ECEFF1", text: "#455A64", border: "#B0BEC5" };
  return { backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 700, fontSize: "0.78rem", height: 24, borderRadius: "6px" };
};
const STATUS_CONFIG = {
  published: { label: "Published", bg: "#E8F5E9", color: "#2E7D32" },
  under_review: { label: "Under Review", bg: "#FFF8E1", color: "#F57F17" },
  draft: { label: "Draft", bg: "#ECEFF1", color: "#546E7A" },
  rejected: { label: "Rejected", bg: "#FDEDED", color: "#C62828" },
};
const REQ_STATUS_CONFIG = {
  pending: { label: "Pending", bg: "#FFF8E1", color: "#F57F17" },
  approved: { label: "Approved", bg: "#E8F5E9", color: "#2E7D32" },
  rejected: { label: "Rejected", bg: "#FDEDED", color: "#C62828" },
};
const StatusChip = ({ status, map }) => {
  const cfg = map[status] || { label: status, bg: "#ECEFF1", color: "#607D8B" };
  return <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: "0.72rem", height: 22, borderRadius: "4px" }} />;
};
const TH = ({ children, align = "left" }) => (
  <TableCell align={align} sx={{ fontWeight: 700, color: "#0A1929", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5, backgroundColor: "#F5F7FA", py: 1.4 }}>{children}</TableCell>
);
const SectionHeader = ({ icon, title }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}><Box sx={{ color: "#42A5F5" }}>{icon}</Box><Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0A1929" }}>{title}</Typography></Box>
);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const departments = ["Finance", "HR", "MM", "SD", "PP", "QM", "PM"];

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Request-role dialog
  const [reqDialog, setReqDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [reqLoading, setReqLoading] = useState(false);

  // Edit profile dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", department: "", phone: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Phone number popup
  const [phonePopup, setPhonePopup] = useState(false);

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, rolesRes] = await Promise.all([getMyProfile(), getRoles()]);
      setProfile(profileRes.data);
      setAllRoles(rolesRes.data);
      // Show phone popup for 5 seconds if no phone number
      if (!profileRes.data.phone) {
        setPhonePopup(true);
        setTimeout(() => setPhonePopup(false), 5000);
      }
    } catch { showToast("Failed to load profile.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const assignedRoleIds = (profile?.roles || []).map((r) => r.role_id);
  const requestedRoleIds = (profile?.role_requests || []).filter((r) => r.status === "pending" || r.status === "approved").map((r) => r.role_id);
  const availableRoles = allRoles.filter((r) => !assignedRoleIds.includes(r.role_id) && !requestedRoleIds.includes(r.role_id));

  const handleRequestRole = async () => {
    if (!selectedRole) return;
    setReqLoading(true);
    try { await requestRole({ role_id: selectedRole }); showToast("Role request submitted."); setReqDialog(false); setSelectedRole(""); fetchAll(); }
    catch (err) { showToast(err?.response?.data?.message || "Request failed.", "error"); }
    finally { setReqLoading(false); }
  };

  const openEditDialog = () => {
    setEditForm({ name: profile.name || "", email: profile.email || "", department: profile.department || "", phone: profile.phone || "" });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) { showToast("Name and email are required.", "error"); return; }
    setEditLoading(true);
    try {
      await updateMyProfile(editForm);
      showToast("Profile updated successfully!");
      setEditOpen(false);
      fetchAll();
    } catch (err) { showToast(err?.response?.data?.message || "Update failed.", "error"); }
    finally { setEditLoading(false); }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}><CircularProgress size={36} sx={{ color: "#42A5F5" }} /></Box>;
  if (!profile) return <Box sx={{ p: 4 }}><Alert severity="error">Could not load your profile.</Alert></Box>;

  const avatarLetter = profile.name?.charAt(0).toUpperCase() || "U";
  const primaryRole = profile.roles?.[0]?.role_name || "Employee";
  const avatarColor = { Admin: "#B71C1C", "Team Lead": "#6A1B9A", Expert: "#1565C0", "L2 Support": "#E65100", "L1 Support": "#2E7D32", Employee: "#37474F" }[primaryRole] || "#37474F";
  const publishedCount = profile.articles.filter((a) => a.status === "published").length;

  return (
    <Box sx={{ p: 4, maxWidth: 960, mx: "auto" }}>
      {/* Phone number popup */}
      <Snackbar open={phonePopup} anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setPhonePopup(false)} autoHideDuration={5000}>
        <Alert severity="info" variant="filled" onClose={() => setPhonePopup(false)}
          icon={<PhoneOutlinedIcon />} sx={{ width: "100%", fontWeight: 600 }}>
          Please add your phone number to your profile for better communication.
        </Alert>
      </Snackbar>

      {/* Page title */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <PersonOutlineOutlinedIcon sx={{ fontSize: 28, color: "#42A5F5" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1.2 }}>My Profile</Typography>
            <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.3 }}>Your account information, articles and role requests</Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={openEditDialog}
          sx={{ textTransform: "none", fontWeight: 600, borderColor: "#42A5F5", color: "#1565C0", borderRadius: "8px", "&:hover": { borderColor: "#1565C0", backgroundColor: "#E3F2FD" } }}>
          Edit Profile
        </Button>
      </Box>

      {/* User card */}
      <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 3, mb: 3, background: "linear-gradient(135deg, #0A1929 0%, #132F4C 100%)" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, flexWrap: "wrap" }}>
          <Avatar sx={{ width: 64, height: 64, backgroundColor: avatarColor, fontSize: "1.6rem", fontWeight: 700, border: "3px solid rgba(255,255,255,0.15)", flexShrink: 0 }}>{avatarLetter}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.2 }}>{profile.name}</Typography>
            <Typography sx={{ color: "#90A4AE", fontSize: "0.85rem", mt: 0.4 }}>{profile.email}</Typography>
            {profile.phone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                <PhoneOutlinedIcon sx={{ fontSize: 14, color: "#90A4AE" }} />
                <Typography sx={{ color: "#B0BEC5", fontSize: "0.82rem" }}>{profile.phone}</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
              {profile.roles.length ? profile.roles.map((r) => <Chip key={r.role_id} label={r.role_name} size="small" sx={roleChipSx(r.role_name)} />)
                : <Chip label="Employee" size="small" sx={roleChipSx("Employee")} />}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ textAlign: "center" }}><Typography sx={{ color: "#42A5F5", fontWeight: 700, fontSize: "1.4rem" }}>{profile.articles.length}</Typography><Typography sx={{ color: "#90A4AE", fontSize: "0.72rem" }}>Articles</Typography></Box>
            <Box sx={{ textAlign: "center" }}><Typography sx={{ color: "#66BB6A", fontWeight: 700, fontSize: "1.4rem" }}>{publishedCount}</Typography><Typography sx={{ color: "#90A4AE", fontSize: "0.72rem" }}>Published</Typography></Box>
          </Box>
        </Box>
        {profile.department && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, pt: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <WorkOutlineOutlinedIcon sx={{ fontSize: 16, color: "#90A4AE" }} />
            <Typography sx={{ color: "#B0BEC5", fontSize: "0.83rem" }}>{profile.department}</Typography>
            <Typography sx={{ color: "#546E7A", fontSize: "0.75rem", ml: "auto" }}>Member since {fmtDate(profile.created_at)}</Typography>
          </Box>
        )}
      </Card>

      {/* Request a Role */}
      <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <SectionHeader icon={<AddModeratorOutlinedIcon fontSize="small" />} title="Request a Role" />
            <Typography sx={{ fontSize: "0.85rem", color: "#607D8B", mt: -1.5 }}>Request additional roles from the admin.</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddModeratorOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => { setReqDialog(true); setSelectedRole(""); }} disabled={availableRoles.length === 0}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.85rem", backgroundColor: "#1565C0", borderRadius: "8px", "&:hover": { backgroundColor: "#0D47A1" } }}>
            {availableRoles.length === 0 ? "No Roles Available" : "Request Role"}
          </Button>
        </Box>
      </Card>

      {/* Role Requests History */}
      {profile.role_requests.length > 0 && (
        <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 3, mb: 3 }}>
          <SectionHeader icon={<ShieldOutlinedIcon fontSize="small" />} title={`Role Requests (${profile.role_requests.length})`} />
          <Table size="small"><TableHead><TableRow><TH>Role</TH><TH>Requested On</TH><TH align="center">Status</TH><TH>Rejection Reason</TH></TableRow></TableHead>
            <TableBody>{profile.role_requests.map((req) => (
              <TableRow key={req.request_id} sx={{ "&:last-child td": { border: 0 } }}>
                <TableCell><Chip label={req.role_name} size="small" sx={roleChipSx(req.role_name)} /></TableCell>
                <TableCell><Typography sx={{ fontSize: "0.83rem", color: "#607D8B" }}>{fmtDate(req.requested_at)}</Typography></TableCell>
                <TableCell align="center"><StatusChip status={req.status} map={REQ_STATUS_CONFIG} /></TableCell>
                <TableCell>{req.rejection_message ? <Typography sx={{ fontSize: "0.8rem", color: "#C62828", fontStyle: "italic" }}>{req.rejection_message}</Typography> : <Typography sx={{ fontSize: "0.8rem", color: "#B0BEC5" }}>—</Typography>}</TableCell>
              </TableRow>
            ))}</TableBody></Table>
        </Card>
      )}

      {/* My Articles */}
      <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 3 }}>
        <SectionHeader icon={<ArticleOutlinedIcon fontSize="small" />} title={`My Articles (${profile.articles.length})`} />
        {profile.articles.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <ArticleOutlinedIcon sx={{ fontSize: 40, color: "#B0BEC5" }} />
            <Typography sx={{ color: "#607D8B", fontWeight: 500, mt: 1 }}>No articles yet</Typography>
            <Button variant="outlined" size="small" onClick={() => navigate("/articles/new")}
              sx={{ mt: 2, textTransform: "none", fontWeight: 600, borderColor: "#90CAF9", color: "#1565C0" }}>Create Article</Button>
          </Box>
        ) : (
          <Table size="small"><TableHead><TableRow><TH>Title</TH><TH>Module</TH><TH>Department</TH><TH align="center">Status</TH><TH>Created</TH><TH align="center">Action</TH></TableRow></TableHead>
            <TableBody>{profile.articles.map((a) => (
              <TableRow key={a.article_id} sx={{ "&:last-child td": { border: 0 }, "&:hover": { backgroundColor: "#F8FAFC" } }}>
                <TableCell sx={{ maxWidth: 240 }}><Tooltip title={a.title}><Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0A1929", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{a.title}</Typography></Tooltip></TableCell>
                <TableCell><Typography sx={{ fontSize: "0.82rem", color: "#607D8B" }}>{a.module || "—"}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: "0.82rem", color: "#607D8B" }}>{a.department || "—"}</Typography></TableCell>
                <TableCell align="center"><StatusChip status={a.status} map={STATUS_CONFIG} /></TableCell>
                <TableCell><Typography sx={{ fontSize: "0.82rem", color: "#90A4AE" }}>{fmtDate(a.created_at)}</Typography></TableCell>
                <TableCell align="center"><Tooltip title="View"><Button size="small" variant="outlined" endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate(`/articles/${a.article_id}`)} sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", borderColor: "#B0BEC5", color: "#455A64", py: 0.3 }}>View</Button></Tooltip></TableCell>
              </TableRow>
            ))}</TableBody></Table>
        )}
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>Edit Profile</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#607D8B", fontSize: "0.87rem", mb: 2.5 }}>
            Update your personal details below.
          </DialogContentText>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Full Name" fullWidth size="small" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <TextField label="Email" fullWidth size="small" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <TextField label="Phone Number" fullWidth size="small" placeholder="+91 9876543210" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <TextField select label="Department" fullWidth size="small" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}>
              {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined" size="small" sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" size="small" disabled={editLoading}
            sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0" }}>
            {editLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Role Dialog */}
      <Dialog open={reqDialog} onClose={() => setReqDialog(false)} PaperProps={{ sx: { borderRadius: "12px", minWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>Request a Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#607D8B", fontSize: "0.87rem", mb: 2.5 }}>Select the role you want to request.</DialogContentText>
          <FormControl fullWidth size="small"><InputLabel>Select Role</InputLabel>
            <Select value={selectedRole} label="Select Role" onChange={(e) => setSelectedRole(e.target.value)}>
              {availableRoles.map((r) => <MenuItem key={r.role_id} value={r.role_id}>{r.role_name}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setReqDialog(false)} variant="outlined" size="small" sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>Cancel</Button>
          <Button onClick={handleRequestRole} variant="contained" size="small" disabled={!selectedRole || reqLoading}
            sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0" }}>
            {reqLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ width: "100%" }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
