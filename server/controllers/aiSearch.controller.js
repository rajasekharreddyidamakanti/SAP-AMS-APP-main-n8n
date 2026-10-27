const aiSearchService =
    require("../services/aiSearch.service");

const search = async (req, res) => {

    try {

        const { query } = req.body;

        if (!query) {

            return res.status(400).json({
                message: "Query is required."
            });

        }

        const result =
            await aiSearchService.search(
                query,
                req.user.userId
            );

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(error.status || 500).json({
            message: error.message || "Internal Server Error"
        });

    }

};

module.exports = {
    search
};