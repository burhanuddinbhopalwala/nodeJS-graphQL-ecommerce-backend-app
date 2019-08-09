"use strict";
const path = require("path");

const express = require("express");

const router = express.Router();

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
const productsController = require(path.join(
	__dirname,
	"..",
	"controllers",
	"productsController.js"
));

//* GET /products
router.get("/", productsController.getAllProducts);

//* POST /products PRIVATE
router.post(
	"/",
	customValidators.productValidator,
	isAuth,
	productsController.addProduct
);

//* PUT /products/:productId PRIVATE
router.put(
	"/:productId",
	customValidators.productValidator,
	isAuth,
	productsController.updateProduct
);

//* DELETE /products/:productId PRIVATE
router.delete("/:productId", isAuth, productsController.deleteProduct);

module.exports = router;
