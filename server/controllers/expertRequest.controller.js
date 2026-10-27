// // // const expertRequestService = require("../services/expertRequest.service");
// // // const MESSAGES = require("../constants/messages");

// // // class ExpertRequestController {

// // //     async createRequest(req, res, next) {

// // //         try {

// // //             const request =
// // //                 await expertRequestService.createRequest(
// // //                     req.body,
// // //                     req.user.userId
// // //                 );

// // //             res.status(201).json({

// // //                 success: true,

// // //                 message: MESSAGES.CHAT.REQUEST_SENT,

// // //                 data: request

// // //             });

// // //         } catch (error) {

// // //             next(error);

// // //         }

// // //     }

// // //     async getPendingRequests(req, res, next) {

// // //         try {

// // //             const requests =
// // //                 await expertRequestService.getPendingRequests(
// // //                     req.user.userId
// // //                 );

// // //             res.json({

// // //                 success: true,

// // //                 data: requests

// // //             });

// // //         } catch (error) {

// // //             next(error);

// // //         }

// // //     }

// // //     async acceptRequest(req, res, next) {

// // //         try {

// // //             const request =
// // //                 await expertRequestService.acceptRequest(
// // //                     req.params.id
// // //                 );

// // //             res.json({

// // //                 success: true,

// // //                 message: MESSAGES.CHAT.REQUEST_ACCEPTED,

// // //                 data: request

// // //             });

// // //         } catch (error) {

// // //             next(error);

// // //         }

// // //     }

// // //     async rejectRequest(req, res, next) {

// // //         try {

// // //             const request =
// // //                 await expertRequestService.rejectRequest(
// // //                     req.params.id
// // //                 );

// // //             res.json({

// // //                 success: true,

// // //                 message: MESSAGES.CHAT.REQUEST_REJECTED,

// // //                 data: request

// // //             });

// // //         } catch (error) {

// // //             next(error);

// // //         }

// // //     }

// // // }

// // // module.exports = new ExpertRequestController();

// // // Added for Testing the Data

// // const expertRequestService = require("../services/expertRequest.service");
// // const MESSAGES = require("../constants/messages");

// // class ExpertRequestController {

// //     async createRequest(req, res, next) {

// //         try {

// //             const request =
// //                 await expertRequestService.createRequest(
// //                     req.body,
// //                     req.user.userId
// //                 );

// //             res.status(201).json({

// //                 success: true,

// //                 message: MESSAGES.CHAT.REQUEST_SENT,

// //                 data: request

// //             });

// //         } catch (error) {

// //             next(error);

// //         }

// //     }

// //     async getPendingRequests(req, res, next) {

// //         try {

// //             const requests =
// //                 await expertRequestService.getPendingRequests(
// //                     req.user.userId
// //                 );

// //             res.json({

// //                 success: true,

// //                 data: requests

// //             });

// //         } catch (error) {

// //             next(error);

// //         }

// //     }

// //     async reassignRequest(req, res, next) {

// //         try {

// //             const request =
// //                 await expertRequestService.reassignRequest(
// //                     req.params.id,
// //                     req.body.expert_id
// //                 );

// //             res.json({

// //                 success: true,

// //                 message: "Request reassigned successfully.",

// //                 data: request

// //             });

// //         } catch (error) {

// //             next(error);

// //         }

// //     }

// //     async acceptRequest(req, res, next) {

// //         try {

// //             const request =
// //                 await expertRequestService.acceptRequest(
// //                     req.params.id
// //                 );

// //             res.json({

// //                 success: true,

// //                 message: MESSAGES.CHAT.REQUEST_ACCEPTED,

// //                 data: request

// //             });

// //         } catch (error) {

// //             next(error);

// //         }

// //     }

// //     async rejectRequest(req, res, next) {

// //         try {

// //             const request =
// //                 await expertRequestService.rejectRequest(
// //                     req.params.id
// //                 );

// //             res.json({

// //                 success: true,

// //                 message: MESSAGES.CHAT.REQUEST_REJECTED,

// //                 data: request

// //             });

// //         } catch (error) {

// //             next(error);

// //         }

// //     }

// // }

// // module.exports = new ExpertRequestController();


// // 


// const expertRequestService = require("../services/expertRequest.service");
// const MESSAGES = require("../constants/messages");

// class ExpertRequestController {

//     async createRequest(req, res, next) {

//         try {

//             const request =
//                 await expertRequestService.createRequest(
//                     req.body,
//                     req.user.userId
//                 );

//             res.status(201).json({

//                 success: true,

//                 message: MESSAGES.CHAT.REQUEST_SENT,

//                 data: request

//             });

//         } catch (error) {

//             next(error);

//         }

//     }

//     async getPendingRequests(req, res, next) {

//         try {

//             const requests =
//                 await expertRequestService.getPendingRequests(
//                     req.user.userId
//                 );

//             res.json({

//                 success: true,

//                 data: requests

//             });

//         } catch (error) {

//             next(error);

//         }

//     }

//     async reassignRequest(req, res, next) {

//         try {

//             const request =
//                 await expertRequestService.reassignRequest(
//                     req.params.id,
//                     req.body.expert_id
//                 );

//             res.json({

//                 success: true,

//                 message: "Request reassigned successfully.",

//                 data: request

//             });

//         } catch (error) {

//             next(error);

//         }

//     }

