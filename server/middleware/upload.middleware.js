const multer = require("multer");

const uploadConfig = require("../config/upload");
const CONSTANTS = require("../config/constants");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadConfig.PATH);
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {

    if (CONSTANTS.UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"), false);
    }

};

const upload = multer({
    storage,
    limits: {
        fileSize: CONSTANTS.UPLOAD.MAX_FILE_SIZE
    },
    fileFilter
});

module.exports = upload;