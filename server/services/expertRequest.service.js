// const expertRequestRepository =
//     require("../repositories/expertRequest.repository");

// const chatRepository =
//     require("../repositories/chat.repository");

// const userRepository =
//     require("../repositories/user.repository");

// const notificationService =
//     require("./notification.service");

// const CHAT_STATUS =
//     require("../constants/chatStatus");

// const NOTIFICATION_TYPE =
//     require("../constants/notificationType");

// const MESSAGES =
//     require("../constants/messages");

// class ExpertRequestService {

//     async createRequest(data, userId) {

//         const deadline = new Date();
//         deadline.setHours(deadline.getHours() + 18);

//         const queryText = data.query || data.description;
//         let finalExpertId = data.expert_id;

//         // New requests are routed to a "pure" Admin first — someone whose
//         // ONLY role is Admin (not also Expert/Team Lead/anything else).
//         // Admin reviews and reassigns to the right expert manually via
//         // reassignRequest(), instead of the system picking one at random.
//         if (!finalExpertId) {
//             const db = require("../config/db");

//             console.log("===== ADMIN ASSIGNMENT DEBUG =====");
//             console.log("Logged-in userId:", userId);
//             console.log("Requested module:", data.module);

//             // const adminRes = await db.query(`
//             //     SELECT
//             //         u.user_id,
//             //         u.name,
//             //         u.email
//             //     FROM users u
//             //     JOIN user_roles ur
//             //         ON u.user_id = ur.user_id
//             //     JOIN roles r
//             //         ON ur.role_id = r.role_id
//             //     WHERE LOWER(r.role_name) = 'admin'
//             //       AND u.user_id != $1
//             //       AND u.is_active = TRUE
//             //       AND (
//             //           SELECT COUNT(*) FROM user_roles ur2
//             //           WHERE ur2.user_id = u.user_id
//             //       ) = 1
//             //     ORDER BY u.user_id
//             //     LIMIT 1
//             // `, [userId]);

//             // changed the query for testing the data in the project

//             const adminRes = await db.query(`
//                 SELECT
//                     u.user_id,
//                     u.name,
//                     u.email
//                 FROM users u
//                 JOIN user_roles ur
//                     ON u.user_id = ur.user_id
//                 JOIN roles r
//                     ON ur.role_id = r.role_id
//                 WHERE LOWER(r.role_name) = 'admin'
//                   AND u.user_id != $1
//                   AND u.is_active = TRUE
//                 ORDER BY u.user_id
//                 LIMIT 1
//             `, [userId]);
// // 

//             console.log("Admin query result:", adminRes.rows);

//             if (adminRes.rows.length === 0) {
//                 throw {
//                     status: 404,
//                     message: "No available admin found."
//                 };
//             }

//             finalExpertId = adminRes.rows[0].user_id;

//             console.log("Request assigned to Admin:", finalExpertId);
//         }

//         const expert = await userRepository.getUserById(finalExpertId);

//         if (!expert) {
//             throw { status: 404, message: "Assigned expert not found." };
//         }

//         const request =
//             await expertRequestRepository.createRequest({

//                 user_id: userId,

//                 expert_id: finalExpertId,

//                 query: queryText,

//                 module: data.module || null,

//                 article_id: data.article_id || null,

//                 status: CHAT_STATUS.REQUEST.PENDING,

//                 deadline

//             });

//         // Also query expert name to notify them properly
//         await notificationService.createNotification({

//             user_id: request.expert_id,

//             type: NOTIFICATION_TYPE.CHAT_REQUEST,

//             title: "New Expert Request",

//             message: "You have received a new expert request.",

//             reference_type: "expert_request",

//             reference_id: request.request_id

//         });

//         return request;
//     }

//     async getPendingRequests(expertId) {

//         return await expertRequestRepository.getPendingRequests(expertId);

//     }

//     // Admin hands off a request (currently assigned to them) to a
//     // specific expert — used by the admin "Reassign" action.
//     async reassignRequest(requestId, newExpertId) {

//         const request =
//             await expertRequestRepository.getRequestById(requestId);

//         if (!request) {
//             throw { status: 404, message: MESSAGES.CHAT.REQUEST_NOT_FOUND };
//         }

//         const expert = await userRepository.getUserById(newExpertId);
//         if (!expert) {
//             throw { status: 404, message: "Selected expert not found." };
//         }

