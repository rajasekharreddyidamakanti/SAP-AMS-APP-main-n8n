const notificationService =
    require("../services/notification.service");

const MESSAGES =
    require("../constants/messages");

class NotificationController {

    async createNotification(req, res, next) {

        try {

            const notification =
                await notificationService.createNotification(req.body);

            res.status(201).json({

                success: true,

                message: MESSAGES.NOTIFICATION.CREATED,

                data: notification

            });

        } catch (error) {

            next(error);

        }

    }

    async getNotifications(req, res, next) {

        try {

            const notifications =
                await notificationService.getNotifications(
                    req.user.userId
                );

            res.json({

                success: true,

                data: notifications

            });

        } catch (error) {

            next(error);

        }

    }

    async markAsRead(req, res, next) {

        try {

            const notification =
                await notificationService.markAsRead(
                    req.params.id,
                    req.user.userId
                );

            res.json({

                success: true,

                message: MESSAGES.NOTIFICATION.READ,

                data: notification

            });

        } catch (error) {

            next(error);

        }

    }

    async markAllAsRead(req, res, next) {

        try {

            await notificationService.markAllAsRead(
                req.user.userId
            );

            res.json({

                success: true,

                message: MESSAGES.NOTIFICATION.READ_ALL

            });

        } catch (error) {

            next(error);

        }

    }

}

module.exports = new NotificationController();