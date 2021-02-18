"use strict";

/**
 * @swagger
 *  components:
 *    schemas:
 *      Product:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          sku:
 *            type: string
 *            minLength: 10
 *            maxLength: 10
 *            description: Skock Keeping Unit (SKU)
 *          title:
 *            type: string
 *            minLength: 5
 *            maxLength: 50
 *          description:
 *            type: string
 *          price:
 *            type: number
 *            minimum: 0.0
 *            maximum: 9999999999
 *          discountedPrice:
 *            type: number
 *            minimum: 0.0
 *            maximum: 9999999999
 *          imageUrl:
 *            type: string
 *            format: uri
 *          creatorId:
 *            type: integer
 *          deletedAt:
 *            type: string
 *            format: date-time
 *          updatedAt:
 *            type: string
 *            format: date-time
 *        required:
 *          - sku
 *          - title
 *          - price
 *          - imageUrl
 *        example:
 *           id: 1234567
 *           sku: SKU1234567
 *           title: A demo product
 *           desciption: A demo product description
 *           price: 99.50
 *           discountedPrice: 59.50
 *           imageUrl: https://demo-product.html
 *           creatorId: 1
 *           deletedAt: 2020-01-20T20:20:20
 *           updatedAt: 2020-01-20T20:20:20
 */
module.exports = function(sequelize, DataTypes) {
	const Product = sequelize.define(
		"product",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			sku: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
				validate: {
					isUppercase: {
						args: true,
						msg: "SKU invalid, must be uppecase!"
					},
					isAlphanumeric: {
						args: true,
						msg: "SKU invalid, must be alphanumeric!"
					},
					len: {
						args: [10],
						msg: "SKU invalid, must be of length 10!"
					}
				}
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: {
						args: [5, 50],
						msg: "Title must be of length between 5 to 25!"
					}
				}
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
				defaultValue: "No description provided!"
			},
			price: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0.0,
				validate: {
					min: { args: [0.0], msg: "Minimum price >= 0.0" },
					max: {
						args: [9999999999],
						msg: "Maximum price <= 9999999999"
					}
				}
			},
			discountedPrice: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true,
				defaultValue: 0.0,
				validate: {
					min: { args: [0.0], msg: "Minimum discountedPrice >= 0.0" },
					max: {
						args: [9999999999],
						msg: "Maximum discountedPrice <= 9999999999"
					}
				}
			},
			imageUrl: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					isUrl: { args: true, msg: "imageUrl invalid format!" }
				}
			}
		},
		{
			timestamps: true,
			paranoid: true,
			tableName: "products",
			validate: {},
			indexes: [],
			defaultScope: {
				attributes: {
					exclude: ["createdAt", "updatedAt", "deletedAt"]
				}
			},
			scopes: {},
			classMethods: {
				associate: function(models) {
					Product.belongsTo(models.user, { as: "creator" });

					Product.belongsToMany(models.cart, {
						through: "cartProduct"
					});

					Product.belongsToMany(models.order, {
						through: "orderProduct"
					});
				}
			},
			instanceMethods: {},
			hooks: {}
		}
	);
	return Product;
};
