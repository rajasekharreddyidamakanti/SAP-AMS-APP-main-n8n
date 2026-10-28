import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { submitResumeMatch } from "../api/resumeMatch";

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const clampScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(100, Math.max(0, num));
};

const buildHiringManagerView = (result) => {
  const score = clampScore(result.matchScore);
  const experience = clampScore(result.experienceMatch);
  const education = clampScore(result.educationMatch);
  const matchedSkills = result.matchedSkills || [];
  const missingSkills = result.missingSkills || [];
  const skillSummary = matchedSkills.slice(0, 6).join(", ");

  let overall;
  if (score >= 80) {
    overall = "The resume shows a strong fit. Most of what the role asks for is clearly covered, and the next step is to confirm depth in an interview.";
  } else if (score >= 60) {
    overall = "The resume shows a partial fit. There is relevant material, but some parts of the role are not clearly covered, so a conversation would be needed to judge the fit properly.";
  } else if (score >= 40) {
    overall = "The resume shows a limited fit. Some relevant material is present, but several important parts of the role are not covered yet.";
  } else {
    overall = "The resume shows a low fit for this role. Most of the key requirements are not evident in the resume.";
  }

  const relevantSkills = matchedSkills.length
    ? `The resume shows ${skillSummary}. These cover part of the role, but the technical depth still needs to be confirmed.`
    : "No clear skill matches were detected against the job description.";
  const skillGaps = missingSkills.length
    ? `The resume does not clearly show: ${missingSkills.slice(0, 6).join(", ")}.`
    : "No significant skill gaps were identified against the job description.";
  const experienceSummary = experience >= 70
    ? "The experience described lines up well with what this role needs."
    : experience >= 40
      ? "The experience described overlaps with this role in some areas, but not all of it is directly relevant."
      : "The experience described has little overlap with this role. Look for projects, internships or self-directed work that could make up for it.";
  const educationSummary = education >= 60
    ? "The educational background meets what the role asks for."
    : "The educational background only partly meets what the role asks for.";
  const focusSkill = matchedSkills[0] || missingSkills[0];
  const interviewFocus = focusSkill
    ? `In a screening conversation, ask for a concrete example of work involving ${focusSkill}.`
    : "In a screening conversation, ask the candidate to walk through their most relevant project.";
  let nextStep;
  if (score >= 80) {
    nextStep = "Move the candidate forward to a technical interview. The final decision rests with the hiring team.";
  } else if (score >= 50) {
    nextStep = "Keep the candidate under review. A short screening call is worthwhile if the missing skills are trainable or the applicant pool is small. The final decision rests with the hiring team.";
  } else {
    nextStep = "Consider this candidate only if the applicant pool is small or the role can be filled by someone who will be trained. The final decision rests with the hiring team.";
  }

  return [
    ["Overall impression", overall],
    ["Relevant skills", relevantSkills],
    ["Skill gaps", skillGaps],
    ["Experience", experienceSummary],
    ["Education", educationSummary],
    ["Interview focus", interviewFocus],
    ["Suggested next step", nextStep],
  ];
};