//         const updated =
//             await expertRequestRepository.reassignRequest(requestId, newExpertId);

//         await notificationService.createNotification({

//             user_id: newExpertId,

//             type: NOTIFICATION_TYPE.CHAT_REQUEST,

//             title: "New Expert Request",

//             message: "An admin has assigned you a new expert request.",

//             reference_type: "expert_request",

//             reference_id: requestId

//         });

//         return updated;
//     }

//     async acceptRequest(requestId) {
//         try {
//             console.log("===== ACCEPT REQUEST DEBUG =====");
//             console.log("Request ID:", requestId);

//             const request =
//                 await expertRequestRepository.getRequestById(requestId);

//             console.log("Request found:", request);

//             if (!request) {
//                 throw {
//                     status: 404,
//                     message: MESSAGES.CHAT.REQUEST_NOT_FOUND
//                 };
//             }

//             if (request.status !== CHAT_STATUS.REQUEST.PENDING) {
//                 throw {
//                     status: 400,
//                     message: MESSAGES.CHAT.REQUEST_NOT_PENDING
//                 };
//             }

//             console.log("Updating request status to accepted...");

//             const updated =
//                 await expertRequestRepository.updateStatus(
//                     requestId,
//                     CHAT_STATUS.REQUEST.ACCEPTED
//                 );

//             console.log("Request updated:", updated);

//             console.log("Creating chat session...");

//             await chatRepository.createSession(requestId);

//             console.log("Chat session created successfully.");

//             console.log("Creating notification...");

//             await notificationService.createNotification({
//                 user_id: request.user_id,

//                 type: NOTIFICATION_TYPE.CHAT_ACCEPTED,

//                 title: "Request Accepted",

//                 message:
//                     "Your expert request has been accepted. You can now start chatting.",

//                 reference_type: "expert_request",

//                 reference_id: request.request_id
//             });

//             console.log("Notification created successfully.");

//             return updated;

//         } catch (error) {

//             console.error("===== ACCEPT REQUEST ERROR =====");
//             console.error(error);
//             console.error("Message:", error.message);
//             console.error("Code:", error.code);
//             console.error("Detail:", error.detail);
//             console.error("Stack:", error.stack);

//             throw error;
//         }
//     }

//     async rejectRequest(requestId) {

//         const request =
//             await expertRequestRepository.getRequestById(requestId);

//         if (!request) {
//             throw {
//                 status: 404,
//                 message: MESSAGES.CHAT.REQUEST_NOT_FOUND
//             };
//         }

//         const updated =
//             await expertRequestRepository.updateStatus(

//                 requestId,

//                 CHAT_STATUS.REQUEST.REJECTED

//             );

//         await notificationService.createNotification({

//             user_id: request.user_id,

//             type: NOTIFICATION_TYPE.CHAT_REJECTED,

//             title: "Request Rejected",

//             message: "Your expert request has been rejected.",

//             reference_type: "expert_request",

//             reference_id: request.request_id

//         });

//         return updated;
//     }

// }

// module.exports = new ExpertRequestService();




// 


const expertRequestRepository =
    require("../repositories/expertRequest.repository");

const chatRepository =
    require("../repositories/chat.repository");

const userRepository =
    require("../repositories/user.repository");

const notificationService =
    require("./notification.service");

const CHAT_STATUS =
    require("../constants/chatStatus");

const NOTIFICATION_TYPE =
    require("../constants/notificationType");

const MESSAGES =
    require("../constants/messages");

class ExpertRequestService {

    async createRequest(data, userId) {

        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 18);

        const queryText = data.query || data.description;
        let finalExpertId = data.expert_id;

        // New requests are routed to a "pure" Admin first — someone whose
        // ONLY role is Admin (not also Expert/Team Lead/anything else).
        // Admin reviews and reassigns to the right expert manually via
        // reassignRequest(), instead of the system picking one at random.
        if (!finalExpertId) {
            const db = require("../config/db");

            console.log("===== ADMIN ASSIGNMENT DEBUG =====");
            console.log("Logged-in userId:", userId);
            console.log("Requested module:", data.module);

            const adminRes = await db.query(`
                SELECT
                    u.user_id,
                    u.name,
                    u.email
                FROM users u
                JOIN user_roles ur
                    ON u.user_id = ur.user_id
                JOIN roles r
                    ON ur.role_id = r.role_id
                WHERE LOWER(r.role_name) = 'admin'
                  AND u.user_id != $1
                  AND u.is_active = TRUE
                ORDER BY u.user_id
                LIMIT 1
            `, [userId]);

            console.log("Admin query result:", adminRes.rows);

            if (adminRes.rows.length === 0) {
                throw {
                    status: 404,
                    message: "No available admin found."
                };
            }

            finalExpertId = adminRes.rows[0].user_id;

            console.log("Request assigned to Admin:", finalExpertId);
        }

