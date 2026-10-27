const expertRequestRepository =
    require("../repositories/expertRequest.repository");

const userRepository =
    require("../repositories/user.repository");

const notificationService =
    require("./notification.service");

const CHAT_STATUS =
    require("../constants/chatStatus");

const ACTION =
    require("../constants/timeoutAction");

const NOTIFICATION =
    require("../constants/notificationType");

class TimeoutActionService {

    async process(requestId, action) {

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

                message:"Request has not timed out."

            };

        }

        const deadline = new Date();

        deadline.setHours(deadline.getHours() + 18);

        switch(action){

        case ACTION.WAIT:

            await expertRequestRepository.extendDeadline(

                requestId,

                deadline

            );

            await notificationService.createNotification({

                user_id: request.expert_id,

                type: NOTIFICATION.CHAT_REQUEST,

                title:"Request Waiting",

                message:"The requester has extended the deadline.",

                reference_type:"expert_request",

                reference_id:requestId

            });

            return {

                message:"Deadline extended successfully."

            };

        case ACTION.TRANSFER:

        {

            const expert =
                await userRepository.getAnotherExpert(

                    request.expert_id,
                    request.module

                );

            if(!expert){

                throw{

                    status:404,

                    message:"No alternate expert available."

                };

            }

            await expertRequestRepository.transferExpert(

                requestId,

                expert.user_id,

                deadline

            );

            await notificationService.createNotification({

                user_id:expert.user_id,

                type:NOTIFICATION.CHAT_REQUEST,

                title:"Transferred Request",

                message:"A request has been transferred to you.",

                reference_type:"expert_request",

                reference_id:requestId

            });

            return{

                message:"Request transferred successfully."

            };

        }

        case ACTION.CONTACT_DETAILS:

        {

            const details =
                await userRepository.getContactDetails(

                    request.expert_id

                );

            return details;

        }

        default:

            throw{

                status:400,

                message:"Invalid timeout action."

            };

        }

    }

}

module.exports = new TimeoutActionService();