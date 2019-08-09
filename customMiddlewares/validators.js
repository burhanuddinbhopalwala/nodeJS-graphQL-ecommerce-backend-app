"use strict";
const path = require("path");

const { check } = require("express-validator/check");

const db = require(path.join(__dirname, "..", "models", "index.js"));

const User = db.user;
const Product = db.product;

//* https://flaviocopes.com/express-validate-input/
module.exports.signupValidator = [
	check("username")
		.trim()
		.isLength({ min: 5, max: 25 })
		.withMessage("Username must be of length between 5 to 25 characters!"),
	check("email")
		.isEmail()
		.withMessage("Email invalid!")
		.custom(async (value, { req }) => {
			const user = await User.findOne({ where: { email: value } });
			if (user) return Promise.reject("Email address already exist!");
		})
		.normalizeEmail(), //* Sanitizer
	check("password")
		.trim()
		.isLength({ min: 5, max: 25 })
		.withMessage("Password must be of length between 5 to 25!"),
	check("passwordConfirm")
		.trim()
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Password not matching!");
			}
			return true;
		}),
	check("creditCard")
		.optional()
		.isCreditCard()
		.withMessage("Credit card number invalid!")
];

module.exports.loginValidator = [
	check("email")
		.isEmail()
		.withMessage("Email invalid!")
		.normalizeEmail(), //* Sanitizer
	check("password")
		.trim()
		.isLength({ min: 5, max: 25 })
		.withMessage("Password not valid!")
];

module.exports.resetPasswordValidator = [
	check("email")
		.isEmail()
		.withMessage("Email invalid!")
		.custom(async (value, { req }) => {
			const user = await User.findOne({ where: { email: value } });
			if (!user) return Promise.reject("Email address doen not exist!");
		})
		.normalizeEmail() //* Sanitizer
];

module.exports.resetPasswordNewValidator = [
	check("newPassword")
		.trim()
		.isLength({ min: 5, max: 25 })
		.withMessage("Password must be of length between 5 to 25!"),
	check("newPasswordConfirm")
		.trim()
		.custom((value, { req }) => {
			if (value !== req.body.newPassword) {
				throw new Error("Password not matching!");
			}
			return true;
		})
];

module.exports.updateUserStatusValidator = [
	check("status")
		.trim()
		.isBoolean()
		.withMessage("Status must be a boolean value!")
];

module.exports.productValidator = [
	check("sku")
		.isUppercase()
		.withMessage("SKU invalid, must be uppecase!")
		.isAlphanumeric()
		.withMessage("SKU invalid, must be alphanumeric!")
		.isLength({ min: 10, max: 10 })
		.withMessage("SKU invalid, must be of length 10!")
		.custom(async (value, { req }) => {
			const product = await Product.findOne({ where: { sku: value } });
			if (product) return Promise.reject("SKU already exist!");
		}),
	check("title")
		.trim()
		.isLength({ min: 5, max: 50 })
		.withMessage("Title must be of length between 5 to 50 characters!"),
	check("price")
		.isDecimal()
		.withMessage("Price must be in decimal!"),
	check("imageUrl")
		.isURL()
		.withMessage("Image URL invalid!")
];

module.exports.updateCartValidator = [
	check("updatedQuantity")
		.isInt({ min: 0, max: 10 })
		.withMessage("Quantity more than 10 not allowed per order!")
];

module.exports.updateOrderStatusValidator = [
	check("status")
		.isIn(["completed", "delivered", "cancelled"])
		.withMessage("Status invalid!")
];

module.exports.shippingAddressValidator = [
	check("fullname")
		.trim()
		.isLength({ min: 5, max: 25 })
		.withMessage("Fullname must be of length between 5 to 25!"),
	check("mobilePhone")
		.trim()
		.isLength({ min: 10, max: 10 })
		.withMessage("Mobile phone must be of length between 10 digits!"),
	check("address1")
		.trim()
		.isLength({ min: 5, max: 50 })
		.withMessage("Address1 must be of length between 5 to 50!"),
	check("landmark")
		.trim()
		.isLength({ min: 5, max: 50 })
		.withMessage("Landmark must be of length between 5 to 50!"),
	check("postalCode")
		.trim()
		//FIXME: isPostalCode() not working properly, find alternative
		// .isPostalCode(["IN", "US"])
		.withMessage("Postal code invalid!"),
	check("city")
		.trim()
		.isLength({ min: 5, max: 25 })
		.withMessage("City must be of length between 5 to 25!"),
	check("state")
		.isIn(["Madhya Pradesh", "Uttar Pradesh", "Washington", "Texas"])
		.withMessage("State invalid!"),
	check("country")
		.isIn(["IND", "USA"])
		.withMessage("Country invalid!"),
	check("type")
		.isIn(["home", "office", "other"])
		.withMessage("Type invalid!")
];
