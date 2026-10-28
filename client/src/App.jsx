// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// ── Pages ─────────────────────────────────────────────────────────────────
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Dashboard     from "./pages/Dashboard";

// Knowledge Base
import ArticleList   from "./pages/ArticleList";
import ArticleDetail from "./pages/ArticleDetail";
import ArticleCreate from "./pages/ArticleCreate";
import ArticleEdit   from "./pages/ArticleEdit";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequests  from "./pages/AdminRequests";
import ManageRoles    from "./pages/ManageRoles";
import ManageTags     from "./pages/ManageTags";
import AdminTeams     from "./pages/AdminTeams";
import AdminPhoneDirectory from "./pages/AdminPhoneDirectory";

// Support & Expert
import SupportRequests from "./pages/SupportRequests";
import ExpertRequests  from "./pages/ExpertRequests";

// Communication
import Chat          from "./pages/Chat";
import Notifications from "./pages/Notifications";

// Transition
import TransitionDashboard from "./pages/TransitionDashboard";
import Certifications      from "./pages/Certifications";
import ContactRegistry     from "./pages/ContactRegistry";

// AI
import AISearch from "./pages/AISearch";
import ResumeIQ from "./pages/ResumeIQ";

// Profile
import Profile from "./pages/Profile";

// ── Layout ────────────────────────────────────────────────────────────────
import Sidebar from "./components/Sidebar";
import Topbar  from "./components/Topbar";
import AIChatBot from "./components/AIChatBot";
import { Box } from "@mui/material";

const AppLayout = ({ children }) => (
  <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F6F8" }}>
    <Sidebar />
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Topbar />
      <Box sx={{ flex: 1, p: 3 }}>{children}</Box>
    </Box>
    <AIChatBot />
  </Box>
);

const Protected = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Dashboard ─────────────────────── */}
          <Route path="/" element={<Protected><Dashboard /></Protected>} />

          {/* ── Knowledge Base ────────────────── */}
          <Route path="/articles"          element={<Protected><ArticleList /></Protected>} />
          <Route path="/articles/new"      element={<Protected><ArticleCreate /></Protected>} />
          <Route path="/articles/:id"      element={<Protected><ArticleDetail /></Protected>} />
          <Route path="/articles/:id/edit" element={<Protected><ArticleEdit /></Protected>} />

          {/* ── Admin ─────────────────────────── */}
          <Route path="/admin"          element={<Protected><AdminDashboard /></Protected>} />
          <Route path="/admin/requests" element={<Protected><AdminRequests /></Protected>} />
          <Route path="/admin/roles"    element={<Protected><ManageRoles /></Protected>} />
          <Route path="/admin/tags"     element={<Protected><ManageTags /></Protected>} />
          <Route path="/admin/teams"    element={<Protected><AdminTeams /></Protected>} />
          <Route path="/admin/phone-directory" element={<Protected><AdminPhoneDirectory /></Protected>} />

          {/* ── Support ───────────────────────── */}
          <Route path="/support"          element={<Protected><SupportRequests /></Protected>} />
          <Route path="/expert-requests"  element={<Protected><ExpertRequests /></Protected>} />

          {/* ── Communication ─────────────────── */}
          <Route path="/chat"          element={<Protected><Chat /></Protected>} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />

          {/* ── Transition ────────────────────── */}
          <Route path="/transitions"     element={<Protected><TransitionDashboard /></Protected>} />
          <Route path="/certifications"  element={<Protected><Certifications /></Protected>} />
          <Route path="/contacts"        element={<Protected><ContactRegistry /></Protected>} />
          {/* ── AI Search ─────────────────────── */}
          <Route path="/ai-search" element={<Protected><AISearch /></Protected>} />
          <Route path="/resume-iq" element={<Protected><ResumeIQ /></Protected>} />

          {/* ── Profile ───────────────────────── */}
          <Route path="/profile" element={<Protected><Profile /></Protected>} />

          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;