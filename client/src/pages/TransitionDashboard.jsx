// src/pages/TransitionDashboard.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box, Card, Typography, Button, Chip, CircularProgress,
  Grid, LinearProgress, List, ListItem, ListItemText,
  Checkbox, Divider, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, IconButton,
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddIcon from "@mui/icons-material/Add";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { getAllTransitions, getMyTransitions, deleteTransition, getTransitionTasks, updateTaskStatus, createTransition, getPhaseProgress, createTransitionTask, updateTransitionTaskDetails, deleteTransitionTask, getTaskAttachments, uploadTaskAttachment, deleteTaskAttachment } from "../api/transitions";
import { getUsers } from "../api/articles";
import { useAuth } from "../context/AuthContext";

const SAP_MODULES = [
  "SAP MM", "SAP FI", "SAP CO", "SAP SD", "SAP PP",
  "SAP HR", "SAP PM", "SAP QM", "SAP WM", "ABAP", "Basis", "Other",
];

const STATUS_CHIP = {
  pending:     { label: "Pending",     bg: "#FFF3E0", color: "#E65100" },
  in_progress: { label: "In Progress", bg: "#E3F2FD", color: "#1565C0" },
  completed:   { label: "Completed",   bg: "#E8F5E9", color: "#2E7D32" },
  blocked:     { label: "Blocked",     bg: "#FFEBEE", color: "#C62828" },
};

// Delete is now available to every user (not just admins), and shows a
// sequential display number (1, 2, 3…) instead of the raw transition_id,
// so numbering always starts at 1 and never shows a stale/deleted id.
const TransitionCard = ({ transition, displayNumber, onExpand, expanded, onDelete }) => {
  const s = STATUS_CHIP[(transition.overall_status || "").toLowerCase().replace(" ", "_")] || STATUS_CHIP.pending;
  const progress = transition.completion_percentage ?? 0;

  return (
    <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", backgroundColor: "#FFFFFF", overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#0A1929", fontSize: "0.95rem" }}>
              {transition.title || `Transition #${displayNumber}`}
            </Typography>

            <Typography variant="caption" sx={{ color: "#90A4AE" }}>
              {transition.remarks || "No description"} &nbsp;·&nbsp;
              {transition.start_date ? new Date(transition.start_date).toLocaleDateString("en-IN") : ""}
              {transition.target_completion_date ? ` → ${new Date(transition.target_completion_date).toLocaleDateString("en-IN")}` : ""}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "#90A4AE", mt: 0.3 }}>
              {transition.from_user_name || "—"} → {transition.to_user_name || "—"}
            </Typography>
          </Box>
          <Chip label={s.label} size="small"
            sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.65rem", height: 22, borderRadius: "4px", ml: 2 }} />
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#637381", fontWeight: 600 }}>Completion</Typography>
            <Typography variant="caption" sx={{ color: "#1565C0", fontWeight: 700 }}>{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate" value={progress}
            sx={{
              height: 8, borderRadius: 4,
              backgroundColor: "#E3F2FD",
              "& .MuiLinearProgress-bar": { backgroundColor: progress === 100 ? "#2E7D32" : "#1565C0", borderRadius: 4 },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1.5 }}>
          <Button
            size="small" color="error" onClick={() => onDelete(transition.transition_id)}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8rem" }}
          >
            Delete
          </Button>
          <Button
            size="small" onClick={() => onExpand(transition.transition_id)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ textTransform: "none", color: "#1565C0", fontWeight: 600, fontSize: "0.8rem" }}
          >
            {expanded ? "Hide Tasks" : "View Tasks"}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

