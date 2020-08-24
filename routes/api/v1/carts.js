"use strict";
const path = require("path");

const express = require("express");

const customValidators = require(path.join(
	__dirname,
	"..",
	"..",
	"..",
	"customMiddlewares",
	"api",
	"v1",
	"validators.js"
));
const isAuth = require(path.join(
	__dirname,
	"..",
	"..",
	"..",
	"customMiddlewares",
	"api",
	"v1",
	"isAuth.js"
));
const cartsController = require(path.join(
	__dirname,
	"..",
	"..",
	"..",
	"controllers",
	"api",
	"v1",
	"cartsController.js"
));

const router = express.Router();

//* GET /api/v1/carts PRIVATE
router.get("/", isAuth, cartsController.getCart);

//* POST /api/v1/carts PRIVATE
router.post("/", isAuth, cartsController.addToCart);

//* PATCH /api/v1/carts PRIVATE
router.patch(
	"/",
	customValidators.updateCartValidator,
	isAuth,
	cartsController.updateCart
);

module.exports = router;
