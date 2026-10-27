const dashboardService = require("../services/dashboard.service");

const getStats = async (req, res) => {

    try {

        const stats =
            await dashboardService.getStats();

        res.status(200).json(stats);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    getStats
};