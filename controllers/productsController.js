"use strict";
const path = require("path");

const io = require("@pm2/io");
const { validationResult } = require("express-validator/check");

const db = require(path.join(__dirname, "..", "models", "index.js"));

const Product = db.product;

const getAllProductsMeter = io.meter({
	name: "/api/products-Meter-req/min",
	samples: 100, //* rate unit
	timeframe: 60 //* sec
});

class ProductsController {
	static async getAllProducts(req, res, next) {
		try {
			getAllProductsMeter.mark();
			const currentPage = +req.query.page || 1;
			const itemsPerPage = +process.env.PAGINATION_PER_PAGE;
			const totalProductsCount = await Product.count({
				distinct: true,
				col: "id" //* Default also
			});
			if (+totalProductsCount === 0) {
				const error = new Error("Product not found!");
				error.httpStatusCode = 404;
				throw error;
			}
			const products = await Product.findAll({
				order: [["updatedAt", "DESC"]],
				offset: (currentPage - 1) * itemsPerPage,
				limit: itemsPerPage
			});
			if (!products || !(products.length > 0)) {
				const error = new Error("Product not found!");
				error.httpStatusCode = 404;
				throw error;
			}
			const finalResult = {
				products: products,
				currentPage: currentPage,
				hasNextPage: itemsPerPage * currentPage < totalProductsCount,
				hasPreviousPage: currentPage > 1,
				nextPage: currentPage + 1,
				previousPage: currentPage - 1,
				lastPage: Math.ceil(totalProductsCount / itemsPerPage)
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

	static async addProduct(req, res, next) {
		try {
			const validationErrors = validationResult(req);
			if (!validationErrors.isEmpty()) {
				const error = new Error("Client invalid input!");
				error.httpStatusCode = 422;
				error.data = validationErrors.array();
				throw error;
			}
			if (!req.user.isAdmin) {
				const error = new Error("Not authorized!");
				error.httpStatusCode = 403;
				throw error;
			}
			const newProduct = await req.user.createProduct({
				sku: req.body.sku,
				title: req.body.title,
				price: +req.body.price,
				imageUrl: req.body.imageUrl
			});
			res.status(201).json({
				message: "Product created!",
				data: { product: newProduct }
			});
			return;
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}

	static async updateProduct(req, res, next) {
		try {
			const validationErrors = validationResult(req);
			if (!validationErrors.isEmpty()) {
				const error = new Error("Client invalid input!");
				error.httpStatusCode = 422;
				error.data = validationErrors.array();
				throw error;
			}
			if (!req.user.isAdmin) {
				const error = new Error("Not authorized!");
				error.httpStatusCode = 403;
				throw error;
			}
			const productId = +req.params.productId;
			const product = await Product.findByPk(productId);
			if (!product) {
				const error = new Error("Product not found!");
				error.httpStatusCode = 404;
				throw error;
			}
			const productCreator = await product.getCreator(); //* "id" comparison, also OK
			if (JSON.stringify(productCreator) !== JSON.stringify(req.user)) {
				const error = new Error("Not authorized!");
				error.httpStatusCode = 403;
				throw error;
			}
			await product.update({
				sku: req.body.sku,
				title: req.body.title,
				price: +req.body.price,
				imageUrl: req.body.imageUrl
			});
			res.status(200).json({
				message: "Product updated!",
				data: { product: product }
			});
			return;
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}

	static async deleteProduct(req, res, next) {
		try {
			if (!req.user.isAdmin) {
				const error = new Error("Not authorized!");
				error.httpStatusCode = 403;
				throw error;
			}
			const productId = +req.params.productId;
			const products = await req.user.getProducts({
				where: { id: productId }
			});
			if (!products || !(products.length > 0)) {
				const error = new Error("Product not found!");
				error.httpStatusCode = 404;
				throw error;
			}
			const product = products[0];
			await product.destroy();
			res.status(200).json({
				message: "Product destroyed!",
				data: { product: product }
			});
			return;
		} catch (error) {
			if (!error.httpStatusCode) error.httpStatusCode = 500;
			next(error);
		}
	}
}

module.exports = ProductsController;
