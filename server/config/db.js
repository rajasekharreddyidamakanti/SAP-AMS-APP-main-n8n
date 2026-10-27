const { Pool } = require("pg");
const env = require("./env");

const password = env.DB.PASSWORD;

if (password !== undefined && typeof password !== "string") {
    throw new Error("Postgres password must be a string. Check DB_PASSWORD in your environment or .env file.");
}

const pool = new Pool({
    user: env.DB.USER,
    host: env.DB.HOST,
    database: env.DB.NAME,
    password: password === undefined ? undefined : String(password),
    port: env.DB.PORT,
});

module.exports = pool;