// src/pages/ManageTags.jsx
import { useEffect, useState, useCallback } from "react";
import {
  getAllTags, createTag, updateTag, deleteTag,
  getPendingTagsWithDetails, approveTag, rejectTag,
  getUsersWithTags, assignTagToUser, removeTagFromUser,
} from "../api/tags";
import {
  Box, Typography, Card, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Chip, CircularProgress, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TextField, Tabs, Tab,
  Select, MenuItem, FormControl, InputLabel, Avatar, IconButton, Tooltip,
  InputAdornment,
} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

// ── helpers ───────────────────────────────────────────────────────────────
const TAG_PALETTE = [
  "#1565C0","#6A1B9A","#2E7D32","#E65100","#B71C1C",
  "#00838F","#37474F","#4527A0","#558B2F","#AD1457",
];

// Deterministic color per tag name
const tagColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % TAG_PALETTE.length;
  return TAG_PALETTE[h];
};

const TagPill = ({ name, size = "small" }) => (
  <Chip
    label={name}
    size={size}
    sx={{
      backgroundColor: tagColor(name) + "18",
      color: tagColor(name),
      border: `1px solid ${tagColor(name)}40`,
      fontWeight: 600,
      fontSize: "0.72rem",
      height: 22,
      borderRadius: "5px",
    }}
  />
);

const TH = ({ children, align = "left" }) => (
  <TableCell align={align} sx={{
    fontWeight: 700, color: "#0A1929", fontSize: "0.75rem",
    textTransform: "uppercase", letterSpacing: 0.5,
    backgroundColor: "#F5F7FA", py: 1.4,
  }}>
    {children}
  </TableCell>
);