//     async acceptRequest(req, res, next) {

//         try {

//             const request =
//                 await expertRequestService.acceptRequest(
//                     req.params.id
//                 );

//             res.json({

//                 success: true,

//                 message: MESSAGES.CHAT.REQUEST_ACCEPTED,

//                 data: request

//             });

//         } catch (error) {

//             next(error);

//         }

//     }

//     async rejectRequest(req, res, next) {

//         try {

//             const request =
//                 await expertRequestService.rejectRequest(
//                     req.params.id
//                 );

//             res.json({

//                 success: true,

//                 message: MESSAGES.CHAT.REQUEST_REJECTED,

//                 data: request

//             });

//         } catch (error) {

//             next(error);

//         }

//     }

//     async resolveRequest(req, res, next) {

//         try {

//             const request =
//                 await expertRequestService.resolveRequest(
//                     req.params.id
//                 );

//             res.json({

//                 success: true,

//                 message: "Request marked as resolved.",

//                 data: request

//             });

//         } catch (error) {

//             next(error);

//         }

//     }

//     async closeRequest(req, res, next) {

//         try {

//             const request =
//                 await expertRequestService.closeRequest(
//                     req.params.id
//                 );

//             res.json({

//                 success: true,

//                 message: "Request closed.",

//                 data: request

//             });

//         } catch (error) {

//             next(error);

//         }

//     }

//     async escalateRequest(req, res, next) {

//         try {

//             const request =
//                 await expertRequestService.escalateRequest(
//                     req.params.id,
//                     req.body.expert_id
//                 );

//             res.json({

//                 success: true,

//                 message: "Request escalated.",

//                 data: request

//             });

//         } catch (error) {

//             next(error);

//         }

//     }

// }

// module.exports = new ExpertRequestController();

// Added for test the data

const expertRequestService = require("../services/expertRequest.service");
const MESSAGES = require("../constants/messages");

class ExpertRequestController {

    async createRequest(req, res, next) {

        try {

            const request =
                await expertRequestService.createRequest(
                    req.body,
                    req.user.userId
                );

            res.status(201).json({

                success: true,

                message: MESSAGES.CHAT.REQUEST_SENT,

                data: request

            });

        } catch (error) {

            next(error);

        }

    }

    async getPendingRequests(req, res, next) {

        try {

            const requests =
                await expertRequestService.getPendingRequests(
                    req.user.userId
                );

            res.json({

                success: true,

                data: requests

            });

        } catch (error) {

            next(error);

        }

    }
    async getMyRequests(req, res, next) {

        try {

            const requests =
                await expertRequestService.getMyRequests(
                    req.user.userId
                );

            res.json({

                success: true,

                data: requests

            });

        } catch (error) {

            next(error);

        }

    }

    async deleteRequest(req, res, next) {

        try {

            await expertRequestService.deleteRequest(
                req.params.id,
                req.user.userId
            );

            res.json({

                success: true,

                message: MESSAGES.CHAT.REQUEST_DELETED

            });

        } catch (error) {

            next(error);

        }

    }
    

    //  Added for Testing the Data

    async getAllRequests(req, res, next) {

        try {

            const requests =
                await expertRequestService.getAllRequests();

            res.json({

                success: true,

                data: requests

            });

        } catch (error) {

            next(error);

        }

    }

    // 
    async reassignRequest(req, res, next) {

        try {

            const request =
                await expertRequestService.reassignRequest(
                    req.params.id,
                    req.body.expert_id
                );

            res.json({

                success: true,

                message: "Request reassigned successfully.",

                data: request

            });

        } catch (error) {

            next(error);

        }

    }

    async acceptRequest(req, res, next) {

        try {

            const request =
                await expertRequestService.acceptRequest(
                    req.params.id,
                    req.body.reply,
                    req.user.userId
                );

            res.json({

                success: true,

                message: MESSAGES.CHAT.REQUEST_ACCEPTED,

                data: request

            });

        } catch (error) {

            next(error);

        }

    }

    async rejectRequest(req, res, next) {

        try {

            const request =
                await expertRequestService.rejectRequest(
                    req.params.id
                );

            res.json({

                success: true,

                message: MESSAGES.CHAT.REQUEST_REJECTED,

                data: request

            });

        } catch (error) {

            next(error);

        }

    }

    async resolveRequest(req, res, next) {

        try {

            const request =
                await expertRequestService.resolveRequest(
                    req.params.id
                );

            res.json({

                success: true,

                message: "Request marked as resolved.",

                data: request

            });

        } catch (error) {

            next(error);

        }

    }

    async closeRequest(req, res, next) {

        try {

            const request =
                await expertRequestService.closeRequest(
                    req.params.id
                );

            res.json({

                success: true,

                message: "Request closed.",

                data: request

            });

        } catch (error) {

            next(error);

        }

    }

    async escalateRequest(req, res, next) {

        try {

            const request =
                await expertRequestService.escalateRequest(
                    req.params.id,
                    req.body.expert_id
                );

            res.json({

                success: true,

                message: "Request escalated.",

                data: request

            });

        } catch (error) {

            next(error);

        }

    }
    
    async deleteRequest(req, res, next) {

        try {

            await expertRequestService.deleteRequest(req.params.id);

            res.json({ success: true, message: "Request deleted." });

        } catch (error) {

            next(error);

        }

    }

    

}

module.exports = new ExpertRequestController();