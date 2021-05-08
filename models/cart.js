"use strict";

module.exports = function(sequelize, DataTypes) {
    const Cart = sequelize.define(
        "cart",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            }
        },
        {
            timestamps: true,
            tableName: "carts",
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
                    Cart.belongsTo(models.user);

                    Cart.belongsToMany(models.product, {
                        through: "cartProduct"
                    });
                }
            },
            instanceMethods: {},
            hooks: {}
        }
    );
    return Cart;
};
