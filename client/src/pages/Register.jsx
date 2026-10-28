import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, Card, Typography, TextField, Button, Alert,
  CircularProgress, InputAdornment, IconButton, MenuItem,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const departments = ["Finance", "HR", "MM", "SD", "PP", "QM", "PM"];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", department: "", phone_number: "",
    password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/roles");
        setRoles(res.data);
      } catch { console.error("Failed to load roles"); }
    };
    fetchRoles();
  }, []);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleRegister = async () => {
    setError(""); setSuccess("");
    if (!form.name || !form.email || !form.password || !form.department || !selectedRole) {
      setError("Please fill all required fields."); return;
    }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }

    try {
      setLoading(true);
      // const registerRes = await axios.post("http://localhost:3001/api/auth/register", {
      //   name: form.name, email: form.email, password: form.password,
      //   department: form.department, phone_number: form.phone_number,
      // });
      // await axios.post("http://localhost:3001/api/roles/request", {
      //   user_id: registerRes.data.user.user_id, role_id: selectedRole, deadline: null,
      // });
      // setSuccess("Registration successful! Redirecting to login...");
      // added for testing the project
      
      await axios.post("http://localhost:3001/api/auth/register", {
        name: form.name, email: form.email, password: form.password,
        department: form.department, phone_number: form.phone_number,
        role_id: selectedRole,
      });
      setSuccess("Registration successful! Redirecting to login...");

      // 
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F4F6F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 450, px: 2 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929" }}>SAP AMS</Typography>
          <Typography variant="body2" sx={{ color: "#637381", mt: 0.5 }}>Knowledge Management Platform</Typography>
        </Box>

        <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "8px", p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Create Account</Typography>
          <Typography variant="body2" sx={{ color: "#637381", mb: 3 }}>Register a new account</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TextField fullWidth size="small" label="Full Name" sx={{ mb: 2 }}
            value={form.name} onChange={(e) => handleChange("name", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField fullWidth size="small" label="Email" sx={{ mb: 2 }}
            value={form.email} onChange={(e) => handleChange("email", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField fullWidth size="small" label="Phone Number" sx={{ mb: 2 }}
            value={form.phone_number} onChange={(e) => handleChange("phone_number", e.target.value)}
            placeholder="+91 9876543210"
            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField select fullWidth size="small" label="Department" sx={{ mb: 2 }}
            value={form.department} onChange={(e) => handleChange("department", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon fontSize="small" /></InputAdornment> }}
          >
            {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <TextField select fullWidth size="small" label="Requested Role" sx={{ mb: 2 }}
            value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map((r) => <MenuItem key={r.role_id} value={r.role_id}>{r.role_name}</MenuItem>)}
          </TextField>
          <TextField fullWidth size="small" label="Password"
            type={showPassword ? "text" : "password"} sx={{ mb: 2 }}
            value={form.password} onChange={(e) => handleChange("password", e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
            }}
          />
          <TextField fullWidth size="small" label="Confirm Password"
            type={showConfirm ? "text" : "password"} sx={{ mb: 3 }}
            value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
            }}
          />
          <Button fullWidth variant="contained" onClick={handleRegister} disabled={loading}
            sx={{ backgroundColor: "#1565C0", textTransform: "none", fontWeight: 600, py: 1 }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Register"}
          </Button>
          <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "#637381" }}>
            Already have an account?{" "}
            <Typography component="span" onClick={() => navigate("/login")}
              sx={{ color: "#1565C0", cursor: "pointer", fontWeight: 600 }}>Sign In</Typography>
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default Register;