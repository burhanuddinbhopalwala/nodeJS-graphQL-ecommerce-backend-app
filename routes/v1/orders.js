"use strict";
const path = require("path");

const express = require("express");

const customValidators = require(path.join(
    __dirname,
    "..",
    "..",
    "customMiddlewares",
    "v1",
    "validators.js"
));
const isAuth = require(path.join(
    __dirname,
    "..",
    "..",
    "customMiddlewares",
    "v1",
    "isAuth.js"
));
const ordersController = require(path.join(
    __dirname,
    "..",
    "..",
    "controllers",
    "v1",
    "ordersController.js"
));

const router = express.Router();

//* GET /api/v1/orders PRIVATE
router.get("/", isAuth, ordersController.getAllUserOrders);

//* GET /api/v1/orders/:orderId PRIVATE
router.get("/:orderId", isAuth, ordersController.getOrderDetails);

//* GET /api/v1/orders/invoice/:orderId PRIVATE
router.get("/invoice/:orderId", isAuth, ordersController.getOrderInvoice);

//* GET /api/v1/orders/checkout PRIVATE
router.get("/checkout", isAuth, ordersController.getCheckoutOrder);

//* POST /api/v1/orders/checkout PRIVATE
router.post("/checkout", isAuth, ordersController.postCheckoutOrder);

//* PATCH /orders/:orderId PRIVATE
router.patch(
    "/:orderId",
    customValidators.updateOrderStatusValidator,
    isAuth,
    ordersController.updateOrderStatus
);

module.exports = router;
