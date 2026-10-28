// // src/pages/Certifications.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Box, Card, Typography, Button, Chip, CircularProgress, Alert,
//   Table, TableHead, TableBody, TableRow, TableCell, Tabs, Tab,
//   Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
//   TextField, MenuItem, Select, FormControl, InputLabel, OutlinedInput,
//   Snackbar, LinearProgress, Divider,
// } from "@mui/material";
// import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
// import AddIcon from "@mui/icons-material/Add";
// import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
// import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
// import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import { useAuth } from "../context/AuthContext";

// const API = "http://localhost:3001/api";
// const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
// const DEPARTMENTS = ["Finance", "HR", "MM", "SD", "PP", "QM", "PM", "All"];

// const STATUS_CHIP = {
//   pending:      { label: "Pending",      bg: "#FFF8E1", color: "#F57F17" },
//   pending_late: { label: "Late Upload",  bg: "#FCE4EC", color: "#C62828" },
//   approved:     { label: "Approved",     bg: "#E8F5E9", color: "#2E7D32" },
//   rejected:     { label: "Rejected",     bg: "#FDEDED", color: "#C62828" },
// };

// const TH = ({ children, align = "left" }) => (
//   <TableCell align={align} sx={{ fontWeight: 700, color: "#0A1929", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5, backgroundColor: "#F5F7FA", py: 1.4 }}>
//     {children}
//   </TableCell>
// );

// const Certifications = () => {
//   const { user } = useAuth();
//   const roles    = (user?.roles || []).map((r) => (typeof r === "string" ? r : r?.role_name || ""));
//   const isAdmin  = roles.includes("Admin");

//   const [tab,          setTab]          = useState(0);
//   const [myCerts,      setMyCerts]      = useState([]);
//   const [adminCerts,   setAdminCerts]   = useState([]);
//   const [allUserSubs,  setAllUserSubs]  = useState([]);   // admin view: all submissions
//   const [loading,      setLoading]      = useState(true);
//   const [toast,        setToast]        = useState({ open: false, message: "", severity: "success" });

//   // Upload dialog
//   const [uploadDialog, setUploadDialog] = useState({ open: false, cert: null });
//   const [uploadFile,   setUploadFile]   = useState(null);
//   const [uploading,    setUploading]    = useState(false);

//   // Admin: Create cert dialog
//   const [createDialog, setCreateDialog] = useState(false);
//   const [createForm,   setCreateForm]   = useState({ name: "", content: "", link: "", departments: [], due_date: "" });
//   const [creating,     setCreating]     = useState(false);

//   // Admin: View department submissions dialog
//   const [viewSubsDialog, setViewSubsDialog] = useState({ open: false, certId: null, certName: "" });
//   const [deptSubs, setDeptSubs] = useState([]);
//   const [deptSubsCert, setDeptSubsCert] = useState(null);
//   const [deptSubsLoading, setDeptSubsLoading] = useState(false);

//   const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

//   const load = async () => {
//     setLoading(true);
//     try {
//       // Fetch admin-created certs relevant to the user's department
//       const certsRes = await axios.get(`${API}/admin-certifications`, authH());
//       const certs = certsRes.data?.data || certsRes.data || [];
//       setAdminCerts(certs);

//       // Fetch my submissions
//       const myRes = await axios.get(`${API}/admin-certifications/my-submissions`, authH());
//       setMyCerts(myRes.data?.data || myRes.data || []);

