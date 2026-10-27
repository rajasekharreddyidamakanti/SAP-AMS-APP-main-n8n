//server/index.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const appConfig = require("./config/appConfig");
const uploadConfig = require("./config/upload");
const errorMiddleware = require("./middleware/error.middleware");
const logger = require("./utils/logger");
require("./jobs/deadline.job");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(uploadConfig.PATH));
app.use("/api", routes);
app.use(errorMiddleware);

app.listen(appConfig.PORT, () => {
    logger.success(`Server running on port ${appConfig.PORT}`);
});