const express = require("express");

const authRoutes = require("./auth.routes");
const protectedRoutes = require("./protected.routes");
const articleRoutes = require("./article.routes");
const attachmentRoutes = require("./attachment.routes");
const dashboardRoutes = require("./dashboard.routes");
const roleRoutes = require("./role.routes");
const tagRoutes = require("./tag.routes");
const tagAssignmentRoutes = require("./tagassignm.routes");
const sectionRoutes = require("./section.routes");
const visibilityRoutes = require("./visibility.routes");
const aiReviewRoutes = require("./aiReview.routes");
const aiSearchRoutes =require("./aiSearch.routes");
const expertRequestRoutes =require("./expertRequest.routes");
const chatRoutes = require("./chat.routes");
const notificationRoutes =require("./notification.routes");
const transitionRoutes =require("./transition.routes");


const router = express.Router();
const contactRoutes = require("./contact.routes");
router.use("/contacts", contactRoutes);
router.use("/auth", authRoutes);
router.use("/protected", protectedRoutes);
router.use("/articles", articleRoutes);
router.use("/users", require("./users.routes"));
router.use("/articles", attachmentRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/roles", roleRoutes);
router.use("/tags", tagRoutes);
router.use("/tag-assignments", tagAssignmentRoutes);
router.use("/sections", sectionRoutes);
router.use("/visibility", visibilityRoutes);
router.use("/ai-review",aiReviewRoutes);
router.use("/duplicate",require("./duplicateDetection.routes"));
router.use("/ai-search",aiSearchRoutes);
router.use("/expert-request", expertRequestRoutes);
router.use("/chat", chatRoutes);
router.use("/notifications",notificationRoutes);
router.use("/transition",transitionRoutes);
router.use("/transition-checklist",require("./transitionChecklist.routes"));
router.use("/onboarding",require("./onboarding.routes"));
router.use("/training-modules",require("./trainingModule.routes"));
router.use("/training-assignments",require("./trainingAssignment.routes"));
router.use("/access-provisioning",require("./accessProvisioning.routes"));
router.use("/shadow-assignments",require("./shadowAssignment.routes"));
router.use("/support-requests", require("./supportRequest.routes"));
router.use("/readiness-assessments",require("./readinessAssessment.routes"));
router.use("/certifications",require("./certification.routes"));
router.use("/onboarding-dashboard",require("./onboardingDashboard.routes"));
router.use("/onboarding-progress",require("./onboardingProgress.routes"));
router.use("/onboarding-approval",require("./onboardingApproval.routes"));
router.use("/profile", require("./profile.routes"));

// New routes — Second Sprint
router.use("/admin-certifications", require("./adminCertifications.routes"));
router.use("/admin/teams",          require("./adminTeams.routes"));
router.use("/admin/phone-directory", require("./adminPhoneDirectory.routes"));
router.use("/resume-match", require("./resumeMatchRoutes"));
router.use("/ai-bot",               require("./aiBot.routes"));
router.use("/transition-attachments", require("./transitionAttachment.routes"));

module.exports = router;
