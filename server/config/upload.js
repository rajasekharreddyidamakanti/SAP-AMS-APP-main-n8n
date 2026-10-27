// const env = require("./env");

// module.exports = {
//     PATH: env.UPLOAD_PATH || "uploads"
// };


// Added for Testing

const path = require("path");
const env = require("./env");

// Always resolve to an absolute path anchored inside /server, regardless of
// which directory the process was launched from. This must be the single
// source of truth used by both the static file server (index.js) and every
// route that writes uploaded files (e.g. adminCertifications.routes.js) —
// otherwise uploads get saved to one folder and served from another,
// producing "Cannot GET /uploads/..." even though the file exists on disk.
module.exports = {
    PATH: path.isAbsolute(env.UPLOAD_PATH || "")
        ? env.UPLOAD_PATH
        : path.join(__dirname, "..", env.UPLOAD_PATH || "uploads")
};