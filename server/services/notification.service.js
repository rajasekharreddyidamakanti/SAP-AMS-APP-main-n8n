const notificationRepository =
    require("../repositories/notification.repository");

class NotificationService {

    async createNotification(data){

        return await notificationRepository
            .createNotification(data);

    }

    async getNotifications(userId){

        return await notificationRepository
            .getNotifications(userId);

    }

    async markAsRead(notificationId,userId){

        return await notificationRepository
            .markAsRead(
                notificationId,
                userId
            );

    }

    async markAllAsRead(userId){

        await notificationRepository
            .markAllAsRead(userId);

    }

}

module.exports = new NotificationService();