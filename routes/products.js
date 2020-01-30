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
const productsController = require(path.join(
    __dirname,
    "..",
    "controllers",
    "productsController.js"
));

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: ["products"]
 *     name: /api/products
 *     summary: GET getAllProducts
 *     operationId: getAllProducts
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Products fetched!
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Products fetched!"
 *                  data:
 *                    type: object
 *                    properties:
 *                      products:
 *                        type: array
 *                        $ref: '#/components/schemas/Product'
 *                      currentPage:
 *                        type: integer
 *                        example: 1
 *                      hasNextPage:
 *                        type: boolean
 *                        example: true
 *                      hasPreviousPage:
 *                        type: boolean
 *                        example: false
 *                      nextPage:
 *                        type: integer
 *                        example: 2
 *                      previousPage:
 *                        type: integer
 *                        example: 0
 *                      lastPage:
 *                        type: integer
 *                        example: 5
 *       404:
 *         description: Route not found!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Route not found!
 *                 data:
 *                   type: object
 *                   properties: null
 *       Others:
 *         description: Errored!
 */
//* GET /products
router.get("/", productsController.getAllProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: ["products"]
 *     name: /api/products
 *     summary: POST addProduct
 *     operationId: addProduct
 *     security:
 *       - authHeader: []
 *     consumes:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               sku: SKU1234567
 *               title: A demo product
 *               price: 99.50
 *               imageUrl: https://demo-product.html
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Product created!
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Product created!"
 *                  data:
 *                    type: object
 *                    properties:
 *                      product:
 *                        $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthenticated!
 *       403:
 *         description: Unauthorized!
 *       404:
 *         description: Route not found!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Route not found!
 *                 data:
 *                   type: object
 *                   properties: null
 *       Others:
 *         description: Errored!
 */
//* POST /products PRIVATE
router.post(
    "/",
    customValidators.productValidator,
    isAuth,
    productsController.addProduct
);

/**
 * @swagger
 * /api/products/{productId}:
 *   put:
 *     tags: ["products"]
 *     name: /api/products/:productId
 *     summary: PUT updateProduct
 *     operationId: updateProduct
 *     security:
 *       - authHeader: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         description: productId
 *         required: true
 *         example: 1234567
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               sku: SKU1234567
 *               title: A demo product
 *               price: 99.50
 *               imageUrl: https://demo-product.html
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Product updated!
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Product updated!"
 *                  data:
 *                    type: object
 *                    properties:
 *                      product:
 *                        $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthenticated!
 *       403:
 *         description: Unauthorized!
 *       404:
 *         description: Route not found!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Route not found!
 *                 data:
 *                   type: object
 *                   properties: null
 *       Others:
 *         description: Errored!
 */
//* PUT /products/:productId PRIVATE
router.put(
    "/:productId",
    customValidators.productValidator,
    isAuth,
    productsController.updateProduct
);

/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     tags: ["products"]
 *     name: /api/products/:productId
 *     summary: DELETE deleteProduct
 *     operationId: deleteProduct
 *     security:
 *       - authHeader: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         description: productId
 *         required: true
 *         example: 1234567
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Product destroyed!
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Product destroyed!"
 *                  data:
 *                    type: object
 *                    properties:
 *                      product:
 *                        $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthenticated!
 *       403:
 *         description: Unauthorized!
 *       404:
 *         description: Route not found!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Route not found!
 *                 data:
 *                   type: object
 *                   properties: null
 *       Others:
 *         description: Errored!
 */
//* DELETE /products/:productId PRIVATE
router.delete("/:productId", isAuth, productsController.deleteProduct);

module.exports = router;
