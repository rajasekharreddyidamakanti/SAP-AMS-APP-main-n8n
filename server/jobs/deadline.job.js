const cron = require("node-cron");

const deadlineService =
    require("../services/deadline.service");

cron.schedule("*/1 * * * *", async () => {

    console.log("Checking expired expert requests...");

    try {

        await deadlineService.processExpiredRequests();

    } catch (error) {

        console.error("Deadline Job Error:", error);

    }

});