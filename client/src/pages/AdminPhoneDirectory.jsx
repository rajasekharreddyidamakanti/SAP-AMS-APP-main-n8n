// // src/pages/AdminPhoneDirectory.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Box, Card, Typography, CircularProgress, Alert,
//   Table, TableHead, TableBody, TableRow, TableCell,
//   TextField, Chip, InputAdornment,
// } from "@mui/material";
// import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
// import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

// const API = "http://localhost:3001/api";
// const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

// const TH = ({ children, align = "left" }) => (
//   <TableCell align={align} sx={{ fontWeight: 700, color: "#0A1929", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5, backgroundColor: "#F5F7FA", py: 1.4 }}>
//     {children}
//   </TableCell>
// );

// const AdminPhoneDirectory = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await axios.get(`${API}/admin/phone-directory`, authH());
//         setUsers(res.data?.data || []);
//       } catch (e) {
//         setError("Failed to load user directory.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   const filtered = users.filter((u) => {
//     const q = search.toLowerCase();
//     return (
//       u.name?.toLowerCase().includes(q) ||
//       u.email?.toLowerCase().includes(q) ||
//       u.department?.toLowerCase().includes(q) ||
//       u.phone_number?.includes(q)
//     );
//   });

//   if (loading)
//     return <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}><CircularProgress size={36} sx={{ color: "#42A5F5" }} /></Box>;

//   return (
//     <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
//       {/* Header */}
//       <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
//         <PhoneOutlinedIcon sx={{ fontSize: 28, color: "#42A5F5" }} />
//         <Box>
//           <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1.2 }}>Phone Directory</Typography>
//           <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.3 }}>Contact information for all registered users</Typography>
//         </Box>
//       </Box>

//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//       {/* Search */}
//       <TextField
//         fullWidth size="small" placeholder="Search by name, email, department, or phone..."
//         value={search} onChange={(e) => setSearch(e.target.value)}
//         InputProps={{
//           startAdornment: <InputAdornment position="start"><SearchOutlinedIcon sx={{ color: "#90A4AE", fontSize: 20 }} /></InputAdornment>,
//         }}
//         sx={{ mb: 3, "& .MuiOutlinedInput-root": { backgroundColor: "#FFFFFF", borderRadius: "8px" } }}
//       />

//       {/* Table */}
//       <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "8px" }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TH>Name</TH>
//               <TH>Email</TH>
//               <TH>Department</TH>
//               <TH>Phone_number</TH>
//               <TH>Roles</TH>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filtered.map((u) => (
//               <TableRow key={u.user_id} sx={{ "&:last-child td": { border: 0 } }}>
//                 <TableCell>
//                   <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "#0A1929" }}>{u.name}</Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography sx={{ fontSize: "0.85rem", color: "#455A64" }}>{u.email}</Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography sx={{ fontSize: "0.85rem", color: "#455A64" }}>{u.department || "—"}</Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography sx={{ fontSize: "0.85rem", color: u.phone ? "#0A1929" : "#CFD8DC", fontWeight: u.phone ? 600 : 400 }}>
//                     {u.phone || "—"}
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
//                     {(u.roles || []).map((r) => (
//                       <Chip key={r} label={r} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, backgroundColor: "#E3F2FD", color: "#1565C0" }} />
//                     ))}
//                     {(!u.roles || u.roles.length === 0) && <Chip label="Employee" size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, backgroundColor: "#F5F5F5", color: "#607D8B" }} />}
//                   </Box>
//                 </TableCell>
//               </TableRow>
//             ))}
//             {filtered.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
//                   <Typography sx={{ color: "#607D8B" }}>{search ? "No users match your search" : "No users found"}</Typography>
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </Card>

//       <Typography variant="body2" sx={{ color: "#90A4AE", mt: 2, textAlign: "right" }}>
//         Showing {filtered.length} of {users.length} users
//       </Typography>
//     </Box>
//   );
// };

// export default AdminPhoneDirectory;



// src/pages/AdminPhoneDirectory.jsx


// code has been changed for testing the database


import { useState, useEffect } from "react";
import axios from "axios";

import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Chip,
  InputAdornment,
} from "@mui/material";

import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const API = "http://localhost:3001/api";

const authH = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const TH = ({ children, align = "left" }) => (
  <TableCell
    align={align}
    sx={{
      fontWeight: 700,
      color: "#0A1929",
      fontSize: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      backgroundColor: "#F5F7FA",
      py: 1.4,
    }}
  >
    {children}
  </TableCell>
);

const AdminPhoneDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${API}/admin/phone-directory`,
          authH()
        );

        setUsers(res.data?.data || []);
      } catch (e) {
        console.error("Phone directory error:", e);

        setError(
          e.response?.data?.message ||
            "Failed to load user directory."
        );

        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      String(u.phone_number || "")
        .toLowerCase()
        .includes(q)
    );
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 10,
        }}
      >
        <CircularProgress
          size={36}
          sx={{ color: "#42A5F5" }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
        }}
      >
        <PhoneOutlinedIcon
          sx={{
            fontSize: 28,
            color: "#42A5F5",
          }}
        />

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#0A1929",
              lineHeight: 1.2,
            }}
          >
            Phone Directory
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#607D8B",
              mt: 0.3,
            }}
          >
            Contact information for all registered users
          </Typography>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search by name, email, department, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon
                sx={{
                  color: "#90A4AE",
                  fontSize: 20,
                }}
              />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,

          "& .MuiOutlinedInput-root": {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
          },
        }}
      />

      {/* Table */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E0E7EF",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Department</TH>
              <TH>Phone Number</TH>
              <TH>Roles</TH>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((u) => (
              <TableRow
                key={u.user_id}
                sx={{
                  "&:last-child td": {
                    border: 0,
                  },
                }}
              >
                {/* Name */}
                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      color: "#0A1929",
                    }}
                  >
                    {u.name || "—"}
                  </Typography>
                </TableCell>

                {/* Email */}
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#455A64",
                    }}
                  >
                    {u.email || "—"}
                  </Typography>
                </TableCell>

                {/* Department */}
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#455A64",
                    }}
                  >
                    {u.department || "—"}
                  </Typography>
                </TableCell>

                {/* Phone Number */}
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: u.phone_number
                        ? "#0A1929"
                        : "#CFD8DC",
                      fontWeight: u.phone_number
                        ? 600
                        : 400,
                    }}
                  >
                    {u.phone_number || "—"}
                  </Typography>
                </TableCell>

                {/* Roles */}
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      flexWrap: "wrap",
                    }}
                  >
                    {(u.roles || []).map((r) => (
                      <Chip
                        key={r}
                        label={r}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          backgroundColor: "#E3F2FD",
                          color: "#1565C0",
                        }}
                      />
                    ))}

                    {(!u.roles ||
                      u.roles.length === 0) && (
                      <Chip
                        label="Employee"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          backgroundColor: "#F5F5F5",
                          color: "#607D8B",
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {/* No users */}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography
                    sx={{
                      color: "#607D8B",
                    }}
                  >
                    {search
                      ? "No users match your search"
                      : "No users found"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Count */}
      <Typography
        variant="body2"
        sx={{
          color: "#90A4AE",
          mt: 2,
          textAlign: "right",
        }}
      >
        Showing {filtered.length} of {users.length} users
      </Typography>
    </Box>
  );
};

export default AdminPhoneDirectory;