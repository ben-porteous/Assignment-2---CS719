const express = require("express");
const router = express.Router();

router.use("/", require("./application-routes.js"));
router.use("/api", require("./api/api-routes.js"));

//this file shoudl have a list of all router locations 

module.exports = router;
