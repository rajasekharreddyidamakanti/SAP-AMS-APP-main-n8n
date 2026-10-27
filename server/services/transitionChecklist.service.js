const checklistRepository =
require("../repositories/transitionChecklist.repository");

class TransitionChecklistService {

    async initializeChecklist(transitionId) {

        const templates =
        await checklistRepository.getChecklistTemplates();

        for (const item of templates) {

            await checklistRepository.createChecklistItem({

                transition_id: transitionId,

                template_id: item.template_id

            });

        }

    }

    async getChecklist(transitionId) {

        return await checklistRepository.getChecklist(
            transitionId
        );

    }

    async updateChecklist(checklistId, userId, body) {

        return await checklistRepository.updateChecklist(

            checklistId,

            {

                status: body.status,

                remarks: body.remarks,

                completed_by: userId

            }

        );

    }

}

module.exports = new TransitionChecklistService();