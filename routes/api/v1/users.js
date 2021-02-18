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
const usersController = require(path.join(
	__dirname,
	"..",
	"..",
	"..",
	"controllers",
	"api",
	"v1",
	"usersController.js"
));

const router = express.Router();

//* GET /api/v1/users/get-user-details PRIVATE
router.get("/get-user-details", isAuth, usersController.getUserDetails);

//* GET /api/v1/users/products PRIVATE
router.get("/products", isAuth, usersController.getAllUserProductsDetails);

//* GET /api/v1/users/reset-password-verify/:resetToken
router.get(
	"/reset-password-verify/:resetToken",
	usersController.resetPasswordVerify
);

//* POST /api/v1/users/signup
router.post(
	"/signup",
	customValidators.signupValidator,
	usersController.signup
);

//* POST /api/v1/users/login
router.post("/login", customValidators.loginValidator, usersController.login);

//* PATCH /api/v1/users/reset-password
router.patch(
	"/reset-password",
	customValidators.resetPasswordValidator,
	usersController.resetPassword
);

//* PATCH /api/v1/users/reset-password-new
router.patch(
	"/reset-password-new",
	customValidators.resetPasswordNewValidator,
	usersController.resetPasswordNew
);

//* PATCH /api/v1/users/update-user-status PRIVATE
router.patch(
	"/update-user-status",
	customValidators.updateUserStatusValidator,
	isAuth,
	usersController.updateUserStatus
);

module.exports = router;
