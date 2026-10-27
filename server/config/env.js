const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", ".env");
const exampleEnvPath = path.resolve(__dirname, "..", ".env.example");

if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
} else if (fs.existsSync(exampleEnvPath)) {
    require("dotenv").config({ path: exampleEnvPath });
}

const dbPassword = process.env.DB_PASSWORD;

if (dbPassword !== undefined && typeof dbPassword !== "string") {
    throw new Error("DB_PASSWORD must be a string. Check your environment variables and .env file.");
}

module.exports = {
    NODE_ENV: process.env.NODE_ENV,

    PORT: process.env.PORT,

    CLIENT_URL: process.env.CLIENT_URL,

    DB: {
        HOST: process.env.DB_HOST,
        PORT: process.env.DB_PORT,
        NAME: process.env.DB_NAME,
        USER: process.env.DB_USER,
        PASSWORD: dbPassword === undefined ? undefined : String(dbPassword),
    },

    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    },

    UPLOAD: {
        PATH: process.env.UPLOAD_PATH,
        MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE),
    },

    LLM: {
        API: process.env.LLM_API,
        MODEL: process.env.LLM_MODEL,
    },

    EMAIL: {
        API: process.env.EMAIL_API,
    },

    NOTIFICATION: {
        API: process.env.NOTIFICATION_API,
    },

    LOG_LEVEL: process.env.LOG_LEVEL,
};