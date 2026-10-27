const expertRequestRepository =
    require("../repositories/expertRequest.repository");

const notificationService =
    require("./notification.service");

const CHAT_STATUS =
    require("../constants/chatStatus");

const NOTIFICATION_TYPES =
    require("../constants/notificationType");

class DeadlineService {

    async processExpiredRequests() {

        const expiredRequests =
            await expertRequestRepository.getExpiredRequests();

        for (const request of expiredRequests) {
             // Testing
             
            // await expertRequestRepository.updateStatus(
            //     request.request_id,
            //     CHAT_STATUS.REQUEST.TIMEOUT
            // );
            await expertRequestRepository.updateStatus(
                request.request_id,
                CHAT_STATUS.REQUEST.TIMEOUT
            );
            await expertRequestRepository.markTimeoutProcessed(
                request.request_id
            );

            await notificationService.createNotification({

                user_id: request.user_id,

                type: NOTIFICATION_TYPES.CHAT_TIMEOUT,

                title: "Expert Request Timed Out",

                message:
                    "Your expert request was not accepted within 18 hours. Please choose your next action.",

                reference_type: "expert_request",

                reference_id: request.request_id

            });
        }
    }
}

module.exports = new DeadlineService();