const buildHtmlReport = ({ result, resumeName }) => {
  const score = clampScore(result.matchScore);
  const metrics = [
    ["Experience", clampScore(result.experienceMatch)],
    ["Skills", clampScore(result.skillsMatch)],
    ["Education", clampScore(result.educationMatch)],
  ];
  const recommendations = result.recommendations || [];
  const hiringPerspective = buildHiringManagerView(result);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ResumeIQ Analysis Report</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 16px; background: #f4f6f8; color: #263238; font: 16px/1.6 Arial, sans-serif; }
    main { max-width: 900px; margin: 0 auto; }
    header { padding: 28px 32px; border-radius: 14px; color: #fff; background: #0a1929; }
    header h1 { margin: 0; font-size: 28px; }
    header p { margin: 6px 0 0; color: #bbdefb; }
    .card { margin-top: 20px; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px; background: #fff; }
    h2 { margin: 0 0 14px; color: #0a1929; font-size: 19px; }
    .score { color: #1565c0; font-size: 42px; font-weight: 700; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
    .metric { padding: 16px; border-radius: 8px; background: #f3f8ff; }
    .metric strong { display: block; margin-top: 4px; color: #1565c0; font-size: 24px; }
    ul { margin: 0; padding-left: 22px; }
    li + li { margin-top: 8px; }
    .perspective p { margin: 10px 0; }
    .pre-wrap { white-space: pre-wrap; overflow-wrap: anywhere; }
    .muted, footer { color: #607d8b; font-size: 13px; }
    @media print { body { padding: 0; background: #fff; } .card, header { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>ResumeIQ Analysis Report</h1>
      <p>AI resume-to-job match analysis · SAP AMS</p>
    </header>
    <section class="card">
      <p class="muted">Resume: ${escapeHtml(resumeName || "Uploaded resume")}</p>
      <p class="muted">Generated: ${escapeHtml(new Date().toLocaleString())}</p>
      <div class="score">${Math.round(score)}% match</div>
      <h2>${escapeHtml(result.verdict || getVerdict(score))}</h2>
    </section>
    <section class="card">
      <h2>Summary</h2>
      <p class="pre-wrap">${escapeHtml(result.summary || "No summary was returned.")}</p>
    </section>
    <section class="card">
      <h2>Match Breakdown</h2>
      <div class="metrics">
        ${metrics.map(([label, value]) => `<div class="metric">${label}<strong>${Math.round(value)}%</strong></div>`).join("")}
      </div>
    </section>
    <section class="card">
      <h2>Recommendations</h2>
      ${recommendations.length
        ? `<ul>${recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : "<p>No recommendations were returned for this analysis.</p>"}
    </section>
    <section class="card">
      <h2>Hiring Manager Perspective</h2>
      <div class="perspective">
        ${hiringPerspective.map(([label, text]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</p>`).join("")}
      </div>
    </section>
    <footer><p>Generated by ResumeIQ in SAP AMS. This analysis is decision support and should be reviewed by a qualified person.</p></footer>
  </main>
</body>
</html>`;
};

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item));
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return normalizeList(parsed);
    } catch (_err) {
      // ignore
    }
    return [trimmed];
  }
  return [String(value)];
};

const getVerdict = (score) => {
  if (score >= 80) return "Strong fit";
  if (score >= 60) return "Promising fit";
  if (score >= 40) return "Needs tailoring";
  return "Low fit";
};

const scoreColor = (score) => {
  if (score >= 80) return "#2E7D32";
  if (score >= 60) return "#EF6C00";
  if (score >= 40) return "#F9A825";
  return "#D32F2F";
};

const ResumeIQ = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("resumeIQHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (_err) {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("resumeIQHistory", JSON.stringify(history));
  }, [history]);

  const metrics = useMemo(() => {
    if (!result) return [];
    return [
      { label: "Experience", value: clampScore(result.experienceMatch), color: "#3949AB" },
      { label: "Skills", value: clampScore(result.skillsMatch), color: "#2E7D32" },
      { label: "Education", value: clampScore(result.educationMatch), color: "#F9A825" },
    ];
  }, [result]);

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      setResumeFile(null);
      return;
    }
    setError("");
    setResumeFile(file);
  };

  const clearForm = () => {
    setResumeFile(null);
    setJobDescription("");
    setError("");
    setResult(null);
    const input = document.getElementById("resumeiq-file-input");
    if (input) input.value = "";
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError("Please upload a PDF resume.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile, resumeFile.name);
      formData.append("job_description", jobDescription.trim());

      const response = await submitResumeMatch(formData);
      const payload = response.data?.result || response.data || {};

      if (!payload || Object.keys(payload).length === 0) {
        throw new Error("The analysis returned an empty result.");
      }

      const matchedSkills = normalizeList(payload.matchedSkills || payload.matched_skills || []);
      const missingSkills = normalizeList(payload.missingSkills || payload.missing_skills || []);
      const recommendations = normalizeList(payload.recommendations || payload.recommendation || []);
      const cleanResult = {
        ...payload,
        matchScore: clampScore(payload.matchScore || payload.match_score || 0),
        experienceMatch: clampScore(payload.experienceMatch || payload.experience_match || 0),
        skillsMatch: clampScore(payload.skillsMatch || payload.skills_match || 0),
        educationMatch: clampScore(payload.educationMatch || payload.education_match || 0),
        verdict: payload.verdict || getVerdict(clampScore(payload.matchScore || payload.match_score || 0)),
        matchedSkills,
        missingSkills,
        recommendations,
      };

      setResult(cleanResult);
      setHistory((prev) => [{
        name: resumeFile.name,
        score: cleanResult.matchScore,
        verdict: cleanResult.verdict,
        time: new Date().toLocaleString(),
      }, ...prev].slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Resume analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;

    const report = buildHtmlReport({
      result,
      resumeName: resumeFile?.name || history[0]?.name,
    });
    const fileName = (resumeFile?.name || "resume")
      .replace(/\.pdf$/i, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "resume";
    const reportUrl = URL.createObjectURL(
      new Blob([report], { type: "text/html;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.href = reportUrl;
    link.download = `${fileName}-resumeiq-report.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(reportUrl), 1000);
  };

  const score = result ? clampScore(result.matchScore) : 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          p: 2.5,
          borderRadius: "16px",
          background: "linear-gradient(135deg, #0A1929 0%, #122F46 100%)",
          boxShadow: "0 12px 30px rgba(10,25,41,0.12)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #E3F2FD 0%, #E8EAF6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesomeIcon sx={{ color: "#1565C0", fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#FFFFFF", letterSpacing: 0.2 }}>
              ResumeIQ
            </Typography>
            <Typography variant="body2" sx={{ color: "#BBDEFB", mt: 0.2 }}>
              AI resume-to-job matching for SAP AMS
            </Typography>
          </Box>
        </Box>
        <Chip
          label="AI Candidate Match"
          sx={{
            backgroundColor: "rgba(255,255,255,0.08)",
            color: "#E3F2FD",
            border: "1px solid rgba(255,255,255,0.12)",
            fontWeight: 700,
            px: 1,
            height: 32,
          }}
        />
      </Box>

      <Card
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid #E0E0E0",
          borderRadius: "12px",
          background: "#FFFFFF",
          mb: 3,
          boxShadow: "0 8px 24px rgba(17,24,39,0.03)",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <UploadFileOutlinedIcon sx={{ color: "#1565C0" }} />
              <Typography sx={{ fontWeight: 700, color: "#0A1929" }}>Upload resume</Typography>
            </Box>
            <Button
              variant="outlined"
              component="label"
              sx={{
                width: "100%",
                borderRadius: "10px",
                py: 2.5,
                borderColor: "#CBD5E1",
                color: "#0A1929",
                textTransform: "none",
                justifyContent: "center",
                fontWeight: 600,
                backgroundColor: "#F8FAFC",
                "&:hover": { borderColor: "#90CAF9", backgroundColor: "#F3F8FF" },
              }}
            >
              {resumeFile ? resumeFile.name : "Choose PDF resume"}
              <input id="resumeiq-file-input" type="file" accept="application/pdf" hidden onChange={handleFileChange} />
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <DescriptionOutlinedIcon sx={{ color: "#1565C0" }} />
              <Typography sx={{ fontWeight: 700, color: "#0A1929" }}>Job description</Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={7}
              placeholder="Paste the full job description to compare with the resume..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  background: "#F8FAFC",
                  fontSize: "0.94rem",
                },
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            onClick={clearForm}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, borderColor: "#B0BEC5", color: "#0A1929" }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={loading}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
              boxShadow: "none",
              px: 3,
              "&:hover": { background: "linear-gradient(135deg, #0D47A1 0%, #0B3E8A 100%)" },
              "&.Mui-disabled": { background: "#BDBDBD" },
            }}
          >
            {loading ? <><CircularProgress size={18} sx={{ color: "#fff", mr: 1 }} />Analyzing...</> : "Analyze Resume"}
          </Button>
        </Box>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
          {error}
        </Alert>
      )}

      {result && (
        <Box>
          <Card
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid #DDEAF7",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #f4f9ff 100%)",
              mb: 3,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Box
                    sx={{
                      width: 180,
                      height: 180,
                      borderRadius: "50%",
                      background: `conic-gradient(${scoreColor(score)} ${score}%, #e9edf5 0%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 18px 38px rgba(21,101,192,0.12)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 138,
                        height: 138,
                        borderRadius: "50%",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Typography sx={{ fontSize: "2.5rem", fontWeight: 800, color: "#0A1929", lineHeight: 1 }}>
                        {Math.round(score)}%
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#607D8B", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        Match
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: "#0A1929" }}>
                  {result.verdict || getVerdict(score)}
                </Typography>
                <Typography sx={{ color: "#455A64", mt: 1, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {result.summary || "The candidate resume has been analyzed against the job description."}
                </Typography>
              </Grid>
            </Grid>
          </Card>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {metrics.map((metric) => (
              <Grid item xs={12} sm={4} key={metric.label}>
                <Card elevation={0} sx={{ p: 2.5, border: "1px solid #E0E0E0", borderRadius: "12px", background: "#fff" }}>
                  <Typography sx={{ color: "#607D8B", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {metric.label}
                  </Typography>
                  <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, color: metric.color, mt: 1 }}>
                    {Math.round(metric.value)}%
                  </Typography>
                  <Box sx={{ height: 8, borderRadius: 999, background: "#EEF2F6", mt: 1.5, overflow: "hidden" }}>
                    <Box sx={{ width: `${metric.value}%`, height: "100%", borderRadius: 999, background: metric.color }} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ p: 2.5, border: "1px solid #E0E0E0", borderRadius: "12px", background: "#fff", height: "100%" }}>
                <Typography sx={{ fontWeight: 800, color: "#0A1929", mb: 1.5 }}>Matched skills</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {result.matchedSkills?.length ? (
                    result.matchedSkills.map((skill) => (
                      <Chip key={skill} label={skill} sx={{ background: "#E8F5E9", color: "#1B5E20", fontWeight: 700, borderRadius: "8px" }} />
                    ))
                  ) : (
                    <Typography sx={{ color: "#607D8B" }}>No clear skill matches detected.</Typography>
                  )}
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ p: 2.5, border: "1px solid #E0E0E0", borderRadius: "12px", background: "#fff", height: "100%" }}>
                <Typography sx={{ fontWeight: 800, color: "#0A1929", mb: 1.5 }}>Missing skills / gaps</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {result.missingSkills?.length ? (
                    result.missingSkills.map((skill) => (
                      <Chip key={skill} label={skill} sx={{ background: "#FDECEC", color: "#B71C1C", fontWeight: 700, borderRadius: "8px" }} />
                    ))
                  ) : (
                    <Typography sx={{ color: "#607D8B" }}>No major gaps identified.</Typography>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>

          <Card elevation={0} sx={{ mt: 3, p: 2.5, border: "1px solid #E0E0E0", borderRadius: "12px", background: "#fff" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <FactCheckOutlinedIcon sx={{ color: "#1565C0" }} />
              <Typography sx={{ fontWeight: 800, color: "#0A1929" }}>Recommendations</Typography>
            </Box>
            <List disablePadding>
              {result.recommendations?.length ? (
                result.recommendations.map((item, index) => (
                  <ListItem
                    key={`${item}-${index}`}
                    disableGutters
                    sx={{ py: 1.25, borderBottom: index === result.recommendations.length - 1 ? "none" : "1px solid #EEF2F6" }}
                  >
                    <ListItemText
                      primary={
                        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1.2 }}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: "7px",
                              background: "#E8F0FE",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              color: "#1565C0",
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography component="span" sx={{ color: "#374151" }}>{item}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ color: "#607D8B" }}>No recommendations were returned for this analysis.</Typography>
              )}
            </List>
          </Card>

          <Card
            elevation={0}
            sx={{
              mt: 3,
              p: 2.5,
              border: "1px solid #DDEAF7",
              borderRadius: "12px",
              background: "#F8FBFF",
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, color: "#0A1929" }}>Export report</Typography>
              <Typography variant="body2" sx={{ color: "#607D8B", mt: 0.4 }}>
                Download this analysis as a standalone HTML report.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleDownloadReport}
              startIcon={<DownloadOutlinedIcon />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#1565C0",
                "&:hover": { backgroundColor: "#0D47A1" },
              }}
            >
              Download Report
            </Button>
          </Card>

          {history.length > 0 && (
            <Card elevation={0} sx={{ mt: 3, p: 2.5, border: "1px solid #E0E0E0", borderRadius: "12px", background: "#fff" }}>
              <Typography sx={{ fontWeight: 800, color: "#0A1929", mb: 2 }}>Recent analyses</Typography>
              <Stack spacing={1.5}>
                {history.map((entry, index) => (
                  <Box
                    key={`${entry.name}-${index}`}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      alignItems: "center",
                      border: "1px solid #EEF2F6",
                      borderRadius: "10px",
                      p: 1.5,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#0A1929" }}>{entry.name}</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#607D8B" }}>{entry.time}</Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontWeight: 800, color: "#1565C0" }}>{Math.round(entry.score)}%</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#607D8B" }}>{entry.verdict}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ResumeIQ;
