// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Box, Card, Typography, TextField, Button, Alert,
  CircularProgress, InputAdornment, IconButton,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.message || "");

  // Back-button guard: if already logged in, send to dashboard
  useEffect(() => {
    if (user && localStorage.getItem("token")) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      login(res.data.token, res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F4F6F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 420, px: 2 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0A1929" }}>SAP AMS</Typography>
          <Typography variant="body2" sx={{ color: "#637381", mt: 0.5 }}>Knowledge Management Platform</Typography>
        </Box>

        <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: "8px", p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Sign In</Typography>
          <Typography variant="body2" sx={{ color: "#637381", mb: 3 }}>Login to access the portal</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth size="small" label="Email" type="email" sx={{ mb: 2 }}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailOutlinedIcon fontSize="small" /></InputAdornment>,
            }}
          />

          <TextField
            fullWidth size="small" label="Password"
            type={showPassword ? "text" : "password"} sx={{ mb: 3 }}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth variant="contained" onClick={handleLogin} disabled={loading}
            sx={{ backgroundColor: "#1565C0", textTransform: "none", fontWeight: 600, py: 1, "&:hover": { backgroundColor: "#0D47A1" } }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Sign In"}
          </Button>

          <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "#637381" }}>
            Don't have an account?{" "}
            <Typography component="span" onClick={() => navigate("/register")}
              sx={{ color: "#1565C0", cursor: "pointer", fontWeight: 600 }}>
              Register
            </Typography>
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;