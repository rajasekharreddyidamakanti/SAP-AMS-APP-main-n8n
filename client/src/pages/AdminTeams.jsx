// src/pages/AdminTeams.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Card, Typography, Avatar, Chip, CircularProgress,
  TextField, InputAdornment, Tabs, Tab, Grid,
} from "@mui/material";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";

const API = "http://localhost:3001/api";
const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const ROLE_BADGE = {
  "L1 Support": { bg: "#E8F5E9", color: "#2E7D32" },
  "L2 Support": { bg: "#FFF3E0", color: "#E65100" },
};

const MemberCard = ({ member }) => {
  const initials = member.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", p: 2.5, transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Avatar sx={{ width: 44, height: 44, backgroundColor: member.role === "L1 Support" ? "#2E7D32" : "#E65100", fontSize: "1rem", fontWeight: 700 }}>
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0A1929", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {member.name}
          </Typography>
          <Chip
            label={member.role}
            size="small"
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, ...ROLE_BADGE[member.role] }}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <EmailOutlinedIcon sx={{ fontSize: 14, color: "#90A4AE", flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.78rem", color: "#607D8B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {member.email}
          </Typography>
        </Box>
        {member.phone_number && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <PhoneOutlinedIcon sx={{ fontSize: 14, color: "#90A4AE", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.78rem", color: "#607D8B" }}>{member.phone_number}</Typography>
          </Box>
        )}
        {member.department && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <BusinessOutlinedIcon sx={{ fontSize: 14, color: "#90A4AE", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.78rem", color: "#607D8B" }}>{member.department}</Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

const AdminTeams = () => {
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [tab,      setTab]      = useState(0);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/admin/teams`, authH());
        setMembers(res.data?.data || res.data || []);
      } catch { setError("Failed to load team members."); }
      finally   { setLoading(false); }
    })();
  }, []);

  const l1 = members.filter((m) => m.role === "L1 Support");
  const l2 = members.filter((m) => m.role === "L2 Support");

  const currentList = (tab === 0 ? [...l1, ...l2] : tab === 1 ? l1 : l2).filter((m) =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <PeopleOutlinedIcon sx={{ fontSize: 28, color: "#42A5F5" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929", lineHeight: 1.2 }}>Support Teams</Typography>
          <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.3 }}>L1 and L2 support team members</Typography>
        </Box>
      </Box>

      {/* Summary cards */}
      {!loading && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: "Total Team", value: l1.length + l2.length, color: "#1565C0", bg: "#E3F2FD" },
            { label: "L1 Support", value: l1.length, color: "#2E7D32", bg: "#E8F5E9" },
            { label: "L2 Support", value: l2.length, color: "#E65100", bg: "#FFF3E0" },
          ].map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "10px", p: 2, backgroundColor: stat.bg }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
                <Typography variant="body2" sx={{ color: "#607D8B", fontWeight: 500 }}>{stat.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tabs + Search */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`All (${l1.length + l2.length})`} />
          <Tab label={`L1 Support (${l1.length})`} />
          <Tab label={`L2 Support (${l2.length})`} />
        </Tabs>
        <TextField size="small" placeholder="Search by name, email, dept…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#90A4AE" }} /></InputAdornment> }}
          sx={{ width: 280 }} />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size={32} sx={{ color: "#1565C0" }} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : currentList.length === 0 ? (
        <Card elevation={0} sx={{ border: "1px solid #E0E7EF", borderRadius: "12px", py: 8, textAlign: "center" }}>
          <PeopleOutlinedIcon sx={{ fontSize: 56, color: "#CFD8DC", mb: 2 }} />
          <Typography variant="body1" sx={{ color: "#90A4AE", fontWeight: 500 }}>
            {search ? "No members match your search" : "No team members found"}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {currentList.map((m) => (
            <Grid item xs={12} sm={6} md={4} key={m.user_id}>
              <MemberCard member={m} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminTeams;
