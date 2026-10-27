const expertRequestRepository =
    require("../repositories/expertRequest.repository");

const userRepository =
    require("../repositories/user.repository");

const notificationService =
    require("./notification.service");

const CHAT_STATUS =
    require("../constants/chatStatus");

const NOTIFICATION_TYPE =
    require("../constants/notificationType");

class EscalationService {

    async transferRequest(requestId) {

        const request =
            await expertRequestRepository.getRequestById(requestId);

        if (!request) {

            throw {
                status:404,
                message:"Request not found"
            };

        }

        if (request.status !== CHAT_STATUS.REQUEST.TIMEOUT) {

            throw {
                status:400,
                message:"Request has not timed out"
            };

        }

        const newExpert =
            await userRepository.getAlternateExpert(
                request.expert_id,
                request.module
            );

        if (!newExpert) {

            throw {
                status:404,
                message:"No alternate expert found"
            };

        }

        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 18);

        const newRequest =
            await expertRequestRepository.createTransferredRequest({

                user_id: request.user_id,

                expert_id: newExpert.user_id,

                query: request.query,

                module: request.module,

                article_id: request.article_id,

                status: CHAT_STATUS.REQUEST.PENDING,

                deadline

            });

        await notificationService.createNotification({

            user_id: newExpert.user_id,

            type: NOTIFICATION_TYPE.CHAT_REQUEST,

            title: "Transferred Expert Request",

            message: "A timed-out request has been assigned to you.",

            reference_type: "expert_request",

            reference_id: newRequest.request_id

        });

        return newRequest;

    }

}

module.exports = new EscalationService();