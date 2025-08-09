require("dotenv").config();
const ConfigManager = require("./config/ConfigManager");

const config = new ConfigManager();

module.exports = config;
