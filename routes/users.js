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
const usersController = require(path.join(
    __dirname,
    "..",
    "controllers",
    "usersController.js"
));

const router = express.Router();

//* GET /users/getUserDetails PRIVATE
router.get("/getUserDetails", isAuth, usersController.getUserDetails);

//* GET /users/products PRIVATE
//* Desc: All the products created by the user
router.get(
    "/getAllUserProductsDetails",
    isAuth,
    usersController.getAllUserProductsDetails
);

//* POST /users/signup
router.post(
    "/signup",
    customValidators.signupValidator,
    usersController.signup
);

//* POST /users/login
router.post("/login", customValidators.loginValidator, usersController.login);

//* PATCH /users/resetPassword
router.patch(
    "/resetPassword",
    customValidators.resetPasswordValidator,
    usersController.resetPassword
);

//* GET /users/resetPasswordVerify/:resetToken
router.get(
    "/resetPasswordVerify/:resetToken",
    usersController.resetPasswordVerify
);

//* PATCH /users/resetPasswordNew
router.patch(
    "/resetPasswordNew",
    customValidators.resetPasswordNewValidator,
    usersController.resetPasswordNew
);

//* PATCH /users/updateUserStatus PRIVATE
router.patch(
    "/updateUserStatus",
    customValidators.updateUserStatusValidator,
    isAuth,
    usersController.updateUserStatus
);

module.exports = router;
