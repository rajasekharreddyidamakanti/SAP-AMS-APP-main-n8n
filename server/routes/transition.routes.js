const express = require("express");

const router = express.Router();

const authenticateUser =
    require("../middleware/auth.middleware");

const transitionController =
    require("../controllers/transition.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const taskAttachmentController = require("../controllers/transitionTaskAttachment.controller");
router.post(
    "/",
    authenticateUser,
    transitionController.createTransition
);
// Added for testing the data
router.get("/mine", authMiddleware, transitionController.getMyTransitions);
router.delete("/:id", authMiddleware, transitionController.deleteTransition);
// 
router.get(
    "/",
    authenticateUser,
    transitionController.getAllTransitions
);

router.get(
    "/:id",
    authenticateUser,
    transitionController.getTransitionById
);

router.get(
    "/:id/tasks",
    authenticateUser,
    transitionController.getTasks
);

router.post(
    "/:id/tasks",
    authenticateUser,
    transitionController.createTask
);

router.get(
    "/:id/phase-progress",
    authenticateUser,
    transitionController.getPhaseProgress
);


router.delete(
    "/:id",
    authenticateUser,
    transitionController.deleteTransition
);

router.put(
    "/tasks/:taskId",
    authenticateUser,
    transitionController.updateTaskStatus
);

router.put(
    "/tasks/:taskId/details",
    authenticateUser,
    transitionController.updateTaskDetails
);

router.delete(
    "/tasks/:taskId",
    authenticateUser,
    transitionController.deleteTask
);

router.get("/tasks/:taskId/attachments", authenticateUser, taskAttachmentController.list);
router.post("/tasks/:taskId/attachments", authenticateUser, upload.single("file"), taskAttachmentController.uploadFile);
router.delete("/task-attachments/:attachmentId", authenticateUser, taskAttachmentController.deleteAttachment);

module.exports = router;