//       if (isAdmin) {
//         // Fetch all user submissions for admin panel
//         const allRes = await axios.get(`${API}/admin-certifications/all-submissions`, authH());
//         setAllUserSubs(allRes.data?.data || allRes.data || []);
//       }
//     } catch (e) {
//       showToast("Failed to load certifications.", "error");
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   const handleUpload = async () => {
//     if (!uploadFile) { showToast("Please select a file.", "warning"); return; }
//     const formData = new FormData();
//     formData.append("file", uploadFile);
//     formData.append("cert_id", uploadDialog.cert.cert_id);
//     setUploading(true);
//     try {
//       const submitRes = await axios.post(`${API}/admin-certifications/submit`, formData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       if (submitRes.data?.isPastDue) {
//         showToast("Submitted after due date — awaiting admin approval.", "warning");
//       } else {
//         showToast("Certificate submitted successfully!");
//       }
//       setUploadDialog({ open: false, cert: null });
//       setUploadFile(null);
//       load();
//     } catch (e) {
//       showToast(e.response?.data?.message || "Upload failed.", "error");
//     } finally { setUploading(false); }
//   };

//   // ── Admin: create cert ───────────────────────────────────────────
//   const handleCreate = async () => {
//     if (!createForm.name.trim()) { showToast("Certification name is required.", "warning"); return; }
//     setCreating(true);
//     try {
//       await axios.post(`${API}/admin-certifications`, createForm, authH());
//       showToast("Certification created!");
//       setCreateDialog(false);
//       setCreateForm({ name: "", content: "", link: "", departments: [], due_date: "" });
//       load();
//     } catch (e) {
//       showToast(e.response?.data?.message || "Failed to create certification.", "error");
//     } finally { setCreating(false); }
//   };

//   // ── Admin: view department submissions ─────────────────────────
//   const openViewSubs = async (certId, certName) => {
//     setViewSubsDialog({ open: true, certId, certName });
//     setDeptSubsLoading(true);
//     try {
//       const res = await axios.get(`${API}/admin-certifications/${certId}/department-submissions`, authH());
//       setDeptSubs(res.data?.data || []);
//       setDeptSubsCert(res.data?.cert || null);
//     } catch (e) {
//       showToast("Failed to load submissions.", "error");
//     } finally { setDeptSubsLoading(false); }
//   };

//   // ── Admin: approve / reject submission ───────────────────────────
//   const handleApproveReject = async (subId, action) => {
//     try {
//       await axios.put(`${API}/admin-certifications/submission/${subId}/${action}`, {}, authH());
//       showToast(`Submission ${action === "approve" ? "approved" : "rejected"}.`);
//       load();
//     } catch (e) {
//       showToast("Action failed.", "error");
//     }
//   };

//   // ── Helpers ──────────────────────────────────────────────────────
//   const getMyCertStatus = (certId) => {
//     const sub = myCerts.find((m) => m.cert_id === certId);
//     return sub ? sub.status : null;
//   };

//   const userDept = user?.department;
//   // Certs relevant to user's dept
//   const relevantCerts = adminCerts.filter(
//     (c) => !c.departments || c.departments.length === 0 ||
//       c.departments.includes(userDept) || c.departments.includes("All")
//   );
//   const pendingCerts = relevantCerts.filter((c) => getMyCertStatus(c.cert_id) !== "approved");

//   if (loading)
//     return <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}><CircularProgress size={36} sx={{ color: "#42A5F5" }} /></Box>;

//   return (
//     <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
//       <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//           <WorkspacePremiumOutlinedIcon sx={{ fontSize: 28, color: "#42A5F5" }} />
//           <Box>
//             <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1.2 }}>Certifications</Typography>
//             <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.3 }}>Required and completed certifications</Typography>
//           </Box>
//         </Box>
//         {isAdmin && (
//           <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialog(true)}
//             sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0", borderRadius: "8px" }}>
//             Add Certification
//           </Button>
//         )}
//       </Box>

//       <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
//         <Tab label="My Certifications" />
//         {isAdmin && <Tab label="Manage All Submissions" />}
//         {isAdmin && <Tab label="Certification Catalog" />}
//       </Tabs>

//       {/* ── Tab 0: My Certifications ─────────────────────────────── */}
//       {tab === 0 && (
//         <>
//           {pendingCerts.length > 0 && (
//             <Alert severity="info" sx={{ mb: 2, borderRadius: "8px" }}>
//               You have <strong>{pendingCerts.length}</strong> pending certification(s) to complete.
//             </Alert>
//           )}

//           {relevantCerts.length === 0 ? (
//             <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 6, textAlign: "center" }}>
//               <WorkspacePremiumOutlinedIcon sx={{ fontSize: 48, color: "#CFD8DC", mb: 2 }} />
//               <Typography variant="body1" sx={{ color: "#607D8B", fontWeight: 500 }}>No certifications assigned to your department yet</Typography>
//             </Card>
//           ) : (
//             <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//               {relevantCerts.map((cert) => {
//                 const status = getMyCertStatus(cert.cert_id);
//                 const cfg    = STATUS_CHIP[status] || null;
//                 return (
//                   <Card key={cert.cert_id} elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 3 }}>
//                     <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
//                           <WorkspacePremiumOutlinedIcon sx={{ fontSize: 20, color: "#42A5F5" }} />
//                           <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0A1929" }}>{cert.name}</Typography>
//                           {cfg && <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.7rem", height: 20, borderRadius: "4px" }} />}
//                         </Box>
//                         {cert.content && <Typography variant="body2" sx={{ color: "#607D8B", mb: 1 }}>{cert.content}</Typography>}
//                         {cert.link && (
//                           <Button size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 14 }} />}
//                             href={cert.link} target="_blank" rel="noopener noreferrer"
//                             sx={{ textTransform: "none", fontSize: "0.8rem", color: "#1565C0", p: 0 }}>
//                             View Course
//                           </Button>
//                         )}
//                         <Box sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}>
//                           {(cert.departments || []).map((d) => (
//                             <Chip key={d} label={d} size="small" sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#E8F5E9", color: "#2E7D32" }} />
//                           ))}
//                         </Box>
//                         {cert.due_date && (
//                           <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
//                             <ScheduleOutlinedIcon sx={{ fontSize: 14, color: new Date() > new Date(cert.due_date) ? "#C62828" : "#F57F17" }} />
//                             <Typography variant="caption" sx={{ color: new Date() > new Date(cert.due_date) ? "#C62828" : "#F57F17", fontWeight: 600 }}>
//                               Due: {new Date(cert.due_date).toLocaleDateString("en-IN")} {new Date() > new Date(cert.due_date) ? "(Overdue)" : ""}
//                             </Typography>
//                           </Box>
//                         )}
//                       </Box>
//                       <Box>
//                         {!status ? (
//                           <Button variant="outlined" startIcon={<UploadFileOutlinedIcon />}
//                             onClick={() => setUploadDialog({ open: true, cert })}
//                             sx={{ textTransform: "none", fontWeight: 600, borderColor: "#1565C0", color: "#1565C0", "&:hover": { backgroundColor: "#E3F2FD" } }}>
//                             Add Certificate
//                           </Button>
//                         ) : status === "pending" ? (
//                           <Button variant="outlined" startIcon={<UploadFileOutlinedIcon />}
//                             onClick={() => setUploadDialog({ open: true, cert })}
//                             sx={{ textTransform: "none", fontWeight: 600, borderColor: "#F57F17", color: "#F57F17", "&:hover": { backgroundColor: "#FFF8E1" } }}>
//                             Re-submit
//                           </Button>
//                         ) : status === "approved" ? (
//                           <Chip label="✓ Completed" sx={{ backgroundColor: "#E8F5E9", color: "#2E7D32", fontWeight: 700 }} />
//                         ) : null}
//                       </Box>
//                     </Box>
//                   </Card>
//                 );
//               })}
//             </Box>
//           )}
//         </>
//       )}

//       {/* ── Tab 1 (Admin): All Submissions ───────────────────────── */}
//       {isAdmin && tab === 1 && (
//         <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "8px" }}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TH>User</TH>
//                 <TH>Certification</TH>
//                 <TH>File</TH>
//                 <TH align="center">Status</TH>
//                 <TH align="center">Actions</TH>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {allUserSubs.map((sub) => {
//                 const cfg = STATUS_CHIP[sub.status] || STATUS_CHIP.pending;
//                 return (
//                   <TableRow key={sub.id} sx={{ "&:last-child td": { border: 0 } }}>
//                     <TableCell>
//                       <Typography sx={{ fontWeight: 600, fontSize: "0.88rem" }}>{sub.user_name}</Typography>
//                       <Typography sx={{ fontSize: "0.75rem", color: "#607D8B" }}>{sub.user_email}</Typography>
//                     </TableCell>
//                     <TableCell>
//                       <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#0A1929" }}>{sub.cert_name}</Typography>
//                     </TableCell>
//                     <TableCell>
//                       {sub.file_path ? (
//                         <Button size="small" href={`http://localhost:3001${sub.file_path}`} target="_blank"
//                           sx={{ textTransform: "none", fontSize: "0.78rem", color: "#1565C0" }}>
//                           View File
//                         </Button>
//                       ) : "—"}
//                     </TableCell>
//                     <TableCell align="center">
//                       <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.7rem", height: 20, borderRadius: "4px" }} />
//                     </TableCell>
//                     <TableCell align="center">
//                       {sub.status === "pending" && (
//                         <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
//                           <Button size="small" variant="contained" color="success"
//                             onClick={() => handleApproveReject(sub.id, "approve")}
//                             sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}>Approve</Button>
//                           <Button size="small" variant="contained" color="error"
//                             onClick={() => handleApproveReject(sub.id, "reject")}
//                             sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}>Reject</Button>
//                         </Box>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//               {allUserSubs.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
//                     <Typography sx={{ color: "#607D8B" }}>No submissions yet</Typography>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </Card>
//       )}

//       {/* ── Tab 2 (Admin): Certification Catalog ─────────────────── */}
//       {isAdmin && tab === 2 && (
//         <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "8px" }}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TH>Name</TH>
//                 <TH>Departments</TH>
//                 <TH>Due Date</TH>
//                 <TH>Link</TH>
//                 <TH>Created</TH>
//                 <TH align="center">Actions</TH>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {adminCerts.map((cert) => {
//                 const isOverdue = cert.due_date && new Date() > new Date(cert.due_date);
//                 return (
//                 <TableRow key={cert.cert_id} sx={{ "&:last-child td": { border: 0 } }}>
//                   <TableCell>
//                     <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#0A1929" }}>{cert.name}</Typography>
//                     <Typography sx={{ fontSize: "0.78rem", color: "#607D8B" }}>{cert.content}</Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
//                       {(cert.departments || []).map((d) => (
//                         <Chip key={d} label={d} size="small" sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#E8F5E9", color: "#2E7D32" }} />
//                       ))}
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     {cert.due_date ? (
//                       <Chip
//                         label={new Date(cert.due_date).toLocaleDateString("en-IN")}
//                         size="small"
//                         sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, backgroundColor: isOverdue ? "#FDEDED" : "#FFF8E1", color: isOverdue ? "#C62828" : "#F57F17" }}
//                       />
//                     ) : "—"}
//                   </TableCell>
//                   <TableCell>
//                     {cert.link ? (
//                       <Button size="small" href={cert.link} target="_blank"
//                         sx={{ textTransform: "none", fontSize: "0.78rem", color: "#1565C0" }}>Open Link</Button>
//                     ) : "—"}
//                   </TableCell>
//                   <TableCell>
//                     <Typography sx={{ fontSize: "0.82rem", color: "#607D8B" }}>
//                       {cert.created_at ? new Date(cert.created_at).toLocaleDateString("en-IN") : "—"}
//                     </Typography>
//                   </TableCell>
//                   <TableCell align="center">
//                     <Button size="small" variant="outlined" startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
//                       onClick={() => openViewSubs(cert.cert_id, cert.name)}
//                       sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, borderColor: "#1565C0", color: "#1565C0" }}>
//                       View Submissions
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//                 );
//               })}
//               {adminCerts.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
//                     <Typography sx={{ color: "#607D8B" }}>No certifications created yet</Typography>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </Card>
//       )}

//       {/* ── Upload Dialog ─────────────────────────────────────────── */}
//       <Dialog open={uploadDialog.open} onClose={() => !uploading && setUploadDialog({ open: false, cert: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
//         <DialogTitle sx={{ fontWeight: 700, color: "#0A1929" }}>Submit Certificate</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ mb: 2, color: "#607D8B", fontSize: "0.87rem" }}>
//             Upload your completion certificate for <strong>{uploadDialog.cert?.name}</strong>.
//             Accepted formats: Image (PNG/JPG), PDF, DOC/DOCX.
//           </DialogContentText>
//           <Button component="label" variant="outlined" startIcon={<UploadFileOutlinedIcon />}
//             sx={{ textTransform: "none", fontWeight: 600, borderColor: "#1565C0", color: "#1565C0" }}>
//             {uploadFile ? `Selected: ${uploadFile.name}` : "Choose File"}
//             <input type="file" hidden accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
//               onChange={(e) => setUploadFile(e.target.files[0])} />
//           </Button>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
//           <Button onClick={() => { setUploadDialog({ open: false, cert: null }); setUploadFile(null); }}
//             variant="outlined" size="small" disabled={uploading}
//             sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>
//             Cancel
//           </Button>
//           <Button onClick={handleUpload} variant="contained" size="small" disabled={!uploadFile || uploading}
//             sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0" }}>
//             {uploading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Submit"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* ── Admin Create Dialog ───────────────────────────────────── */}
//       {isAdmin && (
//         <Dialog open={createDialog} onClose={() => !creating && setCreateDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
//           <DialogTitle sx={{ fontWeight: 700, color: "#0A1929" }}>Create Certification</DialogTitle>
//           <DialogContent>
//             <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
//               <TextField label="Certification Name *" fullWidth size="small"
//                 value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
//               <TextField label="Description / Content" fullWidth size="small" multiline rows={3}
//                 value={createForm.content} onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })} />
//               <TextField label="Course Link (URL)" fullWidth size="small"
//                 value={createForm.link} onChange={(e) => setCreateForm({ ...createForm, link: e.target.value })}
//                 placeholder="https://learning.example.com/course" />
//               <FormControl fullWidth size="small">
//                 <InputLabel>Target Departments</InputLabel>
//                 <Select
//                   multiple
//                   value={createForm.departments}
//                   onChange={(e) => setCreateForm({ ...createForm, departments: e.target.value })}
//                   input={<OutlinedInput label="Target Departments" />}
//                   renderValue={(sel) => (
//                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                       {sel.map((v) => <Chip key={v} label={v} size="small" sx={{ height: 20, fontSize: "0.72rem" }} />)}
//                     </Box>
//                   )}
//                 >
//                   {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
//                 </Select>
//               </FormControl>
//               <TextField label="Due Date" type="date" fullWidth size="small"
//                 value={createForm.due_date} onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
//                 InputLabelProps={{ shrink: true }} />
//             </Box>
//           </DialogContent>
//           <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
//             <Button onClick={() => setCreateDialog(false)} variant="outlined" size="small" disabled={creating}
//               sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>
//               Cancel
//             </Button>
//             <Button onClick={handleCreate} variant="contained" size="small" disabled={creating}
//               sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0" }}>
//               {creating ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Create"}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}

//       {/* Toast */}
//       <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
//         <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ width: "100%" }}>
//           {toast.message}
//         </Alert>
//       </Snackbar>

//       {/* View Submissions Dialog (Admin) */}
//       <Dialog open={viewSubsDialog.open} onClose={() => setViewSubsDialog({ open: false, certId: null, certName: "" })} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
//         <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", borderBottom: "1px solid #E0E7EF" }}>
//           Submissions — {viewSubsDialog.certName}
//           {deptSubsCert?.due_date && (
//             <Typography variant="body2" sx={{ color: new Date() > new Date(deptSubsCert.due_date) ? "#C62828" : "#F57F17", fontWeight: 600, mt: 0.5 }}>
//               Due: {new Date(deptSubsCert.due_date).toLocaleDateString("en-IN")} {new Date() > new Date(deptSubsCert.due_date) ? "(Overdue)" : ""}
//             </Typography>
//           )}
//         </DialogTitle>
//         <DialogContent sx={{ mt: 2 }}>
//           {deptSubsLoading ? (
//             <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} /></Box>
//           ) : (
//             <Table size="small">
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: "#F5F7FA" }}>
//                   <TH>User</TH>
//                   <TH>Department</TH>
//                   <TH>Phone</TH>
//                   <TH align="center">Status</TH>
//                   <TH align="center">File</TH>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {deptSubs.map((u) => {
//                   const sub = u.submission;
//                   const cfg = sub ? (STATUS_CHIP[sub.status] || STATUS_CHIP.pending) : null;
//                   return (
//                     <TableRow key={u.user_id} sx={{ "&:last-child td": { border: 0 } }}>
//                       <TableCell>
//                         <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{u.name}</Typography>
//                         <Typography sx={{ fontSize: "0.72rem", color: "#607D8B" }}>{u.email}</Typography>
//                       </TableCell>
//                       <TableCell><Typography sx={{ fontSize: "0.82rem" }}>{u.department || "—"}</Typography></TableCell>
//                       <TableCell><Typography sx={{ fontSize: "0.82rem" }}>{u.phone || "—"}</Typography></TableCell>
//                       <TableCell align="center">
//                         {sub ? (
//                           <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.68rem", height: 20 }} />
//                         ) : (
//                           <Chip label="Not Submitted" size="small" sx={{ backgroundColor: "#F5F5F5", color: "#90A4AE", fontWeight: 600, fontSize: "0.68rem", height: 20 }} />
//                         )}
//                       </TableCell>
//                       <TableCell align="center">
//                         {sub?.file_path ? (
//                           <Button size="small" href={`http://localhost:3001${sub.file_path}`} target="_blank"
//                             sx={{ textTransform: "none", fontSize: "0.75rem", color: "#1565C0" }}>View File</Button>
//                         ) : "—"}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//                 {deptSubs.length === 0 && (
//                   <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography sx={{ color: "#607D8B" }}>No users found for this department</Typography></TableCell></TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={() => setViewSubsDialog({ open: false, certId: null, certName: "" })} sx={{ textTransform: "none", fontWeight: 600, color: "#607D8B" }}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default Certifications;



// src/pages/Certifications.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Card, Typography, Button, Chip, CircularProgress, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, OutlinedInput,
  Snackbar,
} from "@mui/material";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AddIcon from "@mui/icons-material/Add";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:3001/api";
const FILE_BASE = API.replace(/\/api$/, ""); // single source of truth for uploaded-file URLs
const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
const DEPARTMENTS = ["Finance", "HR", "MM", "SD", "PP", "QM", "PM", "All"];

