module.exports = {

    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },

    UPLOAD: {
        MAX_FILE_SIZE: 20 * 1024 * 1024, // 20 MB
        ALLOWED_TYPES: [
            // Documents
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            // Images
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/gif",
            "image/svg+xml",
            "image/webp",
            // Text / Code
            "text/plain",
            "text/html",
            "text/css",
            "text/csv",
            "text/markdown",
            "text/x-python",
            "text/x-java-source",
            "text/x-csrc",
            "text/x-c++src",
            "text/javascript",
            "application/javascript",
            "application/json",
            "application/xml",
            "text/xml",
            // Archives
            "application/zip",
            "application/x-zip-compressed",
            "application/x-tar",
            "application/gzip",
            // Markdown (some browsers report octet-stream)
            "application/octet-stream"
        ]
    },

    JWT: {
        PREFIX: "Bearer"
    }

};