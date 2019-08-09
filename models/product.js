"use strict";

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
				allowNull: false
			},
			discountedPrice: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true,
				defaultValue: 0.0
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
