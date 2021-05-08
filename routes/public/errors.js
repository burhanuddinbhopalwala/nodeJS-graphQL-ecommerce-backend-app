"use strict";
const path = require("path");

const express = require("express");

const errorController = require(path.join(
    __dirname,
    "..",
    "..",
    "controllers",
    "errorsController.js"
));

const router = express.Router();

router.use(errorController.throwError);

router.use(errorController.throw404);

module.exports = router;