        const expert = await userRepository.getUserById(finalExpertId);

        if (!expert) {
            throw { status: 404, message: "Assigned expert not found." };
        }

        const request =
            await expertRequestRepository.createRequest({

                user_id: userId,

                expert_id: finalExpertId,

                query: queryText,

                module: data.module || null,

                article_id: data.article_id || null,

                status: CHAT_STATUS.REQUEST.PENDING,

                deadline

            });

        await notificationService.createNotification({

            user_id: request.expert_id,

            type: NOTIFICATION_TYPE.CHAT_REQUEST,

            title: "New Expert Request",

            message: "You have received a new expert request.",

            reference_type: "expert_request",

            reference_id: request.request_id

        });

        return request;
    }

    async getPendingRequests(expertId) {

        return await expertRequestRepository.getPendingRequests(expertId);

    }

       async getMyRequests(userId) {

        return await expertRequestRepository.getRequestsByUser(userId);

    }

    async deleteRequest(requestId, userId) {

        const request =
            await expertRequestRepository.getRequestById(requestId);

        if (!request) {
            throw {
                status: 404,
                message: MESSAGES.CHAT.REQUEST_NOT_FOUND
            };
        }

        if (Number(request.user_id) !== Number(userId)) {
            throw {
                status: 403,
                message: MESSAGES.CHAT.REQUEST_DELETE_FORBIDDEN
            };
        }

        if (request.status === CHAT_STATUS.REQUEST.ACCEPTED) {
            throw {
                status: 400,
                message: MESSAGES.CHAT.REQUEST_DELETE_ACCEPTED
            };
        }

        return await expertRequestRepository.deleteRequest(requestId);

    }
// Added for testing the data
    
    async getAllRequests() {

        return await expertRequestRepository.getAllRequests();

    }
