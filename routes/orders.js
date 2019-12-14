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
const ordersController = require(path.join(
	__dirname,
	"..",
	"controllers",
	"ordersController.js"
));

const router = express.Router();

//* GET /orders/invoice/:orderId PRIVATE
router.get("/:orderId/invoice", isAuth, ordersController.getOrderInvoice);

//* GET /orders/checkout PRIVATE
//* Desc: Order review page
router.get("/checkout", isAuth, ordersController.getCheckoutOrder);

//* GET /orders/:orderId PRIVATE
router.get("/:orderId", isAuth, ordersController.getOrderDetails);

//* GET /orders PRIVATE
router.get("/", isAuth, ordersController.getAllUserOrders);

//* POST /orders/checkout PRIVATE
router.post("/checkout", isAuth, ordersController.postCheckoutOrder);

//* PATCH /orders/updateOrderStatus/:orderId PRIVATE
router.patch(
	"/:orderId/updateOrderStatus",
	customValidators.updateOrderStatusValidator,
	isAuth,
	ordersController.updateOrderStatus
);

module.exports = router;
