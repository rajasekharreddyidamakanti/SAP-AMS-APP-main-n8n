const transitionRepository =
    require("../repositories/transition.repository");
const notificationService = require("./notification.service");

class TransitionService {

    assertTaskAdmin(user) {
        const roles = Array.isArray(user?.roles) ? user.roles : [];
        if (!roles.some((role) => String(role).toLowerCase() === "admin")) {
            throw { status: 403, message: "Only administrators can manage transition tasks." };
        }
    }

    
    async createTransition(data, userId) {

        const transition =
            await transitionRepository.createTransition({

                from_user_id: data.from_user_id,
                to_user_id: data.to_user_id,
                sap_module: data.sap_module,
                start_date: data.start_date && data.start_date.trim() !== "" ? data.start_date : null,
                target_completion_date: data.target_completion_date && data.target_completion_date.trim() !== "" ? data.target_completion_date : null,
                remarks: data.remarks,
                created_by: userId

            });
        // await transitionRepository.createDefaultTasks(
        //     transition.transition_id
        // );

        // Added for testing the data

        await transitionRepository.createDefaultTasks(
            transition.transition_id,
            transition.from_user_id,
            transition.to_user_id,
            transition.start_date
        );

        return transition;
    }

    async getAllTransitions() {

        return await transitionRepository.getAllTransitions();

    }
    
    // Added for Testing the data
    
    async getMyTransitions(userId) {

        return await transitionRepository.getMyTransitions(userId);

    }

    async deleteTransition(id) {

        return await transitionRepository.deleteTransition(id);

    }

    // 
    async getTransitionById(id) {

        const transition =
            await transitionRepository.getTransitionById(id);

        if (!transition) {

            throw {
                status: 404,
                message: "Transition not found"
            };

        }

        return transition;
    }


        async deleteTransition(id) {

        const transition =
            await transitionRepository.getTransitionById(id);

        if (!transition) {

            throw {
                status: 404,
                message: "Transition not found"
            };

        }

        return await transitionRepository.deleteTransition(id);

    }
    async getTasks(transitionId) {

        const transition =
            await transitionRepository.getTransitionById(
                transitionId
            );

        if (!transition) {

            throw {
                status: 404,
                message: "Transition not found"
            };

        }

        return await transitionRepository.getTasks(
            transitionId
        );
    }

    async updateTaskStatus(taskId, status, userId, signOffNotes) {

        const existingTask =
            await transitionRepository.getTaskById(taskId);

        if (!existingTask) {

            throw {
                statusCode: 404,
                message: "Task not found"
            };

        }

        // Dependency gate: can't move past "pending" until the
        // task it depends on is completed.
        const movingForward =
            status === "in_progress" || status === "completed";

        if (
            movingForward &&
            existingTask.depends_on_task_id &&
            existingTask.depends_on_status !== "completed"
        ) {

            throw {
                statusCode: 400,
                message: `Complete "${existingTask.depends_on_title}" before starting this task.`
            };

        }

        const task =
            await transitionRepository.updateTaskStatus(
                taskId,
                status,
                userId,
                signOffNotes
            );

        await transitionRepository.syncTransitionStatus(existingTask.transition_id);

        if (status === "completed") {
            const dependents = await transitionRepository.getDependentTasks(taskId);
            for (const dependent of dependents) {
                if (!dependent.assigned_to) continue;
                await notificationService.createNotification({
                    user_id: dependent.assigned_to,
                    type: "task_unlocked",
                    title: "Task unlocked",
                    message: `"${dependent.title}" is now ready to start.`,
                    reference_type: "transition_task",
                    reference_id: dependent.task_id
                });
            }
        }

        return task;
    }

    async createTask(transitionId, data, user) {
        this.assertTaskAdmin(user);
        const transition = await this.getTransitionById(transitionId);
        if (!data.title?.trim() || !data.phase_id) {
            throw { status: 400, message: "Task title and phase are required." };
        }
        if (data.depends_on_task_id) {
            const dependency = await transitionRepository.getTaskById(data.depends_on_task_id);
            if (!dependency || dependency.transition_id !== transition.transition_id) {
                throw { status: 400, message: "Dependency must belong to this transition." };
            }
        }
        return transitionRepository.createTask({
            ...data,
            transition_id: transitionId,
            title: data.title.trim()
        });
    }

    async updateTaskDetails(taskId, data, user) {
        this.assertTaskAdmin(user);
        const existingTask = await transitionRepository.getTaskById(taskId);
        if (!existingTask) throw { status: 404, message: "Task not found" };
        if (!data.title?.trim() || !data.phase_id) {
            throw { status: 400, message: "Task title and phase are required." };
        }
        if (String(data.depends_on_task_id || "") === String(taskId)) {
            throw { status: 400, message: "A task cannot depend on itself." };
        }
        if (data.depends_on_task_id) {
            const dependency = await transitionRepository.getTaskById(data.depends_on_task_id);
            if (!dependency || dependency.transition_id !== existingTask.transition_id) {
                throw { status: 400, message: "Dependency must belong to this transition." };
            }
            if (await transitionRepository.wouldCreateDependencyCycle(taskId, data.depends_on_task_id)) {
                throw { status: 400, message: "This dependency would create a circular task dependency." };
            }
        }
        return transitionRepository.updateTaskDetails(taskId, {
            ...data,
            title: data.title.trim()
        });
    }

    async deleteTask(taskId, user) {
        this.assertTaskAdmin(user);
        const task = await transitionRepository.getTaskById(taskId);
        if (!task) throw { status: 404, message: "Task not found" };
        const dependents = await transitionRepository.getDependentTasks(taskId);
        if (dependents.length > 0) {
            throw { status: 409, message: "Cannot delete a task that other tasks depend on." };
        }
        return transitionRepository.deleteTask(taskId);
    }

    async getPhaseProgress(transitionId) {

        const transition =
            await transitionRepository.getTransitionById(
                transitionId
            );

        if (!transition) {

            throw {
                statusCode: 404,
                message: "Transition not found"
            };

        }

        return await transitionRepository.getPhaseProgress(
            transitionId
        );
    }

}

module.exports = new TransitionService();