const PhasedTaskList = ({ transitionId, users, canManageTasks }) => {
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);
  const [attachments, setAttachments] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [blockedMsg, setBlockedMsg] = useState("");
  const [signOffDialog, setSignOffDialog] = useState({ open: false, task: null, notes: "" });
  const [taskDialog, setTaskDialog] = useState({ open: false, task: null });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", phase_id: "", assigned_to: "", due_date: "", depends_on_task_id: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, phasesRes] = await Promise.all([
        getTransitionTasks(transitionId),
        getPhaseProgress(transitionId),
      ]);
      setTasks(tasksRes.data?.data || tasksRes.data || []);
      setPhases(phasesRes.data?.data || phasesRes.data || []);
      const attachmentEntries = await Promise.all((tasksRes.data?.data || tasksRes.data || []).map(async (task) => {
        try {
          const response = await getTaskAttachments(task.task_id);
          return [task.task_id, response.data?.data || response.data || []];
        } catch {
          return [task.task_id, []];
        }
      }));
      setAttachments(Object.fromEntries(attachmentEntries));
    } catch {
      setTasks([]);
      setPhases([]);
      setAttachments({});
    } finally {
      setLoading(false);
    }
  }, [transitionId]);

  useEffect(() => {
    load();
  }, [load]);

  const openTaskDialog = (task = null) => {
    setTaskDialog({ open: true, task });
    setTaskForm(task ? {
      title: task.title || task.task_name || "",
      description: task.description || "",
      phase_id: task.phase_id || phases.find((p) => p.phase_name === task.phase_name)?.phase_id || "",
      assigned_to: task.assigned_to || "",
      due_date: task.due_date ? String(task.due_date).slice(0, 10) : "",
      depends_on_task_id: task.depends_on_task_id || "",
    } : { title: "", description: "", phase_id: phases[0]?.phase_id || "", assigned_to: "", due_date: "", depends_on_task_id: "" });
  };

  const saveTask = async () => {
    if (!taskForm.title.trim() || !taskForm.phase_id) {
      setBlockedMsg("Task title and phase are required.");
      return;
    }
    try {
      if (taskDialog.task) await updateTransitionTaskDetails(taskDialog.task.task_id, taskForm);
      else await createTransitionTask(transitionId, taskForm);
      setTaskDialog({ open: false, task: null });
      await load();
    } catch (err) {
      setBlockedMsg(err.response?.data?.message || "Could not save this task.");
    }
  };

  const removeTask = async (task) => {
    try {
      await deleteTransitionTask(task.task_id);
      await load();
    } catch (err) {
      setBlockedMsg(err.response?.data?.message || "Could not delete this task.");
    }
  };

  const isLocked = (task) =>
    !!task.depends_on_task_id && task.depends_on_status !== "completed";

  const applyStatus = async (task, next, notes) => {
    setUpdating(task.task_id);
    try {
      await updateTaskStatus(task.task_id, next, notes ? { sign_off_notes: notes } : undefined);
      setTasks((prev) => prev.map((t) =>
        t.task_id === task.task_id ? { ...t, status: next, sign_off_notes: notes ?? t.sign_off_notes } : t
      ));
    } catch (err) {
      setBlockedMsg(err?.response?.data?.message || "Could not update this task.");
    } finally {
      setUpdating(null);
    }
  };

  const handleToggle = (task) => {
    if (isLocked(task)) {
      setBlockedMsg(`Complete "${task.depends_on_title}" before starting this task.`);
      return;
    }
    if (task.status === "completed") {
      applyStatus(task, "pending");
      return;
    }
    // Completing a task — capture a sign-off note first.
    setSignOffDialog({ open: true, task, notes: "" });
  };

  const confirmSignOff = async () => {
    const { task, notes } = signOffDialog;
    setSignOffDialog({ open: false, task: null, notes: "" });
    await applyStatus(task, "completed", notes);
  };

  if (loading) return <Box sx={{ px: 3, py: 2 }}><CircularProgress size={20} sx={{ color: "#1565C0" }} /></Box>;

  const tasksForPhase = (phase) => tasks.filter((task) =>
    String(task.phase_id) === String(phase.phase_id) || task.phase_name === phase.phase_name
  );
  const uploadFile = async (taskId, file) => {
    if (!file) return;
    const response = await uploadTaskAttachment(taskId, file);
    setAttachments((current) => ({ ...current, [taskId]: [response.data?.data || response.data, ...(current[taskId] || [])] }));
  };
  const removeFile = async (taskId, attachmentId) => {
    await deleteTaskAttachment(attachmentId);
    setAttachments((current) => ({ ...current, [taskId]: (current[taskId] || []).filter((file) => file.attachment_id !== attachmentId) }));
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", borderTop: "1px solid #EEEEEE" }}>
      {canManageTasks && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1 }}>
          <Button size="small" startIcon={<AddIcon />} onClick={() => openTaskDialog()} sx={{ textTransform: "none" }}>Add Task</Button>
        </Box>
      )}
      {phases.map((phase) => {
        const phaseTasks = tasksForPhase(phase);
        const totalTasks = Number(phase.total_tasks);
        return (
          <Box key={phase.phase_id} sx={{ borderTop: "1px solid #E5E7EB" }}>
            <Box sx={{ px: 3, pt: 2, pb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#455A64", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {phase.phase_name}
                </Typography>
                <Typography variant="caption" sx={{ color: totalTasks === 0 ? "#90A4AE" : "#637381", fontWeight: 600 }}>
                  {totalTasks === 0 ? "No tasks in this phase" : `${phase.completed_tasks}/${totalTasks} · ${phase.completion_percentage}%`}
                </Typography>
              </Box>
              {totalTasks > 0 && (
                <LinearProgress variant="determinate" value={Number(phase.completion_percentage)} sx={{ height: 6, borderRadius: 3 }} />
              )}
            </Box>
            <List disablePadding>
              {phaseTasks.map((task, index) => {
                const locked = isLocked(task);
                const overdue = task.status !== "completed" && task.due_date && new Date(task.due_date) < new Date(new Date().toDateString());
                return (
                  <Box key={task.task_id}>
                    <ListItem sx={{ px: 3, py: 1.2, opacity: locked ? 0.6 : 1 }}>
                      {locked ? (
                        <LockOutlinedIcon fontSize="small" sx={{ color: "#90A4AE", mr: 2 }} />
                      ) : (
                        <Checkbox
                          checked={task.status === "completed"}
                          onChange={() => handleToggle(task)}
                          disabled={updating === task.task_id}
                          size="small"
                          sx={{ color: "#1565C0", "&.Mui-checked": { color: "#2E7D32" }, mr: 1 }}
                        />
                      )}
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500, color: task.status === "completed" ? "#90A4AE" : "#0A1929", textDecoration: task.status === "completed" ? "line-through" : "none", fontSize: "0.85rem" }}>
                            {task.task_name || task.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            {task.description}
                            <br />
                            <span style={{ fontSize: "0.72rem", color: "#90A4AE" }}>
                              Assigned to: {task.assigned_to_name || "Unassigned"}
                              {task.due_date && ` · Due: ${new Date(task.due_date).toLocaleDateString("en-IN")}`}
                              {task.depends_on_title && ` · Depends on: ${task.depends_on_title} (${task.depends_on_status || "pending"})`}
                              {task.signed_off_by_name && ` · Signed off by: ${task.signed_off_by_name}`}
                              {task.sign_off_notes && ` — "${task.sign_off_notes}"`}
                            </span>
                          </>
                        }
                      />
                      {overdue && <Chip label="Overdue" size="small" sx={{ mr: 0.5, backgroundColor: "#FFEBEE", color: "#C62828", fontWeight: 700, fontSize: "0.62rem", height: 20 }} />}
                      <Chip label={STATUS_CHIP[task.status]?.label || task.status} size="small" sx={{ backgroundColor: STATUS_CHIP[task.status]?.bg || "#F5F5F5", color: STATUS_CHIP[task.status]?.color || "#637381", fontWeight: 700, fontSize: "0.62rem", height: 20, borderRadius: "3px" }} />
                      {canManageTasks && (
                        <>
                          <IconButton size="small" onClick={() => openTaskDialog(task)}><EditOutlinedIcon sx={{ fontSize: 17 }} /></IconButton>
                          <IconButton size="small" onClick={() => removeTask(task)}><DeleteOutlineOutlinedIcon sx={{ fontSize: 17, color: "#C62828" }} /></IconButton>
                        </>
                      )}
                    </ListItem>
                    <Box sx={{ px: 8, pb: 1.2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      {canManageTasks && <Button component="label" size="small" sx={{ textTransform: "none", fontSize: "0.7rem" }}>
                        Add file
                        <input hidden type="file" onChange={(event) => { uploadFile(task.task_id, event.target.files?.[0]); event.target.value = ""; }} />
                      </Button>}
                      {(attachments[task.task_id] || []).map((file) => (
                        <Chip
                          key={file.attachment_id}
                          label={file.file_name}
                          size="small"
                          component="a"
                          href={`http://localhost:3001${file.file_path}`}
                          target="_blank"
                          clickable
                          onDelete={canManageTasks ? () => removeFile(task.task_id, file.attachment_id) : undefined}
                          sx={{ fontSize: "0.68rem" }}
                        />
                      ))}
                    </Box>
                    {index < phaseTasks.length - 1 && <Divider sx={{ mx: 3 }} />}
                  </Box>
                );
              })}
            </List>
          </Box>
        );
      })}
      {phases.length === 0 && <Typography variant="body2" sx={{ px: 3, pb: 2, color: "#90A4AE" }}>No phases found.</Typography>}

      <Dialog open={signOffDialog.open} onClose={() => setSignOffDialog({ open: false, task: null, notes: "" })}>
        <DialogTitle>Sign off — {signOffDialog.task?.task_name || signOffDialog.task?.title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Sign-off notes (optional)"
            multiline
            minRows={2}
            fullWidth
            sx={{ mt: 1 }}
            value={signOffDialog.notes}
            onChange={(e) => setSignOffDialog({ ...signOffDialog, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignOffDialog({ open: false, task: null, notes: "" })}>Cancel</Button>
          <Button variant="contained" onClick={confirmSignOff}>Mark Complete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={taskDialog.open} onClose={() => setTaskDialog({ open: false, task: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{taskDialog.task ? "Edit Task" : "Add Task"}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField label="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
            <TextField label="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} multiline minRows={2} />
            <FormControl fullWidth required><InputLabel>Phase</InputLabel><Select value={taskForm.phase_id} label="Phase" onChange={(e) => setTaskForm({ ...taskForm, phase_id: e.target.value })}>{phases.map((p) => <MenuItem key={p.phase_id} value={p.phase_id}>{p.phase_name}</MenuItem>)}</Select></FormControl>
            <FormControl fullWidth><InputLabel>Assignee</InputLabel><Select value={taskForm.assigned_to} label="Assignee" onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}><MenuItem value="">Unassigned</MenuItem>{users.map((u) => <MenuItem key={u.user_id || u.id} value={u.user_id || u.id}>{u.name || u.email}</MenuItem>)}</Select></FormControl>
            <TextField label="Due date" type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth><InputLabel>Depends on</InputLabel><Select value={taskForm.depends_on_task_id} label="Depends on" onChange={(e) => setTaskForm({ ...taskForm, depends_on_task_id: e.target.value })}><MenuItem value="">None</MenuItem>{tasks.filter((t) => t.task_id !== taskDialog.task?.task_id).map((t) => <MenuItem key={t.task_id} value={t.task_id}>{t.title || t.task_name}</MenuItem>)}</Select></FormControl>
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setTaskDialog({ open: false, task: null })}>Cancel</Button><Button variant="contained" onClick={saveTask}>Save</Button></DialogActions>
      </Dialog>

      {blockedMsg && (
        <Alert severity="warning" onClose={() => setBlockedMsg("")} sx={{ mx: 3, mb: 2 }}>
          {blockedMsg}
        </Alert>
      )}
    </Box>
  );
};

const TransitionDashboard = () => {
  const { user } = useAuth();
  const isAdmin = (user?.roles || []).some((role) => String(role).toLowerCase() === "admin") || String(user?.role || "").toLowerCase() === "admin";
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [success, setSuccess] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    from_user_id: "", to_user_id: "", sap_module: "",
    start_date: "", target_completion_date: "", remarks: "",
  });

  // Holds the transition_id pending delete confirmation (null = dialog closed).
  // A custom MUI dialog is used here instead of window.confirm().
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = isAdmin ? await getAllTransitions() : await getMyTransitions();
      setTransitions(res.data?.data || res.data || []);
    } catch {
      setError("Failed to load transitions.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteTransition(deleteConfirm);
      setSuccess("Transition deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
      if (expanded === deleteConfirm) setExpanded(null);
      setDeleteConfirm(null);
      load();
    } catch {
      setError("Failed to delete transition.");
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    load();
    getUsers()
      .then((res) => setUsers(res.data?.data || res.data || []))
      .catch(() => setUsers([]));
  }, [load]);

  const openCreateDialog = async () => {
    setCreateOpen(true);
    try {
      const res = await getUsers();
      const list = res.data?.data ?? res.data;
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    }
  };

  const handleCreate = async () => {
    if (!form.from_user_id || !form.to_user_id || !form.sap_module) {
      setError("Existing owner, new owner, and SAP module are required.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await createTransition(form);
      setCreateOpen(false);
      setForm({ from_user_id: "", to_user_id: "", sap_module: "", start_date: "", target_completion_date: "", remarks: "" });
      setSuccess("Transition created successfully.");
      setTimeout(() => setSuccess(""), 4000);
      await load();
      const createdTransition = response.data?.data || response.data;
      if (createdTransition?.transition_id) {
        setExpanded(createdTransition.transition_id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create transition.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

  // Sequential display numbers (1, 2, 3…) based on transition_id order —
  // never the raw transition_id itself — so numbering always starts at 1
  // and re-packs itself with no gaps whenever a transition is deleted.
  const displayNumbers = useMemo(() => {
    const chronological = [...transitions].sort((a, b) => a.transition_id - b.transition_id);
    const map = {};
    chronological.forEach((t, i) => { map[t.transition_id] = i + 1; });
    return map;
  }, [transitions]);

  const total = transitions.length;
  const completed = transitions.filter((t) => (t.overall_status || "").toLowerCase() === "completed").length;
  const inProgress = transitions.filter((t) => (t.overall_status || "").toLowerCase().replace(/\s+/g, "_") === "in_progress").length;
  const avgProgress = total > 0
    ? Math.round(transitions.reduce((sum, t) => sum + Number(t.completion_percentage || 0), 0) / total)
    : 0;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0A1929" }}>Transition Dashboard</Typography>
          <Typography variant="body2" sx={{ color: "#637381", mt: 0.3 }}>
            Track transition progress and tasks
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ backgroundColor: "#1565C0", borderRadius: "6px", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: "#0D47A1" } }}
        >
          New Transition
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2, borderRadius: "6px" }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2, borderRadius: "6px" }}>{success}</Alert>}

      {!loading && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: "Total Transitions", value: total, color: "#1565C0" },
            { label: "In Progress", value: inProgress, color: "#E65100" },
            { label: "Completed", value: completed, color: "#2E7D32" },
            { label: "Avg Completion", value: `${avgProgress}%`, color: "#6A1B9A" },
          ].map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", backgroundColor: "#FFFFFF", p: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: "#637381" }}>{s.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size={32} sx={{ color: "#1565C0" }} />
        </Box>
      ) : transitions.length === 0 ? (
        <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", backgroundColor: "#FFFFFF", py: 8, textAlign: "center" }}>
          <AssignmentOutlinedIcon sx={{ fontSize: 56, color: "#CFD8DC", mb: 2 }} />
          <Typography variant="body1" sx={{ color: "#90A4AE", fontWeight: 500 }}>No transitions found</Typography>
          <Button
            onClick={openCreateDialog}
            sx={{ mt: 2, textTransform: "none", fontWeight: 600, color: "#1565C0" }}
          >
            Create your first transition
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {transitions.map((t) => (
            <Box key={t.transition_id}>
              <TransitionCard
                transition={t}
                displayNumber={displayNumbers[t.transition_id]}
                expanded={expanded === t.transition_id}
                onExpand={handleExpand}
                onDelete={setDeleteConfirm}
              />
              {expanded === t.transition_id && (
                <Box sx={{ mt: -1, border: "1px solid #E0E0E0", borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                  <Box sx={{ backgroundColor: "#F8FAFE", px: 3, pt: 2, pb: 1, borderTop: "3px solid #E0E7EF", borderBottom: "1px solid #E0E7EF" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6A1B9A" }}>Tasks by Phase</Typography>
                  </Box>
                  <PhasedTaskList transitionId={t.transition_id} users={users} canManageTasks={isAdmin} />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* New Transition Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", fontSize: "1rem" }}>
          Start a New Transition
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Existing Owner (handing over)</InputLabel>
              <Select
                value={form.from_user_id} label="Existing Owner (handing over)"
                onChange={(e) => setForm({ ...form, from_user_id: e.target.value })}
              >
                {users.map((u) => <MenuItem key={u.user_id} value={u.user_id}>{u.name} ({u.email})</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" required>
              <InputLabel>New Owner (receiving)</InputLabel>
              <Select
                value={form.to_user_id} label="New Owner (receiving)"
                onChange={(e) => setForm({ ...form, to_user_id: e.target.value })}
              >
                {users.map((u) => <MenuItem key={u.user_id} value={u.user_id}>{u.name} ({u.email})</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" required>
              <InputLabel>SAP Module</InputLabel>
              <Select
                value={form.sap_module} label="SAP Module"
                onChange={(e) => setForm({ ...form, sap_module: e.target.value })}
              >
                {SAP_MODULES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Start Date" type="date" fullWidth size="small"
                InputLabelProps={{ shrink: true }}
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
              <TextField
                label="Target Completion" type="date" fullWidth size="small"
                InputLabelProps={{ shrink: true }}
                value={form.target_completion_date}
                onChange={(e) => setForm({ ...form, target_completion_date: e.target.value })}
              />
            </Box>
            <TextField
              label="Remarks (optional)" fullWidth size="small" multiline rows={3}
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
            <Typography variant="caption" sx={{ color: "#90A4AE" }}>
              Add tasks after creating the transition.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: "none", color: "#637381" }}>Cancel</Button>
          <Button
            onClick={handleCreate} variant="contained" disabled={submitting}
            sx={{ backgroundColor: "#1565C0", textTransform: "none", fontWeight: 600, borderRadius: "6px", "&:hover": { backgroundColor: "#0D47A1" } }}
          >
            {submitting ? "Creating…" : "Create Transition"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog — replaces window.confirm() with an in-app modal */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", fontSize: "1rem" }}>
          Delete Transition?
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: "#637381" }}>
            Are you sure you want to delete this transition? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ textTransform: "none", color: "#637381" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "6px" }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransitionDashboard;
