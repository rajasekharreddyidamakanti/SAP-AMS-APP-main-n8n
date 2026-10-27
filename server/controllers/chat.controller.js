const chatService = require("../services/chat.service");
const MESSAGES = require("../constants/messages");

class ChatController {

    async sendMessage(req, res, next) {

        try {

            const message =
                await chatService.sendMessage(
                    req.params.sessionId,
                    req.user.userId,
                    req.body.message
                );

            res.status(201).json({

                success: true,
                message: MESSAGES.CHAT.MESSAGE_SENT,
                data: message

            });

        } catch (error) {

            next(error);

        }

    }

    async getMessages(req, res, next) {

        try {

            const messages =
                await chatService.getMessages(
                    req.params.sessionId,
                    req.user.userId
                );

            res.json({

                success: true,
                data: messages

            });

        } catch (error) {

            next(error);

        }

    }

    async getSession(req, res, next) {

        try {

            const session =
                await chatService.getSession(
                    req.params.sessionId
                );

            res.json({
                success: true,
                data: session
            });

        } catch (error) {
            next(error);
        }
    }

    async closeSession(req, res, next) {

        try {

            const session =
                await chatService.closeSession(
                    req.params.sessionId,
                    req.user.userId,
                    req.body.reason
                );

            res.json({
                success: true,
                message: MESSAGES.CHAT.SESSION_CLOSED_SUCCESS,
                data: session
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChatController();