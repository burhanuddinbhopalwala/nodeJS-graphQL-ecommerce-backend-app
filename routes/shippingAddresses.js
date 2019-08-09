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
const shippingAddressesController = require(path.join(
	__dirname,
	"..",
	"controllers",
	"shippingAddressesController.js"
));

//* GET /shippingAddresses
router.get(
	"/",
	isAuth,
	shippingAddressesController.getAllUserShippingAdressesDetails
);

//* POST /shippingAddresses PRIVATE
router.post(
	"/",
	customValidators.shippingAddressValidator,
	isAuth,
	shippingAddressesController.addShippingAddress
);

//* PUT /shippingAddresses/:shippingAddressId PRIVATE
router.put(
	"/:shippingAddressId",
	customValidators.shippingAddressValidator,
	isAuth,
	shippingAddressesController.updateShippingAddress
);

//* DELETE /shippingAddresses/:shippingAddressId PRIVATE
router.delete(
	"/:shippingAddressId",
	isAuth,
	shippingAddressesController.deleteShippingAddress
);

module.exports = router;
