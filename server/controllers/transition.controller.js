const transitionService =
    require("../services/transition.service");

class TransitionController {

    async createTransition(req, res, next) {

        try {

            const transition =
                await transitionService.createTransition(

                    req.body,
                    req.user.userId

                );

            res.status(201).json({

                success: true,
                message: "Transition created successfully",
                data: transition

            });

        } catch (error) {

            next(error);

        }

    }

    async getAllTransitions(req, res, next) {

        try {

            const transitions =
                await transitionService.getAllTransitions();

            res.json({

                success: true,
                data: transitions

            });

        } catch (error) {

            next(error);

        }

    }

    // added for Testing the data
    
    async getMyTransitions(req, res, next) {

        try {

            const transitions =
                await transitionService.getMyTransitions(req.user.userId);

            res.json({ success: true, data: transitions });

        } catch (error) {

            next(error);

        }

    }

    async deleteTransition(req, res, next) {

        try {

            await transitionService.deleteTransition(req.params.id);

            res.json({ success: true, message: "Transition deleted." });

        } catch (error) {

            next(error);

        }

    }

    // 

    async getTransitionById(req, res, next) {

        try {

            const transition =
                await transitionService.getTransitionById(
                    req.params.id
                );

            res.json({

                success: true,
                data: transition

            });

        } catch (error) {

            next(error);

        }

    }


        async deleteTransition(req, res, next) {

        try {

            await transitionService.deleteTransition(
                req.params.id
            );

            res.json({

                success: true,
                message: "Transition deleted successfully"

            });

        } catch (error) {

            next(error);

        }

    }

    async getTasks(req, res, next) {

        try {

            const tasks =
                await transitionService.getTasks(
                    req.params.id
                );

            res.json({

                success: true,
                data: tasks

            });

        } catch (error) {

            next(error);

        }

    }

    async updateTaskStatus(req, res, next) {

        try {

            const task =
                await transitionService.updateTaskStatus(

                    req.params.taskId,
                    req.body.status,
                    req.user.userId,
                    req.body.sign_off_notes

                );

            res.json({

                success: true,
                message: "Task updated successfully",
                data: task

            });

        } catch (error) {

            next(error);

        }
    }

    async createTask(req, res, next) {
            try {
                const task = await transitionService.createTask(req.params.id, req.body, req.user);
                res.status(201).json({ success: true, data: task });
            } catch (error) {
                next(error);
            }
    }

    async updateTaskDetails(req, res, next) {
            try {
                const task = await transitionService.updateTaskDetails(req.params.taskId, req.body, req.user);
                res.json({ success: true, data: task });
            } catch (error) {
                next(error);
            }
    }

    async deleteTask(req, res, next) {
            try {
                await transitionService.deleteTask(req.params.taskId, req.user);
                res.json({ success: true, message: "Task deleted successfully" });
            } catch (error) {
                next(error);
            }
    }

    async getPhaseProgress(req, res, next) {

        try {

            const progress =
                await transitionService.getPhaseProgress(
                    req.params.id
                );

            res.json({

                success: true,
                data: progress

            });

        } catch (error) {

            next(error);

        }

    }

}

module.exports = new TransitionController();