"use strict";

const path = require("path");

const { validationResult } = require("express-validator/check");

const db = require(path.join(
    __dirname,
    "..",
    "..",
    "..",
    "models",
    "index.js"
));

const Product = db.product;
const cartProduct = db.cartProduct;

class CartsController {
    static async getCart(req, res, next) {
        try {
            const currentPage = +req.query.page || 1;
            const itemsPerPage = +process.env.PAGINATION_PER_PAGE;
            const cart = await req.user.getCart({
                include: [{ model: Product, duplicating: false }],
                order: [[Product, cartProduct, "addedOn", "DESC"]],
                offset: (currentPage - 1) * itemsPerPage,
                limit: itemsPerPage
            });
            if (!cart) {
                const error = new Error("Cart not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const totalProductsCount = cart.products.length;
            if (+totalProductsCount === 0) {
                const error = new Error("Product not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            //* Cannot send totalAmount here, as we are supporting pagination here
            const finalResult = {
                cart: cart,
                currentPage: currentPage,
                hasNextPage: itemsPerPage * currentPage < totalProductsCount,
                hasPreviousPage: currentPage > 1,
                nextPage: currentPage + 1,
                previousPage: currentPage - 1,
                lastPage: Math.ceil(totalProductsCount / itemsPerPage)
            };
            res.status(200).json({
                message: "Cart fetched!",
                data: finalResult
            });
            return;
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async addToCart(req, res, next) {
        try {
            const initialQuantity = 1;
            const productId = +req.body.productId;
            let cart = await req.user.getCart({
                include: [{ model: Product, duplicating: false }]
            });
            if (!cart) cart = await req.user.createCart();
            let cartProduct;
            if (cart.products) {
                cartProduct = cart.products.filter(
                    product => product.id === productId
                )[0];
            }
            if (!cartProduct) {
                const product = await Product.findByPk(productId);
                if (!product) {
                    const error = new Error("Product not found!");
                    error.httpStatusCode = 404;
                    throw error;
                }
                await cart.addProduct(product, {
                    through: { quantity: initialQuantity, addedOn: Date.now() }
                });
                //FIXME: Touch the cart here, below is not working
                // await cart.update({ updatedAt: Date.now() });
                await cart.reload();
                const cartProduct = cart.products.filter(
                    product => product.id === productId
                )[0];
                res.status(201).json({
                    message: "Cart product created!",
                    data: { product: cartProduct, cart: cart }
                });
                return;
            } else {
                await cart.reload();
                res.status(200).json({
                    message: "Already added to cart!",
                    data: { product: cartProduct, cart: cart }
                });
                return;
            }
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async updateCart(req, res, next) {
        try {
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                const error = new Error("Client invalid input!");
                error.httpStatusCode = 422;
                error.data = validationErrors.array();
                throw error;
            }
            const productId = +req.body.productId;
            const updatedQuantity = +req.body.updatedQuantity;
            const cart = await req.user.getCart({
                include: [{ model: Product, duplicating: false }]
            });
            if (!cart) {
                const error = new Error("cart not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const cartProduct = cart.products.filter(
                product => product.id === productId
            )[0];
            if (!cartProduct) {
                const error = new Error("cartProduct not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            if (updatedQuantity === 0) {
                //* Deletion case
                await cartProduct.cartProduct.destroy();
                //FIXME: Touch the cart here, below is not working
                // await cart.update({ updatedAt: Date.now() });
                await cart.reload();
                res.status(200).json({
                    message: "cartProduct deleted!",
                    data: { product: cartProduct, cart: cart }
                });
                return;
            } else {
                await cartProduct.cartProduct.update({
                    quantity: updatedQuantity
                });
                //FIXME: Touch the cart here, below is not working
                // await cart.update({ updatedAt: Date.now() });
                await cart.reload();
                res.status(200).json({
                    message: "cartProduct updated!",
                    data: { product: cartProduct, cart: cart }
                });
                return;
            }
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }
}

module.exports = CartsController;