// Course links are entered freely by admins; guard against a missing
// protocol (e.g. "www.udemy.com/...") which browsers won't navigate to.
const normalizeUrl = (url) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const STATUS_CHIP = {
  pending:      { label: "Pending",      bg: "#FFF8E1", color: "#F57F17" },
  pending_late: { label: "Late Upload",  bg: "#FCE4EC", color: "#C62828" },
  approved:     { label: "Approved",     bg: "#E8F5E9", color: "#2E7D32" },
  rejected:     { label: "Rejected",     bg: "#FDEDED", color: "#C62828" },
};

const TH = ({ children, align = "left" }) => (
  <TableCell align={align} sx={{ fontWeight: 700, color: "#0A1929", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5, backgroundColor: "#F5F7FA", py: 1.4 }}>
    {children}
  </TableCell>
);

const Certifications = () => {
  const { user } = useAuth();
  const roles    = (user?.roles || []).map((r) => (typeof r === "string" ? r : r?.role_name || ""));
  const isAdmin  = roles.includes("Admin");

  const [tab,          setTab]          = useState(0);
  const [myCerts,      setMyCerts]      = useState([]);
  const [adminCerts,   setAdminCerts]   = useState([]);
  const [allUserSubs,  setAllUserSubs]  = useState([]);   // admin view: all submissions
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState({ open: false, message: "", severity: "success" });

  // Upload dialog
  const [uploadDialog, setUploadDialog] = useState({ open: false, cert: null });
  const [uploadFile,   setUploadFile]   = useState(null);
  const [uploading,    setUploading]    = useState(false);

  // Admin: Create cert dialog
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm,   setCreateForm]   = useState({ name: "", content: "", link: "", departments: [], due_date: "" });
  const [creating,     setCreating]     = useState(false);

  // Admin: View department submissions dialog
  const [viewSubsDialog, setViewSubsDialog] = useState({ open: false, certId: null, certName: "" });
  const [deptSubs, setDeptSubs] = useState([]);
  const [deptSubsCert, setDeptSubsCert] = useState(null);
  const [deptSubsLoading, setDeptSubsLoading] = useState(false);

  // Admin: delete submission confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null); // holds submission id pending confirmation
  const [deletingSub, setDeletingSub] = useState(false);

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  const load = async () => {
    setLoading(true);
    try {
      // Fetch admin-created certs relevant to the user's department
      const certsRes = await axios.get(`${API}/admin-certifications`, authH());
      const certs = certsRes.data?.data || certsRes.data || [];
      setAdminCerts(certs);

      // Fetch my submissions
      const myRes = await axios.get(`${API}/admin-certifications/my-submissions`, authH());
      setMyCerts(myRes.data?.data || myRes.data || []);

      if (isAdmin) {
        // Fetch all user submissions for admin panel
        const allRes = await axios.get(`${API}/admin-certifications/all-submissions`, authH());
        setAllUserSubs(allRes.data?.data || allRes.data || []);
      }
    } catch (e) {
      showToast("Failed to load certifications.", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async () => {
    if (!uploadFile) { showToast("Please select a file.", "warning"); return; }
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("cert_id", uploadDialog.cert.cert_id);
    setUploading(true);
    try {
      const submitRes = await axios.post(`${API}/admin-certifications/submit`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (submitRes.data?.isPastDue) {
        showToast("Submitted after due date — awaiting admin approval.", "warning");
      } else {
        showToast("Certificate submitted successfully!");
      }
      setUploadDialog({ open: false, cert: null });
      setUploadFile(null);
      load();
    } catch (e) {
      showToast(e.response?.data?.message || "Upload failed.", "error");
    } finally { setUploading(false); }
  };

  // ── Admin: create cert ───────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.name.trim()) { showToast("Certification name is required.", "warning"); return; }
    setCreating(true);
    try {
      await axios.post(`${API}/admin-certifications`, createForm, authH());
      showToast("Certification created!");
      setCreateDialog(false);
      setCreateForm({ name: "", content: "", link: "", departments: [], due_date: "" });
      load();
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to create certification.", "error");
    } finally { setCreating(false); }
  };

  // ── Admin: view department submissions ─────────────────────────
  const openViewSubs = async (certId, certName) => {
    setViewSubsDialog({ open: true, certId, certName });
    setDeptSubsLoading(true);
    try {
      const res = await axios.get(`${API}/admin-certifications/${certId}/department-submissions`, authH());
      setDeptSubs(res.data?.data || []);
      setDeptSubsCert(res.data?.cert || null);
    } catch (e) {
      showToast("Failed to load submissions.", "error");
    } finally { setDeptSubsLoading(false); }
  };

  // ── Admin: approve / reject submission ───────────────────────────
  const handleApproveReject = async (subId, action) => {
    try {
      await axios.put(`${API}/admin-certifications/submission/${subId}/${action}`, {}, authH());
      showToast(`Submission ${action === "approve" ? "approved" : "rejected"}.`);
      load();
    } catch (e) {
      showToast("Action failed.", "error");
    }
  };

  // ── Admin: delete submission ─────────────────────────────────────
  const handleDeleteSubmission = async () => {
    if (!deleteConfirm) return;
    setDeletingSub(true);
    try {
      await axios.delete(`${API}/admin-certifications/submission/${deleteConfirm}`, authH());
      showToast("Submission deleted.");
      setDeleteConfirm(null);
      load();
    } catch (e) {
      showToast("Failed to delete submission.", "error");
      setDeleteConfirm(null);
    } finally {
      setDeletingSub(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const getMyCertStatus = (certId) => {
    const sub = myCerts.find((m) => m.cert_id === certId);
    return sub ? sub.status : null;
  };

  const userDept = user?.department;
  // Certs relevant to user's dept
  const relevantCerts = adminCerts.filter(
    (c) => !c.departments || c.departments.length === 0 ||
      c.departments.includes(userDept) || c.departments.includes("All")
  );
  const pendingCerts = relevantCerts.filter((c) => getMyCertStatus(c.cert_id) !== "approved");

  if (loading)
    return <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}><CircularProgress size={36} sx={{ color: "#42A5F5" }} /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <WorkspacePremiumOutlinedIcon sx={{ fontSize: 28, color: "#42A5F5" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1.2 }}>Certifications</Typography>
            <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.3 }}>Required and completed certifications</Typography>
          </Box>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialog(true)}
            sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0", borderRadius: "8px" }}>
            Add Certification
          </Button>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="My Certifications" />
        {isAdmin && <Tab label="Manage All Submissions" />}
        {isAdmin && <Tab label="Certification Catalog" />}
      </Tabs>

      {/* ── Tab 0: My Certifications ─────────────────────────────── */}
      {tab === 0 && (
        <>
          {pendingCerts.length > 0 && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: "8px" }}>
              You have <strong>{pendingCerts.length}</strong> pending certification(s) to complete.
            </Alert>
          )}

          {relevantCerts.length === 0 ? (
            <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 6, textAlign: "center" }}>
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 48, color: "#CFD8DC", mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#607D8B", fontWeight: 500 }}>No certifications assigned to your department yet</Typography>
            </Card>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {relevantCerts.map((cert) => {
                const status = getMyCertStatus(cert.cert_id);
                const cfg    = STATUS_CHIP[status] || null;
                return (
                  <Card key={cert.cert_id} elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <WorkspacePremiumOutlinedIcon sx={{ fontSize: 20, color: "#42A5F5" }} />
                          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0A1929" }}>{cert.name}</Typography>
                          {cfg && <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.7rem", height: 20, borderRadius: "4px" }} />}
                        </Box>
                        {cert.content && <Typography variant="body2" sx={{ color: "#607D8B", mb: 1 }}>{cert.content}</Typography>}
                        {cert.link && (
                          <Button size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 14 }} />}
                            href={normalizeUrl(cert.link)} target="_blank" rel="noopener noreferrer"
                            sx={{ textTransform: "none", fontSize: "0.8rem", color: "#1565C0", p: 0 }}>
                            View Course
                          </Button>
                        )}
                        <Box sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}>
                          {(cert.departments || []).map((d) => (
                            <Chip key={d} label={d} size="small" sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#E8F5E9", color: "#2E7D32" }} />
                          ))}
                        </Box>
                        {cert.due_date && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                            <ScheduleOutlinedIcon sx={{ fontSize: 14, color: new Date() > new Date(cert.due_date) ? "#C62828" : "#F57F17" }} />
                            <Typography variant="caption" sx={{ color: new Date() > new Date(cert.due_date) ? "#C62828" : "#F57F17", fontWeight: 600 }}>
                              Due: {new Date(cert.due_date).toLocaleDateString("en-IN")} {new Date() > new Date(cert.due_date) ? "(Overdue)" : ""}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Box>
                        {!status ? (
                          <Button variant="outlined" startIcon={<UploadFileOutlinedIcon />}
                            onClick={() => setUploadDialog({ open: true, cert })}
                            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#1565C0", color: "#1565C0", "&:hover": { backgroundColor: "#E3F2FD" } }}>
                            Add Certificate
                          </Button>
                        ) : status === "pending" ? (
                          <Button variant="outlined" startIcon={<UploadFileOutlinedIcon />}
                            onClick={() => setUploadDialog({ open: true, cert })}
                            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#F57F17", color: "#F57F17", "&:hover": { backgroundColor: "#FFF8E1" } }}>
                            Re-submit
                          </Button>
                        ) : status === "approved" ? (
                          <Chip label="✓ Completed" sx={{ backgroundColor: "#E8F5E9", color: "#2E7D32", fontWeight: 700 }} />
                        ) : null}
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          )}
        </>
      )}

      {/* ── Tab 1 (Admin): All Submissions ───────────────────────── */}
      {isAdmin && tab === 1 && (
        <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "8px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TH>User</TH>
                <TH>Certification</TH>
                <TH>File</TH>
                <TH align="center">Status</TH>
                <TH align="center">Actions</TH>
              </TableRow>
            </TableHead>
            <TableBody>
              {allUserSubs.map((sub) => {
                const cfg = STATUS_CHIP[sub.status] || STATUS_CHIP.pending;
                return (
                  <TableRow key={sub.id} sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.88rem" }}>{sub.user_name}</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#607D8B" }}>{sub.user_email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#0A1929" }}>{sub.cert_name}</Typography>
                    </TableCell>
                    <TableCell>
                      {sub.file_path ? (
                        <Button size="small" href={`${FILE_BASE}${sub.file_path}`} target="_blank"
                          sx={{ textTransform: "none", fontSize: "0.78rem", color: "#1565C0" }}>
                          View File
                        </Button>
                      ) : "—"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.7rem", height: 20, borderRadius: "4px" }} />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                        {(sub.status === "pending" || sub.status === "pending_late") && (
                          <>
                            <Button size="small" variant="contained" color="success"
                              onClick={() => handleApproveReject(sub.id, "approve")}
                              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}>Approve</Button>
                            <Button size="small" variant="contained" color="error"
                              onClick={() => handleApproveReject(sub.id, "reject")}
                              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}>Reject</Button>
                          </>
                        )}
                        <Button size="small" variant="outlined" color="error"
                          onClick={() => setDeleteConfirm(sub.id)}
                          sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}>Delete</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {allUserSubs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: "#607D8B" }}>No submissions yet</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ── Tab 2 (Admin): Certification Catalog ─────────────────── */}
      {isAdmin && tab === 2 && (
        <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "8px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TH>Name</TH>
                <TH>Departments</TH>
                <TH>Due Date</TH>
                <TH>Link</TH>
                <TH>Created</TH>
                <TH align="center">Actions</TH>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminCerts.map((cert) => {
                const isOverdue = cert.due_date && new Date() > new Date(cert.due_date);
                return (
                <TableRow key={cert.cert_id} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#0A1929" }}>{cert.name}</Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "#607D8B" }}>{cert.content}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {(cert.departments || []).map((d) => (
                        <Chip key={d} label={d} size="small" sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#E8F5E9", color: "#2E7D32" }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {cert.due_date ? (
                      <Chip
                        label={new Date(cert.due_date).toLocaleDateString("en-IN")}
                        size="small"
                        sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, backgroundColor: isOverdue ? "#FDEDED" : "#FFF8E1", color: isOverdue ? "#C62828" : "#F57F17" }}
                      />
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {cert.link ? (
                      <Button size="small" href={normalizeUrl(cert.link)} target="_blank" rel="noopener noreferrer"
                        sx={{ textTransform: "none", fontSize: "0.78rem", color: "#1565C0" }}>Open Link</Button>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.82rem", color: "#607D8B" }}>
                      {cert.created_at ? new Date(cert.created_at).toLocaleDateString("en-IN") : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined" startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                      onClick={() => openViewSubs(cert.cert_id, cert.name)}
                      sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, borderColor: "#1565C0", color: "#1565C0" }}>
                      View Submissions
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
              {adminCerts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: "#607D8B" }}>No certifications created yet</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ── Upload Dialog ─────────────────────────────────────────── */}
      <Dialog open={uploadDialog.open} onClose={() => !uploading && setUploadDialog({ open: false, cert: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929" }}>Submit Certificate</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: "#607D8B", fontSize: "0.87rem" }}>
            Upload your completion certificate for <strong>{uploadDialog.cert?.name}</strong>.
            Accepted formats: Image (PNG/JPG), PDF, DOC/DOCX.
          </DialogContentText>
          <Button component="label" variant="outlined" startIcon={<UploadFileOutlinedIcon />}
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#1565C0", color: "#1565C0" }}>
            {uploadFile ? `Selected: ${uploadFile.name}` : "Choose File"}
            <input type="file" hidden accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
              onChange={(e) => setUploadFile(e.target.files[0])} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => { setUploadDialog({ open: false, cert: null }); setUploadFile(null); }}
            variant="outlined" size="small" disabled={uploading}
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained" size="small" disabled={!uploadFile || uploading}
            sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0" }}>
            {uploading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Admin Create Dialog ───────────────────────────────────── */}
      {isAdmin && (
        <Dialog open={createDialog} onClose={() => !creating && setCreateDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
          <DialogTitle sx={{ fontWeight: 700, color: "#0A1929" }}>Create Certification</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField label="Certification Name *" fullWidth size="small"
                value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              <TextField label="Description / Content" fullWidth size="small" multiline rows={3}
                value={createForm.content} onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })} />
              <TextField label="Course Link (URL)" fullWidth size="small"
                value={createForm.link} onChange={(e) => setCreateForm({ ...createForm, link: e.target.value })}
                placeholder="https://learning.example.com/course" />
              <FormControl fullWidth size="small">
                <InputLabel>Target Departments</InputLabel>
                <Select
                  multiple
                  value={createForm.departments}
                  onChange={(e) => setCreateForm({ ...createForm, departments: e.target.value })}
                  input={<OutlinedInput label="Target Departments" />}
                  renderValue={(sel) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {sel.map((v) => <Chip key={v} label={v} size="small" sx={{ height: 20, fontSize: "0.72rem" }} />)}
                    </Box>
                  )}
                >
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Due Date" type="date" fullWidth size="small"
                value={createForm.due_date} onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button onClick={() => setCreateDialog(false)} variant="outlined" size="small" disabled={creating}
              sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} variant="contained" size="small" disabled={creating}
              sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#1565C0" }}>
              {creating ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>

      {/* View Submissions Dialog (Admin) */}
      <Dialog open={viewSubsDialog.open} onClose={() => setViewSubsDialog({ open: false, certId: null, certName: "" })} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929", borderBottom: "1px solid #E0E7EF" }}>
          Submissions — {viewSubsDialog.certName}
          {deptSubsCert?.due_date && (
            <Typography variant="body2" sx={{ color: new Date() > new Date(deptSubsCert.due_date) ? "#C62828" : "#F57F17", fontWeight: 600, mt: 0.5 }}>
              Due: {new Date(deptSubsCert.due_date).toLocaleDateString("en-IN")} {new Date() > new Date(deptSubsCert.due_date) ? "(Overdue)" : ""}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {deptSubsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F5F7FA" }}>
                  <TH>User</TH>
                  <TH>Department</TH>
                  <TH>Phone</TH>
                  <TH align="center">Status</TH>
                  <TH align="center">File</TH>
                </TableRow>
              </TableHead>
              <TableBody>
                {deptSubs.map((u) => {
                  const sub = u.submission;
                  const cfg = sub ? (STATUS_CHIP[sub.status] || STATUS_CHIP.pending) : null;
                  return (
                    <TableRow key={u.user_id} sx={{ "&:last-child td": { border: 0 } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{u.name}</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#607D8B" }}>{u.email}</Typography>
                      </TableCell>
                      <TableCell><Typography sx={{ fontSize: "0.82rem" }}>{u.department || "—"}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: "0.82rem" }}>{u.phone || "—"}</Typography></TableCell>
                      <TableCell align="center">
                        {sub ? (
                          <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.68rem", height: 20 }} />
                        ) : (
                          <Chip label="Not Submitted" size="small" sx={{ backgroundColor: "#F5F5F5", color: "#90A4AE", fontWeight: 600, fontSize: "0.68rem", height: 20 }} />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {sub?.file_path ? (
                          <Button size="small" href={`${FILE_BASE}${sub.file_path}`} target="_blank"
                            sx={{ textTransform: "none", fontSize: "0.75rem", color: "#1565C0" }}>View File</Button>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {deptSubs.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography sx={{ color: "#607D8B" }}>No users found for this department</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewSubsDialog({ open: false, certId: null, certName: "" })} sx={{ textTransform: "none", fontWeight: 600, color: "#607D8B" }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Submission Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0A1929" }}>Delete Submission?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#607D8B", fontSize: "0.87rem" }}>
            This will permanently remove the submission and its uploaded file. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm(null)} variant="outlined" size="small" disabled={deletingSub}
            sx={{ textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#455A64" }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteSubmission} variant="contained" color="error" size="small" disabled={deletingSub}
            sx={{ textTransform: "none", fontWeight: 600 }}>
            {deletingSub ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Certifications;
