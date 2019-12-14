"use strict";
const path = require("path");

const validator = require("validator");
const db = require(path.join(__dirname, "..", "models", "index.js"));

const Product = db.product;

function productValidator(productInput) {
    const sku = productInput.sku;
    const title = productInput.title;
    const price = +productInput.price;
    const imageUrl = productInput.imageUrl;
    const validationErrors = [];
    if (!validator.isUppercase(sku))
        validationErrors.push({ message: "SKU invalid, must be uppecase!" });
    if (!validator.isAlphanumeric(sku))
        validationErrors.push({
            message: "SKU invalid, must be alphanumeric!"
        });
    if (!validator.isLength(sku, { min: 10, max: 10 }))
        validationErrors.push({
            message: "SKU invalid, must be of length 10!"
        });
    //FIXME: Not working here, sku check
    // validator.custom(async (value, { req }) => {
    //   const product = await Product.findOne({ where: { sku: value } });
    //   if (product) return Promise.reject("SKU already exist!");
    // });
    if (
        !validator.trim(title) ||
        !validator.isLength(title, { min: 5, max: 50 })
    )
        validationErrors.push({ message: "Title is invalid!" });
    if (!validator.isDecimal(price.toString()))
        validationErrors.push({ message: "Price is invalid!" });
    if (!validator.isURL(imageUrl))
        validationErrors.push({ message: "imageUrl is invalid!" });
    if (validationErrors.length > 0) {
        const error = new Error("Invalid client input!");
        error.data = validationErrors;
        error.httpStatusCode = 422;
        throw error;
    }
}

module.exports = {
    getAllProducts: async function({ page }, req) {
        try {
            const currentPage = page || 1;
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
            return {
                message: "Products fetched!",
                data: {
                    products: products,
                    currentPage: currentPage,
                    hasNextPage:
                        itemsPerPage * currentPage < totalProductsCount,
                    hasPreviousPage: currentPage > 1,
                    nextPage: currentPage + 1,
                    previousPage: currentPage - 1,
                    lastPage: Math.ceil(totalProductsCount / itemsPerPage)
                }
            };
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            throw error;
        }
    },

    addProduct: async function({ productInput }, req) {
        try {
            productValidator(productInput);
            if (!req.user.isAdmin) {
                const error = new Error("Not authorized!");
                error.httpStatusCode = 403;
                throw error;
            }
            const sku = productInput.sku;
            const title = productInput.title;
            const price = +productInput.price;
            const imageUrl = productInput.imageUrl;
            const newProduct = await req.user.createProduct({
                sku: sku,
                title: title,
                price: price,
                imageUrl: imageUrl
            });
            return {
                message: "Product created!",
                data: { product: { ...newProduct.dataValues } } //* With deletedAt set now
            };
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            throw error;
        }
    },

    updateProduct: async function({ productId, productInput }, req) {
        try {
            productValidator(productInput);
            if (!req.user.isAdmin) {
                const error = new Error("Not authorized!");
                error.httpStatusCode = 403;
                throw error;
            }
            const product = await Product.findByPk(productId);
            if (!product) {
                const error = new Error("Product not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const productCreator = await product.getCreator(); //* id comparison, also OK
            if (JSON.stringify(productCreator) !== JSON.stringify(req.user)) {
                const error = new Error("Not authorized!");
                error.httpStatusCode = 403;
                throw error;
            }
            const updatedProduct = await product.update({
                sku: productInput.sku,
                title: productInput.title,
                price: +productInput.price,
                imageUrl: productInput.imageUrl
            });
            return {
                message: "Product updated!",
                data: { product: { ...updatedProduct.dataValues } }
            };
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            throw error;
        }
    },

    deleteProduct: async function({ productId }, req) {
        try {
            if (!req.user.isAdmin) {
                const error = new Error("Not authorized!");
                error.httpStatusCode = 403;
                throw error;
            }
            const products = await req.user.getProducts({
                where: { id: productId }
            });
            if (!products || !(products.length > 0)) {
                const error = new Error("Product not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const product = products[0];
            const destroyedProduct = await product.destroy();
            return {
                message: "Product destroyed!",
                data: { product: { ...destroyedProduct.dataValues } } //* With deletedAt set now
            };
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            throw error;
        }
    }
};
