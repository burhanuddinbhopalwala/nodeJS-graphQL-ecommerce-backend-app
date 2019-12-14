"use strict";
const path = require("path");

const express = require("express");

const customValidators = require(path.join(
    __dirname,
    "..",
    "customMiddlewares",
    "validators.js"
));
const isAuth = require(path.join(
    __dirname,
    "..",
    "customMiddlewares",
    "isAuth.js"
));
const cartsController = require(path.join(
    __dirname,
    "..",
    "controllers",
    "cartsController.js"
));

const router = express.Router();

//* GET /carts PRIVATE
router.get("/", isAuth, cartsController.getCart);

//* POST /carts PRIVATE
router.post("/", isAuth, cartsController.addToCart);

//* PATCH /carts PRIVATE
router.patch(
    "/",
    customValidators.updateCartValidator,
    isAuth,
    cartsController.updateCart
);

module.exports = router;
