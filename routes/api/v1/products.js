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
const productsController = require(path.join(
	__dirname,
	"..",
	"..",
	"..",
	"controllers",
	"api",
	"v1",
	"productsController.js"
));

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [products]
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
 *                    example: Products fetched!
 *                  data:
 *                    type: object
 *                    properties:
 *                      products:
 *                        type: array
 *                        $ref: "#/components/schemas/Product"
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
 *       401:
 *         $ref: "#/components/schemas/Response401"
 *       403:
 *         $ref: "#/components/schemas/Response403"
 *       404:
 *         $ref: "#/components/schemas/Response404"
 *       413:
 *         $ref: "#/components/schemas/Response413"
 *       422:
 *         $ref: "#/components/schemas/Response422"
 *       429:
 *         $ref: "#/components/schemas/Response429"
 *       Else:
 *         $ref: "#/components/schemas/ResponseElse"
 */
//* GET /api/v1/products
router.get("/", productsController.getAllProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [products]
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
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product created!
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: "#/components/schemas/Product"
 *       401:
 *         $ref: "#/components/schemas/Response401"
 *       403:
 *         $ref: "#/components/schemas/Response403"
 *       404:
 *         $ref: "#/components/schemas/Response404"
 *       413:
 *         $ref: "#/components/schemas/Response413"
 *       422:
 *         $ref: "#/components/schemas/Response422"
 *       429:
 *         $ref: "#/components/schemas/Response429"
 *       Else:
 *         $ref: "#/components/schemas/ResponseElse"
 */
//* POST /api/v1/products PRIVATE
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
 *     tags: [products]
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
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product updated!
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: "#/components/schemas/Product"
 *       401:
 *         $ref: "#/components/schemas/Response401"
 *       403:
 *         $ref: "#/components/schemas/Response403"
 *       404:
 *         $ref: "#/components/schemas/Response404"
 *       413:
 *         $ref: "#/components/schemas/Response413"
 *       422:
 *         $ref: "#/components/schemas/Response422"
 *       429:
 *         $ref: "#/components/schemas/Response429"
 *       Else:
 *         $ref: "#/components/schemas/ResponseElse"
 */
//* PUT /api/v1/products/:productId PRIVATE
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
 *     tags: [products]
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
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product destroyed!
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: "#/components/schemas/Product"
 *       401:
 *         $ref: "#/components/schemas/Response401"
 *       403:
 *         $ref: "#/components/schemas/Response403"
 *       404:
 *         $ref: "#/components/schemas/Response404"
 *       413:
 *         $ref: "#/components/schemas/Response413"
 *       422:
 *         $ref: "#/components/schemas/Response422"
 *       429:
 *         $ref: "#/components/schemas/Response429"
 *       Else:
 *         $ref: "#/components/schemas/ResponseElse"
 */
//* DELETE /api/v1/products/:productId PRIVATE
router.delete("/:productId", isAuth, productsController.deleteProduct);

module.exports = router;
