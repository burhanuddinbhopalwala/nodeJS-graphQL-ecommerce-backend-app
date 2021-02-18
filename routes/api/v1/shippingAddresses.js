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
const shippingAddressesController = require(path.join(
	__dirname,
	"..",
	"..",
	"..",
	"controllers",
	"api",
	"v1",
	"shippingAddressesController.js"
));

const router = express.Router();

//* GET /api/v1/shippingAddresses
router.get(
	"/",
	isAuth,
	shippingAddressesController.getAllUserShippingAdressesDetails
);

//* POST /api/v1/shippingAddresses PRIVATE
router.post(
	"/",
	customValidators.shippingAddressValidator,
	isAuth,
	shippingAddressesController.addShippingAddress
);

//* PUT /api/v1/shippingAddresses/:shippingAddressId PRIVATE
router.put(
	"/:shippingAddressId",
	customValidators.shippingAddressValidator,
	isAuth,
	shippingAddressesController.updateShippingAddress
);

//* DELETE /api/v1/shippingAddresses/:shippingAddressId PRIVATE
router.delete(
	"/:shippingAddressId",
	isAuth,
	shippingAddressesController.deleteShippingAddress
);

module.exports = router;
