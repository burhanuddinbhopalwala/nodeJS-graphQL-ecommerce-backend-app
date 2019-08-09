"use strict";
const path = require("path");
const crypto = require("crypto");

const { validationResult } = require("express-validator/check");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const nodemailerSendgridTransporter = require("nodemailer-sendgrid-transport");

const db = require(path.join(__dirname, "..", "models", "index.js"));

const { Op } = db.Sequelize;
const User = db.user;

const emailTransporter = nodemailer.createTransport(
	nodemailerSendgridTransporter({
		auth: { api_key: process.env.SENDGRID_API_KEY }
	})
);

class UsersController {
	static async getUserDetails(req, res, next) {
		try {
			const user = {
				username: req.user.username,
				email: req.user.email,
				password: req.user.status
			};
			res.status(200).json({
				message: "User fetched!",
				data: { user: user }
			});
			return;
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}

	static async getAllUserProductsDetails(req, res, next) {
		try {
			const currentPage = +req.query.page || 1;
			const itemsPerPage = +process.env.PAGINATION_PER_PAGE;
			const totalUserProductsCount = await req.user.countProducts();
			if (+totalUserProductsCount === 0) {
				const error = new Error("Product not found!");
				error.httpStatusCode = 404;
				throw error;
			}
			const userProducts = await req.user.getProducts({
				order: [["createdAt", "DESC"]],
				offset: (currentPage - 1) * itemsPerPage,
				limit: itemsPerPage
			});
			if (!userProducts || !(userProducts.length > 0)) {
				const error = new Error("Product not found!");
				error.httpStatusCode = 404;
				throw error;
			}
			const finalResult = {
				products: userProducts,
				currentPage: currentPage,
				hasNextPage:
					itemsPerPage * currentPage < totalUserProductsCount,
				hasPreviousPage: currentPage > 1,
				nextPage: currentPage + 1,
				previousPage: currentPage - 1,
				lastPage: Math.ceil(totalUserProductsCount / itemsPerPage)
			};
			res.status(200).json({
				message: "Products fetched!",
				data: finalResult
			});
			return;
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}

	static async signup(req, res, next) {
		try {
			const validationErrors = validationResult(req);
			if (!validationErrors.isEmpty()) {
				const error = new Error("Client invalid input!");
				error.httpStatusCode = 422;
				error.data = validationErrors.array();
				throw error;
			}
			//* With 12 salting rounds/ strength
			const hashedPassword = await bcryptjs.hash(req.body.password, 12);
			const newUser = await User.create({
				username: req.body.username,
				email: req.body.email,
				password: hashedPassword,
				isAdmin: req.body.isAdmin || false
			});
			res.status(201).json({
				message: "User created!",
				data: { user: newUser }
			});
			//* Async hence sent the response already
			return emailTransporter.sendMail({
				from: process.env.SYSTEM_EMAIL_ID,
				to: newUser.email,
				subject: "Yah! signup succeeded!",
				html: `<h1>Welcome ${newUser.username}</h1>`
			});
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}

	static async login(req, res, next) {
		try {
			const validationErrors = validationResult(req);
			if (!validationErrors.isEmpty()) {
				const error = new Error("Client invalid input!");
				error.httpStatusCode = 422;
				error.data = validationErrors.array();
				throw error;
			}
			const email = req.body.email;
			const password = req.body.password;
			const user = await User.findOne({ where: { email: email } });
			if (!user) {
				const error = new Error("Email not found!");
				error.httpStatusCode = 401;
				throw error;
			}
			const isPasswordMatch = await bcryptjs.compare(
				password,
				user.password
			);
			if (!isPasswordMatch) {
				const error = new Error("Wrong password!");
				error.httpStatusCode = 401;
				throw error;
			}
			const jwtToken = jwt.sign(
				{ userId: +user.id },
				new Buffer(process.env.JWT_PRIVATE_KEY, "base64").toString(
					"utf-8"
				),
				{ expiresIn: "72h" }
			);
			res.status(200).json({
				message: "Logged in!",
				data: {
					user: user,
					jwtToken: jwtToken
				}
			});
			return;
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}

	//* Resetting password functionality
	static async resetPassword(req, res, next) {
		try {
			const validationErrors = validationResult(req);
			if (!validationErrors.isEmpty()) {
				const error = new Error("Client invalid input!");
				error.httpStatusCode = 422;
				error.data = validationErrors.array();
				throw error;
			}
			const token = await crypto.randomBytes(32);
			const hexToken = token.toString("hex");
			const user = await User.findOne({
				where: { email: req.body.email }
			});
			if (!user) {
				const error = new Error("User not found!");
				error.httpStatusCode = 404;
				throw error;
			}
			const updatedUser = await user.update({
				resetToken: hexToken,
				resetTokenExpiration: Date.now() + 3600 * 1000
			}); //* For 1h
			res.status(200).json({
				message: "Reset password request processed successfully!",
				data: { user: updatedUser }
			});
			//* Async hence sent the response already
			return emailTransporter.sendMail({
				from: process.env.SYSTEM_EMAIL_ID,
				to: updatedUser.email,
				subject: "Passoword reset link!",
				html: `<p>You requested a password reset.</p></br>
        		<p>Please click this link: <a href="${
					process.env.URL
				}/users/resetPasswordVerify/${
					updatedUser.resetToken
				}">link</a> to reset the password. This link will expire in 1 hour.</p>`
			});
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}

	static async resetPasswordVerify(req, res, next) {
		try {
			const resetToken = req.params.resetToken;
			const user = await User.findOne({
				where: {
					resetToken: resetToken,
					resetTokenExpiration: {
						[Op.gte]: Date.now()
					}
				}
			});
			if (!user) {
				const error = new Error("User not found!");
				error.httpStatusCode = 404;
				throw error;
			}
			res.status(200).json({
				message: "Reset password verified!",
				data: { user: user }
			});
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}

	static async resetPasswordNew(req, res, next) {
		try {
			const validationErrors = validationResult(req);
			if (!validationErrors.isEmpty()) {
				const error = new Error("Client invalid input!");
				error.httpStatusCode = 422;
				error.data = validationErrors.array();
				throw error;
			}
			const user = await User.findOne({
				where: {
					id: +req.body.userId,
					resetToken: req.body.resetToken,
					resetTokenExpiration: {
						[Op.gte]: Date.now()
					}
				}
			});
			if (!user) {
				const error = new Error("User not found!");
				error.httpStatusCode = 404;
				throw error;
			}
			const newHashedPassword = await bcryptjs.hash(
				req.body.newPassword,
				12 //* With 12 salting rounds/ strength
			);
			const updatedUser = await user.update({
				password: newHashedPassword,
				resetToken: undefined,
				resetTokenExpiration: undefined
			});
			res.status(200).json({
				message: "User password updated!",
				data: { user: { updatedUser } }
			});
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}

	static async updateUserStatus(req, res, next) {
		try {
			const validationErrors = validationResult(req);
			if (!validationErrors.isEmpty()) {
				const error = new Error("Client invalid input!");
				error.httpStatusCode = 422;
				error.data = validationErrors.array();
				throw error;
			}
			const updatedUser = await req.user.update({
				status: req.body.status
			});
			res.status(200).json({
				message: "User updated!",
				data: { user: { updatedUser } }
			});
			return;
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}
}

module.exports = UsersController;