// 

    // Admin hands off a request (currently assigned to them) to a
    // specific expert — used by the admin "Assign to..." action.
    async reassignRequest(requestId, newExpertId) {

        const request =
            await expertRequestRepository.getRequestById(requestId);

        if (!request) {
            throw { status: 404, message: MESSAGES.CHAT.REQUEST_NOT_FOUND };
        }

        const expert = await userRepository.getUserById(newExpertId);
        if (!expert) {
            throw { status: 404, message: "Selected expert not found." };
        }

        const updated =
            await expertRequestRepository.reassignRequest(requestId, newExpertId);

        await notificationService.createNotification({

            user_id: newExpertId,

            type: NOTIFICATION_TYPE.CHAT_REQUEST,

            title: "New Expert Request",

            message: "An admin has assigned you a new expert request.",

            reference_type: "expert_request",

            reference_id: requestId

        });

        return updated;
    }

    async acceptRequest(requestId, replyMessage, acceptedByUserId) {
        try {
            console.log("===== ACCEPT REQUEST DEBUG =====");
            console.log("Request ID:", requestId);

            const request =
                await expertRequestRepository.getRequestById(requestId);

            console.log("Request found:", request);

            if (!request) {
                throw {
                    status: 404,
                    message: MESSAGES.CHAT.REQUEST_NOT_FOUND
                };
            }

            if (
                request.status !== CHAT_STATUS.REQUEST.PENDING &&
                request.status !== CHAT_STATUS.REQUEST.ASSIGNED
            ) {
                throw {
                    status: 400,
                    message: MESSAGES.CHAT.REQUEST_NOT_PENDING
                };
            }

            console.log("Updating request status to accepted...");

            const updated =
                await expertRequestRepository.updateStatus(
                    requestId,
                    CHAT_STATUS.REQUEST.ACCEPTED
                );

            console.log("Request updated:", updated);

            console.log("Creating chat session...");

            const session = await chatRepository.createSession(requestId);

            console.log("Chat session created successfully.");

            // If the accepting expert/admin typed a reply, send it as the
            // very first message in the newly created chat session.
            if (replyMessage && replyMessage.trim()) {
                console.log("Sending initial reply message...");

                await chatRepository.createMessage({
                    session_id: session.session_id,
                    sender_id: acceptedByUserId || request.expert_id,
                    message: replyMessage.trim()
                });

                console.log("Initial reply message sent.");
            }

            console.log("Creating notification...");

            await notificationService.createNotification({
                user_id: request.user_id,

                type: NOTIFICATION_TYPE.CHAT_ACCEPTED,

                title: "Request Accepted",

                message:
                    "Your expert request has been accepted. You can now start chatting.",

                reference_type: "expert_request",

                reference_id: request.request_id
            });

            console.log("Notification created successfully.");

            return updated;

        } catch (error) {

            console.error("===== ACCEPT REQUEST ERROR =====");
            console.error(error);
            console.error("Message:", error.message);
            console.error("Code:", error.code);
            console.error("Detail:", error.detail);
            console.error("Stack:", error.stack);

            throw error;
        }
    }

    async rejectRequest(requestId) {

        const request =
            await expertRequestRepository.getRequestById(requestId);

        if (!request) {
            throw {
                status: 404,
                message: MESSAGES.CHAT.REQUEST_NOT_FOUND
            };
        }

        const updated =
            await expertRequestRepository.updateStatus(

                requestId,

                CHAT_STATUS.REQUEST.REJECTED

            );

        await notificationService.createNotification({

            user_id: request.user_id,

            type: NOTIFICATION_TYPE.CHAT_REJECTED,

            title: "Request Rejected",

            message: "Your expert request has been rejected.",

            reference_type: "expert_request",

            reference_id: request.request_id

        });

        return updated;
    }

    // Marks the underlying SAP issue as fixed.
    async resolveRequest(requestId) {

        const request =
            await expertRequestRepository.getRequestById(requestId);

        if (!request) {
            throw { status: 404, message: MESSAGES.CHAT.REQUEST_NOT_FOUND };
        }

        const updated =
            await expertRequestRepository.updateStatus(
                requestId,
                CHAT_STATUS.REQUEST.RESOLVED
            );

        await notificationService.createNotification({

            user_id: request.user_id,

            type: NOTIFICATION_TYPE.CHAT_ACCEPTED,

            title: "Request Resolved",

            message: "Your expert request has been marked as resolved.",

            reference_type: "expert_request",

            reference_id: request.request_id

        });

        return updated;
    }

    // Archives the ticket.
    async closeRequest(requestId) {

        const request =
            await expertRequestRepository.getRequestById(requestId);

        if (!request) {
            throw { status: 404, message: MESSAGES.CHAT.REQUEST_NOT_FOUND };
        }

        return await expertRequestRepository.updateStatus(
            requestId,
            CHAT_STATUS.REQUEST.CLOSED
        );
    }

    // Bumps the request to escalated status. Optionally hands it to a
    // specific (usually more senior) expert at the same time.
    async escalateRequest(requestId, newExpertId) {

        const request =
            await expertRequestRepository.getRequestById(requestId);

        if (!request) {
            throw { status: 404, message: MESSAGES.CHAT.REQUEST_NOT_FOUND };
        }

        let updated;

        if (newExpertId) {
            await expertRequestRepository.reassignRequest(requestId, newExpertId);
        }

        updated = await expertRequestRepository.updateStatus(
            requestId,
            CHAT_STATUS.REQUEST.ESCALATED
        );

        const notifyUserId = newExpertId || request.expert_id;

        await notificationService.createNotification({

            user_id: notifyUserId,

            type: NOTIFICATION_TYPE.CHAT_REQUEST,

            title: "Expert Request Escalated",

            message: "An expert request has been escalated to you.",

            reference_type: "expert_request",

            reference_id: requestId

        });

        return updated;
    }

    
    async deleteRequest(requestId) {

        const request = await expertRequestRepository.getRequestById(requestId);

        if (!request) {
            throw { status: 404, message: MESSAGES.CHAT.REQUEST_NOT_FOUND };
        }

        await expertRequestRepository.deleteRequest(requestId);

        return { deleted: true };
    }

}

module.exports = new ExpertRequestService();