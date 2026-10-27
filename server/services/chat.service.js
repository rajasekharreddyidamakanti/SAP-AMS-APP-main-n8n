const chatRepository =
    require("../repositories/chat.repository");

const notificationService =
    require("./notification.service");

const MESSAGES =
    require("../constants/messages");

const CHAT_STATUS =
    require("../constants/chatStatus");

const NOTIFICATION_TYPE =
    require("../constants/notificationType");

class ChatService {

    async sendMessage(sessionId, senderId, message) {

        const session =
            await chatRepository.getSessionById(sessionId);

        if (!session) {

            throw {
                status: 404,
                message: MESSAGES.CHAT.SESSION_NOT_FOUND
            };

        }

        if (session.status !== CHAT_STATUS.SESSION.ACTIVE) {

            throw {
                status: 400,
                message: MESSAGES.CHAT.SESSION_CLOSED
            };

        }

        const createdMessage =
            await chatRepository.createMessage({

                session_id: sessionId,

                sender_id: senderId,

                message

            });

        const receiverId =
            session.requester_id === senderId
                ? session.expert_id
                : session.requester_id;

        await notificationService.createNotification({

            user_id: receiverId,

            type: NOTIFICATION_TYPE.CHAT_MESSAGE,

            title: "New Chat Message",

            message: "You have received a new message.",

            reference_type: "chat_session",

            reference_id: sessionId

        });

        return createdMessage;
    }

    async getMessages(sessionId, userId) {

        const session =
            await chatRepository.getSessionById(sessionId);

        if (!session) {

            throw {

                status: 404,

                message: MESSAGES.CHAT.SESSION_NOT_FOUND

            };

        }

        await chatRepository.markMessagesAsRead(

            sessionId,

            userId

        );

        return await chatRepository.getMessages(sessionId);

    }

    async getSession(sessionId) {

        const session =
            await chatRepository.getSessionDetails(sessionId);

        if (!session) {

            throw {

                status: 404,

                message: MESSAGES.CHAT.SESSION_NOT_FOUND

            };

        }

        return session;

    }

    async closeSession(sessionId, userId, reason) {

        const session =
            await chatRepository.getSessionById(sessionId);

        if (!session) {

            throw {

                status: 404,

                message: MESSAGES.CHAT.SESSION_NOT_FOUND

            };

        }

        const closedSession =
            await chatRepository.closeSession(

                sessionId,

                userId,

                reason

            );

        await notificationService.createNotification({

            user_id: session.requester_id,

            type: NOTIFICATION_TYPE.CHAT_CLOSED,

            title: "Chat Closed",

            message: "Your chat session has been closed.",

            reference_type: "chat_session",

            reference_id: sessionId

        });

        await notificationService.createNotification({

            user_id: session.expert_id,

            type: NOTIFICATION_TYPE.CHAT_CLOSED,

            title: "Chat Closed",

            message: "Your chat session has been closed.",

            reference_type: "chat_session",

            reference_id: sessionId

        });

        return closedSession;
    }

}

module.exports = new ChatService();