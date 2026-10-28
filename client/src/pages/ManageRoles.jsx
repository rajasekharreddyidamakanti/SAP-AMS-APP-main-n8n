// src/pages/ManageRoles.jsx
import { useEffect, useState, useCallback } from "react";
import {
  getRoles,
  getAdminUsersWithRoles,
  assignRoleToUser,
  removeRoleFromUser,
  getPendingRolesWithDetails,
  approveRole,
  rejectRole,
} from "../api/roles";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

// ─── Color map for roles ───────────────────────────────────────────────────
const ROLE_COLORS = {
  Admin:        { bg: "#FDEDED", text: "#B71C1C", border: "#EF9A9A" },
  "Team Lead":  { bg: "#F3E5F5", text: "#6A1B9A", border: "#CE93D8" },
  Expert:       { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
  "L2 Support": { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
  "L1 Support": { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  Employee:     { bg: "#ECEFF1", text: "#455A64", border: "#B0BEC5" },
};

const getRoleChipSx = (roleName) => {
  const c = ROLE_COLORS[roleName] || { bg: "#ECEFF1", text: "#455A64", border: "#B0BEC5" };
  return {
    backgroundColor: c.bg,
    color: c.text,
    border: `1px solid ${c.border}`,
    fontWeight: 600,
    fontSize: "0.72rem",
    height: 22,
    borderRadius: "4px",
  };
};

// ─── Stat card ────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <Card
    elevation={0}
    sx={{
      border: "1px solid #E0E7EF",
      borderRadius: "10px",
      p: 2.5,
      display: "flex",
      alignItems: "center",
      gap: 2,
      flex: 1,
      minWidth: 160,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "10px",
        backgroundColor: `${color}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#0A1929", lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "0.78rem", color: "#607D8B", fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  </Card>
);

// ─── Table header helper ─────────────────────────────────────────────────
const TH = ({ children, align = "left" }) => (
  <TableCell
    align={align}
    sx={{
      fontWeight: 700,
      color: "#0A1929",
      fontSize: "0.78rem",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      backgroundColor: "#F5F7FA",
      py: 1.5,
    }}
  >
    {children}
  </TableCell>
);

// ─── Empty state ─────────────────────────────────────────────────────────
const EmptyRow = ({ colSpan, icon, title, sub }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 7 }}>
      {icon}
      <Typography sx={{ color: "#607D8B", fontWeight: 500, mt: 1 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: "#90A4AE", mt: 0.4 }}>{sub}</Typography>
    </TableCell>
  </TableRow>
);

// ═══════════════════════════════════════════════════════════════════════════
const ManageRoles = () => {
  const [tab, setTab] = useState(0);

  // Data
  const [roles, setRoles] = useState([]);
  const [usersWithRoles, setUsersWithRoles] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Assign-role dialog
  const [assignDialog, setAssignDialog] = useState({ open: false, user: null });
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // Remove-role confirm
  const [removeConfirm, setRemoveConfirm] = useState({ open: false, userId: null, roleId: null, roleName: "", userName: "" });

  // Reject role-request dialog
  const [rejectDialog, setRejectDialog] = useState({ open: false, requestId: null });
  const [rejectMessage, setRejectMessage] = useState("");
  const [rejectError, setRejectError] = useState("");

  // ── Fetch helpers ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes, pendingRes] = await Promise.all([
        getRoles(),
        getAdminUsersWithRoles(),
        getPendingRolesWithDetails(),
      ]);
      setRoles(rolesRes.data);
      setUsersWithRoles(usersRes.data);
      setPendingRequests(pendingRes.data);
    } catch (err) {
      showToast("Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  // ── Assign role ──────────────────────────────────────────────────────────
  const openAssignDialog = (user) => {
    setAssignDialog({ open: true, user });
    setSelectedRoleId("");
  };

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;
    const { user } = assignDialog;
    setActionLoading(`assign-${user.user_id}`);
    try {
      await assignRoleToUser(user.user_id, selectedRoleId);
      showToast(`Role assigned to ${user.name}.`);
      setAssignDialog({ open: false, user: null });
      fetchAll();
    } catch {
      showToast("Failed to assign role.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Remove role ──────────────────────────────────────────────────────────
  const openRemoveConfirm = (userId, roleId, roleName, userName) =>
    setRemoveConfirm({ open: true, userId, roleId, roleName, userName });

  const handleRemoveRole = async () => {
    const { userId, roleId } = removeConfirm;
    setActionLoading(`remove-${userId}-${roleId}`);
    setRemoveConfirm({ open: false, userId: null, roleId: null, roleName: "", userName: "" });
    try {
      await removeRoleFromUser(userId, roleId);
      showToast("Role removed.");
      fetchAll();
    } catch {
      showToast("Failed to remove role.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Approve role request ─────────────────────────────────────────────────
  const handleApproveRequest = async (requestId) => {
    setActionLoading(requestId);
    try {
      await approveRole(requestId);
      showToast("Role request approved.");
      fetchAll();
    } catch {
      showToast("Failed to approve request.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject role request ──────────────────────────────────────────────────
  const openRejectDialog = (requestId) => {
    setRejectDialog({ open: true, requestId });
    setRejectMessage("");
    setRejectError("");
  };

  const handleRejectRequest = async () => {
    if (!rejectMessage.trim()) {
      setRejectError("A rejection reason is required.");
      return;
    }
    const { requestId } = rejectDialog;
    setActionLoading(requestId);
    try {
      await rejectRole(requestId, rejectMessage);
      showToast("Role request rejected.", "info");
      setRejectDialog({ open: false, requestId: null });
      fetchAll();
    } catch {
      showToast("Failed to reject request.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalUsers = usersWithRoles.length;
  const totalRoles = roles.length;
  const pendingCount = pendingRequests.length;

  // Roles not yet assigned to a given user
  const availableRoles = (user) => {
    const assignedIds = (user.roles || []).map((r) => r.role_id);
    return roles.filter((r) => !assignedIds.includes(r.role_id));
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 4, maxWidth: 1040, mx: "auto" }}>

      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <ManageAccountsOutlinedIcon sx={{ fontSize: 28, color: "#42A5F5" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1.2 }}>
            Manage Roles
          </Typography>
          <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.3 }}>
            Assign roles, manage user permissions, and action role requests
          </Typography>
        </Box>
      </Box>

      {/* Stats row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <StatCard icon={<ShieldOutlinedIcon fontSize="small" />} label="Total Roles" value={totalRoles} color="#1565C0" />
        <StatCard icon={<PersonOutlineOutlinedIcon fontSize="small" />} label="Active Users" value={totalUsers} color="#2E7D32" />
        <StatCard icon={<PendingActionsOutlinedIcon fontSize="small" />} label="Pending Requests" value={pendingCount} color="#E65100" />
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          borderBottom: "1px solid #E0E7EF",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.88rem" },
          "& .Mui-selected": { color: "#1565C0" },
          "& .MuiTabs-indicator": { backgroundColor: "#1565C0" },
        }}
      >
        <Tab label={`All Roles (${totalRoles})`} id="tab-0" />
        <Tab label={`Users & Roles (${totalUsers})`} id="tab-1" />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              Role Requests
              {pendingCount > 0 && (
                <Chip
                  label={pendingCount}
                  size="small"
                  sx={{ height: 18, fontSize: "0.68rem", fontWeight: 700, backgroundColor: "#E65100", color: "#fff", borderRadius: "9px", px: 0.5 }}
                />
              )}
            </Box>
          }
          id="tab-2"
        />
      </Tabs>

      {/* ─── Loading ─────────────────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={36} sx={{ color: "#42A5F5" }} />
        </Box>
      ) : (
        <>
          {/* ══ Tab 0 — All Roles ══════════════════════════════════════════ */}
          {tab === 0 && (
            <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "10px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TH>#</TH>
                    <TH>Role Name</TH>
                    <TH align="center">Role ID</TH>
                    <TH align="center">Assigned Users</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role, idx) => {
                    const count = usersWithRoles.filter(
                      (u) => (u.roles || []).some((r) => r.role_id === role.role_id)
                    ).length;
                    return (
                      <TableRow key={role.role_id} sx={{ "&:last-child td": { border: 0 } }}>
                        <TableCell sx={{ color: "#B0BEC5", fontSize: "0.82rem", width: 40 }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Chip label={role.role_name} size="small" sx={getRoleChipSx(role.role_name)} />
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: "0.82rem", color: "#90A4AE", fontFamily: "monospace" }}>
                            {role.role_id}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={count}
                            size="small"
                            sx={{ backgroundColor: count > 0 ? "#E3F2FD" : "#F5F5F5", color: count > 0 ? "#1565C0" : "#B0BEC5", fontWeight: 700, fontSize: "0.78rem", height: 22, borderRadius: "4px" }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {roles.length === 0 && (
                    <EmptyRow
                      colSpan={4}
                      icon={<ShieldOutlinedIcon sx={{ fontSize: 40, color: "#B0BEC5" }} />}
                      title="No roles found"
                      sub="Roles are defined in the database."
                    />
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* ══ Tab 1 — Users & Roles ══════════════════════════════════════ */}
          {tab === 1 && (
            <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "10px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TH>User</TH>
                    <TH>Department</TH>
                    <TH>Assigned Roles</TH>
                    <TH align="center">Actions</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersWithRoles.map((user) => {
                    const isActioning = String(actionLoading).startsWith(`assign-${user.user_id}`) ||
                      String(actionLoading).startsWith(`remove-${user.user_id}`);
                    return (
                      <TableRow
                        key={user.user_id}
                        sx={{ "&:last-child td": { border: 0 }, opacity: isActioning ? 0.5 : 1, transition: "opacity 0.2s" }}
                      >
                        {/* User */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, backgroundColor: "#1565C0", fontSize: "0.8rem", fontWeight: 700 }}>
                              {user.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#0A1929" }}>
                                {user.name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.76rem", color: "#90A4AE" }}>
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Department */}
                        <TableCell>
                          <Chip
                            label={user.department || "—"}
                            size="small"
                            sx={{ backgroundColor: "#EEF2FF", color: "#3730A3", fontWeight: 600, fontSize: "0.72rem", height: 22, borderRadius: "4px" }}
                          />
                        </TableCell>

                        {/* Roles with remove buttons */}
                        <TableCell>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                            {(user.roles || []).length === 0 ? (
                              <Typography sx={{ fontSize: "0.82rem", color: "#B0BEC5" }}>No roles assigned</Typography>
                            ) : (
                              (user.roles || []).map((role) => (
                                <Box key={role.role_id} sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                                  <Chip label={role.role_name} size="small" sx={getRoleChipSx(role.role_name)} />
                                  <Tooltip title={`Remove ${role.role_name}`}>
                                    <IconButton
                                      size="small"
                                      sx={{ p: 0.3, color: "#EF9A9A", "&:hover": { color: "#F44336" } }}
                                      onClick={() => openRemoveConfirm(user.user_id, role.role_id, role.role_name, user.name)}
                                    >
                                      <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              ))
                            )}
                          </Box>
                        </TableCell>

                        {/* Assign button */}
                        <TableCell align="center">
                          {isActioning ? (
                            <CircularProgress size={20} sx={{ color: "#42A5F5" }} />
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                              onClick={() => openAssignDialog(user)}
                              disabled={availableRoles(user).length === 0}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.78rem",
                                borderColor: "#90CAF9",
                                color: "#1565C0",
                                "&:hover": { borderColor: "#1565C0", backgroundColor: "#E3F2FD" },
                                "&.Mui-disabled": { borderColor: "#E0E7EF", color: "#B0BEC5" },
                              }}
                            >
                              Assign Role
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {usersWithRoles.length === 0 && (
                    <EmptyRow
                      colSpan={4}
                      icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 40, color: "#B0BEC5" }} />}
                      title="No active users"
                      sub="Approved users will appear here."
                    />
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* ══ Tab 2 — Role Requests ══════════════════════════════════════ */}
          {tab === 2 && (
            <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "10px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TH>User</TH>
                    <TH>Department</TH>
                    <TH>Requested Role</TH>
                    <TH>Requested At</TH>
                    <TH align="center">Actions</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((req) => {
                    const isActioning = actionLoading === req.request_id;
                    return (
                      <TableRow
                        key={req.request_id}
                        sx={{ "&:last-child td": { border: 0 }, opacity: isActioning ? 0.5 : 1, transition: "opacity 0.2s" }}
                      >
                        {/* User */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 30, height: 30, backgroundColor: "#E65100", fontSize: "0.78rem", fontWeight: 700 }}>
                              {req.user_name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#0A1929" }}>
                                {req.user_name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.76rem", color: "#90A4AE" }}>
                                {req.user_email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Department */}
                        <TableCell>
                          <Typography sx={{ fontSize: "0.85rem", color: "#455A64" }}>
                            {req.department || "—"}
                          </Typography>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <Chip label={req.role_name} size="small" sx={getRoleChipSx(req.role_name)} />
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <Typography sx={{ fontSize: "0.83rem", color: "#607D8B" }}>
                            {req.requested_at
                              ? new Date(req.requested_at).toLocaleDateString("en-IN", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })
                              : "—"}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="center">
                          {isActioning ? (
                            <CircularProgress size={20} sx={{ color: "#42A5F5" }} />
                          ) : (
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleApproveRequest(req.request_id)}
                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem" }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<CancelOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => openRejectDialog(req.request_id)}
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
                  {pendingRequests.length === 0 && (
                    <EmptyRow
                      colSpan={5}
                      icon={<PendingActionsOutlinedIcon sx={{ fontSize: 40, color: "#B0BEC5" }} />}
                      title="No pending role requests"
                      sub="All role requests have been actioned."
                    />
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* ── Assign Role Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={assignDialog.open}
        onClose={() => setAssignDialog({ open: false, user: null })}
        PaperProps={{ sx: { borderRadius: "10px", minWidth: 380 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>
          Assign Role to {assignDialog.user?.name}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#607D8B", fontSize: "0.88rem", mb: 2.5 }}>
            Select a role to assign. This takes effect immediately.
          </DialogContentText>
          <FormControl fullWidth size="small">
            <InputLabel id="assign-role-label">Select Role</InputLabel>
            <Select
              labelId="assign-role-label"
              value={selectedRoleId}
              label="Select Role"
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              {assignDialog.user
                ? availableRoles(assignDialog.user).map((r) => (
                    <MenuItem key={r.role_id} value={r.role_id}>
                      {r.role_name}
                    </MenuItem>
                  ))
                : null}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setAssignDialog({ open: false, user: null })}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignRole}
            variant="contained"
            size="small"
            disabled={!selectedRoleId}
            sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0" }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Remove Role Confirm ────────────────────────────────────────────── */}
      <Dialog
        open={removeConfirm.open}
        onClose={() => setRemoveConfirm({ open: false, userId: null, roleId: null, roleName: "", userName: "" })}
        PaperProps={{ sx: { borderRadius: "10px", minWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>
          Remove Role?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#455A64", fontSize: "0.9rem" }}>
            Remove <strong>{removeConfirm.roleName}</strong> from <strong>{removeConfirm.userName}</strong>?
            This takes effect immediately.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setRemoveConfirm({ open: false, userId: null, roleId: null, roleName: "", userName: "" })}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemoveRole}
            variant="contained"
            color="error"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Yes, Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reject Role Request Dialog ─────────────────────────────────────── */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, requestId: null })}
        PaperProps={{ sx: { borderRadius: "10px", minWidth: 420 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>
          Reject Role Request
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#455A64", fontSize: "0.88rem", mb: 2 }}>
            Provide a reason for rejecting this role request. The user will see this message.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="e.g. This role requires team lead approval first."
            value={rejectMessage}
            onChange={(e) => { setRejectMessage(e.target.value); setRejectError(""); }}
            error={!!rejectError}
            helperText={rejectError}
            sx={{ backgroundColor: "#FAFAFA" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setRejectDialog({ open: false, requestId: null })}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectRequest}
            variant="contained"
            color="error"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageRoles;
