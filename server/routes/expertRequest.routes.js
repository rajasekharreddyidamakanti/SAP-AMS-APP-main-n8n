// const express = require("express");
// const router = express.Router();

// const expertRequestController = require("../controllers/expertRequest.controller");
// const authMiddleware = require("../middleware/auth.middleware");
// const {timeoutAction}= require("../controllers/timeoutAction.controller");
// const {transferRequest} = require("../controllers/escalation.controller");

// router.post(
//     "/",
//     authMiddleware,
//     expertRequestController.createRequest
// );

// router.get(
//     "/pending",
//     authMiddleware,
//     expertRequestController.getPendingRequests
// );

// router.put(
//     "/:id/accept",
//     authMiddleware,
//     expertRequestController.acceptRequest
// );

// router.put(
//     "/:id/reject",
//     authMiddleware,
//     expertRequestController.rejectRequest
// );

// router.post(
//     "/:requestId/timeout-action",
//     authMiddleware,
//     timeoutAction
// );

// router.post(
//     "/:requestId/transfer",
//     authMiddleware,
//     transferRequest
// );
// module.exports = router;



// Added for Testing the Data



// const express = require("express");
// const router = express.Router();

// const expertRequestController = require("../controllers/expertRequest.controller");
// const authMiddleware = require("../middleware/auth.middleware");
// const {timeoutAction}= require("../controllers/timeoutAction.controller");
// const {transferRequest} = require("../controllers/escalation.controller");

// router.post(
//     "/",
//     authMiddleware,
//     expertRequestController.createRequest
// );

// router.get(
//     "/pending",
//     authMiddleware,
//     expertRequestController.getPendingRequests
// );

// router.put(
//     "/:id/reassign",
//     authMiddleware,
//     expertRequestController.reassignRequest
// );

// router.put(
//     "/:id/accept",
//     authMiddleware,
//     expertRequestController.acceptRequest
// );

// router.put(
//     "/:id/reject",
//     authMiddleware,
//     expertRequestController.rejectRequest
// );

// router.post(
//     "/:requestId/timeout-action",
//     authMiddleware,
//     timeoutAction
// );

// router.post(
//     "/:requestId/transfer",
//     authMiddleware,
//     transferRequest
// );
// module.exports = router;



const express = require("express");
const router = express.Router();

const expertRequestController = require("../controllers/expertRequest.controller");
const authMiddleware = require("../middleware/auth.middleware");
const {timeoutAction}= require("../controllers/timeoutAction.controller");
const {transferRequest} = require("../controllers/escalation.controller");

router.post(
    "/",
    authMiddleware,
    expertRequestController.createRequest
);
router.get(
    "/admin/all",
    authMiddleware,
    expertRequestController.getAllRequests
);

router.get(
    "/pending",
    authMiddleware,
    expertRequestController.getPendingRequests
);

router.get(
    "/my-requests",
    authMiddleware,
    expertRequestController.getMyRequests
);

router.delete(
    "/:id",
    authMiddleware,
    expertRequestController.deleteRequest
);

router.get(
    "/mine",
    authMiddleware,
    expertRequestController.getMyRequests
);

router.put(
    "/:id/reassign",
    authMiddleware,
    expertRequestController.reassignRequest
);

router.put(
    "/:id/accept",
    authMiddleware,
    expertRequestController.acceptRequest
);

router.put(
    "/:id/reject",
    authMiddleware,
    expertRequestController.rejectRequest
);

router.put(
    "/:id/resolve",
    authMiddleware,
    expertRequestController.resolveRequest
);

router.put(
    "/:id/close",
    authMiddleware,
    expertRequestController.closeRequest
);

router.put(
    "/:id/escalate",
    authMiddleware,
    expertRequestController.escalateRequest
);


router.post(
    "/:requestId/timeout-action",
    authMiddleware,
    timeoutAction
);

router.post(
    "/:requestId/transfer",
    authMiddleware,
    transferRequest
);

router.delete(
    "/:id",
    authMiddleware,
    expertRequestController.deleteRequest
);


module.exports = router;