const StatCard = ({ icon, label, value, color }) => (
  <Card elevation={0} sx={{
    border: "1px solid #E0E7EF", borderRadius: "10px",
    p: 2.5, display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 150,
  }}>
    <Box sx={{ width: 44, height: 44, borderRadius: "10px", backgroundColor: `${color}18`,
               display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#0A1929", lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "0.78rem", color: "#607D8B", fontWeight: 500 }}>{label}</Typography>
    </Box>
  </Card>
);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ═════════════════════════════════════════════════════════════════════════════
const ManageTags = () => {
  const [tab, setTab] = useState(0);
  const [tags, setTags] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [usersWithTags, setUsersWithTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Create / Edit dialog
  const [tagDialog, setTagDialog] = useState({ open: false, mode: "create", tag: null });
  const [tagName, setTagName] = useState("");
  const [tagNameErr, setTagNameErr] = useState("");
  const [tagSaving, setTagSaving] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, tag: null });

  // Assign tag to user dialog
  const [assignDialog, setAssignDialog] = useState({ open: false, user: null });
  const [selectedTagId, setSelectedTagId] = useState("");

  // Reject tag request dialog
  const [rejectDialog, setRejectDialog] = useState({ open: false, requestId: null });

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  // ── fetch ────────────────────────────────────────────────────────────────
  // const fetchAll = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const [tagsRes, pendingRes, usersRes] = await Promise.all([
  //       getAllTags(),
  //       getPendingTagsWithDetails(),
  //       getUsersWithTags(),
  //     ]);
  //     setTags(tagsRes.data);
  //     setPendingRequests(pendingRes.data);
  //     setUsersWithTags(usersRes.data);
  //   } catch {
  //     showToast("Failed to load data.", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

// changed the database for the testing
  const fetchAll = useCallback(async () => {
    setLoading(true);

    try {
        const tagsRes = await getAllTags();
        console.log("GET ALL TAGS:", tagsRes.data);
        setTags(tagsRes.data);

        const pendingRes = await getPendingTagsWithDetails();
        console.log("PENDING TAGS:", pendingRes.data);
        setPendingRequests(pendingRes.data);

        const usersRes = await getUsersWithTags();
        console.log("USERS WITH TAGS:", usersRes.data);
        setUsersWithTags(usersRes.data);

    } catch (err) {
        console.error("MANAGE TAGS ERROR:", err);
        console.error("STATUS:", err?.response?.status);
        console.error("SERVER MESSAGE:", err?.response?.data);

        showToast(
            err?.response?.data?.message ||
            "Failed to load data.",
            "error"
        );
    } finally {
        setLoading(false);
    }
}, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── create/edit tag ──────────────────────────────────────────────────────
  const openCreate = () => { setTagDialog({ open: true, mode: "create", tag: null }); setTagName(""); setTagNameErr(""); };
  const openEdit = (tag) => { setTagDialog({ open: true, mode: "edit", tag }); setTagName(tag.tag_name); setTagNameErr(""); };

  const handleSaveTag = async () => {
    if (!tagName.trim()) { setTagNameErr("Tag name is required."); return; }
    if (tagName.trim().length > 50) { setTagNameErr("Max 50 characters."); return; }
    setTagSaving(true);
    try {
      if (tagDialog.mode === "create") {
        await createTag(tagName.trim());
        showToast("Tag created.");
      } else {
        await updateTag(tagDialog.tag.tag_id, tagName.trim());
        showToast("Tag updated.");
      }
      setTagDialog({ open: false, mode: "create", tag: null });
      fetchAll();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save tag.", "error");
    } finally {
      setTagSaving(false);
    }
  };

  // ── delete tag ───────────────────────────────────────────────────────────
  const handleDeleteTag = async () => {
    const { tag } = deleteConfirm;
    setActionLoading(`del-${tag.tag_id}`);
    setDeleteConfirm({ open: false, tag: null });
    try {
      await deleteTag(tag.tag_id);
      showToast(`"${tag.tag_name}" deleted.`);
      fetchAll();
    } catch (err) {
      showToast(err?.response?.data?.message || "Delete failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── approve tag request ──────────────────────────────────────────────────
  const handleApprove = async (requestId) => {
    setActionLoading(requestId);
    try {
      await approveTag(requestId);
      showToast("Tag request approved — tag created and assigned.");
      fetchAll();
    } catch { showToast("Failed to approve.", "error"); }
    finally { setActionLoading(null); }
  };

  // ── reject tag request ───────────────────────────────────────────────────
  const handleReject = async () => {
    const { requestId } = rejectDialog;
    setActionLoading(requestId);
    try {
      await rejectTag(requestId);
      showToast("Tag request rejected.", "info");
      setRejectDialog({ open: false, requestId: null });
      fetchAll();
    } catch { showToast("Failed to reject.", "error"); }
    finally { setActionLoading(null); }
  };

  // ── assign tag to user ───────────────────────────────────────────────────
  const openAssign = (user) => { setAssignDialog({ open: true, user }); setSelectedTagId(""); };

  const handleAssignTag = async () => {
    if (!selectedTagId) return;
    const { user } = assignDialog;
    setActionLoading(`assign-${user.user_id}`);
    try {
      await assignTagToUser(user.user_id, selectedTagId);
      showToast(`Tag assigned to ${user.name}.`);
      setAssignDialog({ open: false, user: null });
      fetchAll();
    } catch { showToast("Failed to assign.", "error"); }
    finally { setActionLoading(null); }
  };

  // ── remove tag from user ─────────────────────────────────────────────────
  const handleRemoveTag = async (userId, tagId, tagName, userName) => {
    setActionLoading(`rm-${userId}-${tagId}`);
    try {
      await removeTagFromUser(userId, tagId);
      showToast(`Removed "${tagName}" from ${userName}.`);
      fetchAll();
    } catch { showToast("Failed to remove.", "error"); }
    finally { setActionLoading(null); }
  };

  // ── derived ──────────────────────────────────────────────────────────────
  const filteredTags = tags.filter((t) =>
    t.tag_name.toLowerCase().includes(search.toLowerCase())
  );

  const availableTagsForUser = (user) => {
    const assigned = (user.tags || []).map((t) => t.tag_id);
    return tags.filter((t) => !assigned.includes(t.tag_id));
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 4, maxWidth: 1040, mx: "auto" }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <LocalOfferOutlinedIcon sx={{ fontSize: 28, color: "#42A5F5" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1.2 }}>
            Manage Tags
          </Typography>
          <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.3 }}>
            Create, edit, delete expertise tags — manage requests and user assignments
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <StatCard icon={<LocalOfferOutlinedIcon fontSize="small" />} label="Total Tags" value={tags.length} color="#1565C0" />
        <StatCard icon={<PendingActionsOutlinedIcon fontSize="small" />} label="Pending Requests" value={pendingRequests.length} color="#E65100" />
        <StatCard icon={<PersonOutlineOutlinedIcon fontSize="small" />} label="Active Users" value={usersWithTags.length} color="#2E7D32" />
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3, borderBottom: "1px solid #E0E7EF",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.88rem" },
          "& .Mui-selected": { color: "#1565C0" },
          "& .MuiTabs-indicator": { backgroundColor: "#1565C0" },
        }}
      >
        <Tab label={`All Tags (${tags.length})`} id="tab-0" />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              Tag Requests
              {pendingRequests.length > 0 && (
                <Chip label={pendingRequests.length} size="small" sx={{
                  height: 18, fontSize: "0.68rem", fontWeight: 700,
                  backgroundColor: "#E65100", color: "#fff", borderRadius: "9px", px: 0.5,
                }} />
              )}
            </Box>
          }
          id="tab-1"
        />
        <Tab label={`Users & Tags (${usersWithTags.length})`} id="tab-2" />
      </Tabs>

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={36} sx={{ color: "#42A5F5" }} />
        </Box>
      ) : (
        <>
          {/* ══ Tab 0 — All Tags ══════════════════════════════════════════ */}
          {tab === 0 && (
            <>
              {/* Toolbar */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  placeholder="Search tags…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon sx={{ fontSize: 18, color: "#90A4AE" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 280, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
                  onClick={openCreate}
                  sx={{
                    textTransform: "none", fontWeight: 600, fontSize: "0.85rem",
                    backgroundColor: "#1565C0", borderRadius: "8px",
                    "&:hover": { backgroundColor: "#0D47A1" },
                  }}
                >
                  Create Tag
                </Button>
              </Box>

              <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "10px" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TH>#</TH>
                      <TH>Tag Name</TH>
                      <TH align="center">Status</TH>
                      <TH>Created</TH>
                      <TH align="center">Actions</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTags.map((tag, idx) => {
                      const isDeleting = actionLoading === `del-${tag.tag_id}`;
                      return (
                        <TableRow key={tag.tag_id} sx={{
                          "&:last-child td": { border: 0 },
                          opacity: isDeleting ? 0.4 : 1,
                          transition: "opacity 0.2s",
                          "&:hover": { backgroundColor: "#F8FAFC" },
                        }}>
                          <TableCell sx={{ color: "#B0BEC5", fontSize: "0.8rem", width: 40 }}>{idx + 1}</TableCell>
                          <TableCell>
                            <TagPill name={tag.tag_name} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={tag.status || "approved"}
                              size="small"
                              sx={{
                                backgroundColor: tag.status === "approved" ? "#E8F5E9" : "#FFF8E1",
                                color: tag.status === "approved" ? "#2E7D32" : "#F57F17",
                                fontWeight: 600, fontSize: "0.7rem", height: 20, borderRadius: "4px",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: "0.82rem", color: "#90A4AE" }}>
                              {fmtDate(tag.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {isDeleting ? (
                              <CircularProgress size={18} sx={{ color: "#42A5F5" }} />
                            ) : (
                              <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                                <Tooltip title="Edit name">
                                  <IconButton size="small" onClick={() => openEdit(tag)}
                                    sx={{ color: "#1565C0", "&:hover": { backgroundColor: "#E3F2FD" } }}>
                                    <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete tag">
                                  <IconButton size="small"
                                    onClick={() => setDeleteConfirm({ open: true, tag })}
                                    sx={{ color: "#EF9A9A", "&:hover": { color: "#F44336", backgroundColor: "#FDEDED" } }}>
                                    <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredTags.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                          <LocalOfferOutlinedIcon sx={{ fontSize: 40, color: "#B0BEC5" }} />
                          <Typography sx={{ color: "#607D8B", fontWeight: 500, mt: 1 }}>
                            {search ? "No tags match your search" : "No tags yet"}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#90A4AE", mt: 0.5 }}>
                            {!search && 'Click "Create Tag" to add the first one.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}

          {/* ══ Tab 1 — Tag Requests ══════════════════════════════════════ */}
          {tab === 1 && (
            <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "10px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TH>Requested By</TH>
                    <TH>Department</TH>
                    <TH>Tag Name</TH>
                    <TH>Requested At</TH>
                    <TH align="center">Actions</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((req) => {
                    const isActioning = actionLoading === req.request_id;
                    return (
                      <TableRow key={req.request_id} sx={{
                        "&:last-child td": { border: 0 },
                        opacity: isActioning ? 0.4 : 1, transition: "opacity 0.2s",
                      }}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 30, height: 30, backgroundColor: "#E65100", fontSize: "0.78rem", fontWeight: 700 }}>
                              {req.user_name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.86rem", color: "#0A1929" }}>
                                {req.user_name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.74rem", color: "#90A4AE" }}>
                                {req.user_email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: "0.83rem", color: "#607D8B" }}>{req.department || "—"}</Typography>
                        </TableCell>
                        <TableCell>
                          <TagPill name={req.tag_name} />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: "0.82rem", color: "#607D8B" }}>
                            {fmtDate(req.requested_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {isActioning ? (
                            <CircularProgress size={20} sx={{ color: "#42A5F5" }} />
                          ) : (
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                              <Button variant="contained" color="success" size="small"
                                startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleApprove(req.request_id)}
                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem" }}>
                                Approve
                              </Button>
                              <Button variant="contained" color="error" size="small"
                                startIcon={<CancelOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => setRejectDialog({ open: true, requestId: req.request_id })}
                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem" }}>
                                Reject
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pendingRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                        <PendingActionsOutlinedIcon sx={{ fontSize: 40, color: "#B0BEC5" }} />
                        <Typography sx={{ color: "#607D8B", fontWeight: 500, mt: 1 }}>
                          No pending tag requests
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#90A4AE", mt: 0.4 }}>
                          All requests have been actioned.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* ══ Tab 2 — Users & Tags ══════════════════════════════════════ */}
          {tab === 2 && (
            <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "10px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TH>User</TH>
                    <TH>Department</TH>
                    <TH>Expertise Tags</TH>
                    <TH align="center">Assign</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersWithTags.map((user) => {
                    const isAssigning = actionLoading === `assign-${user.user_id}`;
                    return (
                      <TableRow key={user.user_id} sx={{
                        "&:last-child td": { border: 0 },
                        opacity: isAssigning ? 0.4 : 1, transition: "opacity 0.2s",
                        "&:hover": { backgroundColor: "#F8FAFC" },
                      }}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, backgroundColor: "#1565C0", fontSize: "0.8rem", fontWeight: 700 }}>
                              {user.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.86rem", color: "#0A1929" }}>
                                {user.name}
                              </Typography>
                              <Typography sx={{ fontSize: "0.74rem", color: "#90A4AE" }}>
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={user.department || "—"} size="small" sx={{
                            backgroundColor: "#EEF2FF", color: "#3730A3",
                            fontWeight: 600, fontSize: "0.72rem", height: 22, borderRadius: "4px",
                          }} />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 320 }}>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                            {(user.tags || []).length === 0 ? (
                              <Typography sx={{ fontSize: "0.81rem", color: "#B0BEC5" }}>No tags</Typography>
                            ) : (
                              (user.tags || []).map((tag) => {
                                const isRemoving = actionLoading === `rm-${user.user_id}-${tag.tag_id}`;
                                return (
                                  <Box key={tag.tag_id} sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
                                    <TagPill name={tag.tag_name} />
                                    <Tooltip title={`Remove ${tag.tag_name}`}>
                                      <IconButton size="small" disabled={isRemoving}
                                        onClick={() => handleRemoveTag(user.user_id, tag.tag_id, tag.tag_name, user.name)}
                                        sx={{ p: 0.25, color: "#EF9A9A", "&:hover": { color: "#F44336" } }}>
                                        {isRemoving
                                          ? <CircularProgress size={11} />
                                          : <DeleteOutlinedIcon sx={{ fontSize: 13 }} />}
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                );
                              })
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {isAssigning ? (
                            <CircularProgress size={20} sx={{ color: "#42A5F5" }} />
                          ) : (
                            <Button variant="outlined" size="small"
                              onClick={() => openAssign(user)}
                              disabled={availableTagsForUser(user).length === 0}
                              sx={{
                                textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
                                borderColor: "#90CAF9", color: "#1565C0", borderRadius: "6px",
                                "&:hover": { borderColor: "#1565C0", backgroundColor: "#E3F2FD" },
                                "&.Mui-disabled": { borderColor: "#E0E7EF", color: "#B0BEC5" },
                              }}>
                              Assign Tag
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {usersWithTags.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                        <PersonOutlineOutlinedIcon sx={{ fontSize: 40, color: "#B0BEC5" }} />
                        <Typography sx={{ color: "#607D8B", fontWeight: 500, mt: 1 }}>No active users</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* ── Create/Edit Tag Dialog ─────────────────────────────────────────── */}
      <Dialog open={tagDialog.open} onClose={() => setTagDialog({ open: false, mode: "create", tag: null })}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 380 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>
          {tagDialog.mode === "create" ? "Create New Tag" : `Edit "${tagDialog.tag?.tag_name}"`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#607D8B", fontSize: "0.87rem", mb: 2.5 }}>
            {tagDialog.mode === "create"
              ? "Enter an expertise tag name (e.g. SAP MM, ABAP, Workflow)."
              : "Update the tag name. Existing assignments keep the tag ID unchanged."}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Tag Name"
            placeholder="e.g. SAP MM"
            value={tagName}
            onChange={(e) => { setTagName(e.target.value); setTagNameErr(""); }}
            error={!!tagNameErr}
            helperText={tagNameErr}
            onKeyDown={(e) => e.key === "Enter" && handleSaveTag()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setTagDialog({ open: false, mode: "create", tag: null })}
            variant="outlined" size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>
            Cancel
          </Button>
          <Button onClick={handleSaveTag} variant="contained" size="small"
            disabled={tagSaving}
            sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0" }}>
            {tagSaving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : tagDialog.mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
      <Dialog open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, tag: null })}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 340 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>Delete Tag?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#455A64", fontSize: "0.9rem" }}>
            Delete <strong>{deleteConfirm.tag?.tag_name}</strong>? This will also remove it from all users and articles.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, tag: null })}
            variant="outlined" size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteTag} variant="contained" color="error" size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reject Tag Request Confirm ─────────────────────────────────────── */}
      <Dialog open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, requestId: null })}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 340 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>Reject Tag Request?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#455A64", fontSize: "0.9rem" }}>
            This tag request will be marked as rejected and the user will not receive the tag.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setRejectDialog({ open: false, requestId: null })}
            variant="outlined" size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>
            Cancel
          </Button>
          <Button onClick={handleReject} variant="contained" color="error" size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Assign Tag to User Dialog ──────────────────────────────────────── */}
      <Dialog open={assignDialog.open}
        onClose={() => setAssignDialog({ open: false, user: null })}
        PaperProps={{ sx: { borderRadius: "12px", minWidth: 380 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", pb: 1 }}>
          Assign Tag to {assignDialog.user?.name}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#607D8B", fontSize: "0.87rem", mb: 2.5 }}>
            Select an expertise tag to assign. Tag assignments take effect immediately.
          </DialogContentText>
          <FormControl fullWidth size="small">
            <InputLabel>Select Tag</InputLabel>
            <Select value={selectedTagId} label="Select Tag" onChange={(e) => setSelectedTagId(e.target.value)}>
              {assignDialog.user
                ? availableTagsForUser(assignDialog.user).map((t) => (
                    <MenuItem key={t.tag_id} value={t.tag_id}>{t.tag_name}</MenuItem>
                  ))
                : null}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setAssignDialog({ open: false, user: null })}
            variant="outlined" size="small"
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>
            Cancel
          </Button>
          <Button onClick={handleAssignTag} variant="contained" size="small"
            disabled={!selectedTagId}
            sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0" }}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageTags;
