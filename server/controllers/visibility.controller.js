const service = require("../services/visibility.service");

const setVisibility = async (req, res) => {

    try {

        const { articleId } = req.params;

        const { visibility, roles } = req.body;

        const result = await service.setVisibility(

            articleId,
            visibility,
            roles

        );

        res.json({

            message: "Visibility updated",

            article: result

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

const getVisibility = async (req, res) => {

    try {

        const { articleId } = req.params;

        const result = await service.getVisibility(articleId);

        res.json(result);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

module.exports = {

    setVisibility,
    getVisibility

};