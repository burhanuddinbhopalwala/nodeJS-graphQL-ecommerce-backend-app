"use strict";

module.exports = function(sequelize, DataTypes) {
    const cartProduct = sequelize.define(
        "cartProduct",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: {
                        args: 1,
                        msg: "Quantity more than 10 not allowed per order!"
                    },
                    max: {
                        args: 10,
                        msg: "Quantity more than 10 not allowed per order!"
                    }
                }
            },
            addedOn: DataTypes.DATE
        },
        {
            timestamps: true,
            tableName: "cart_products",
            defaultScope: {
                attributes: {
                    exclude: ["createdAt", "updatedAt", "deletedAt"]
                }
            }
        }
    );
    return cartProduct;
};
