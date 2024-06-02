'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        'orderProduct',
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
                        msg: 'Quantity more than 10 not allowed per order!'
                    },
                    max: {
                        args: 10,
                        msg: 'Quantity more than 10 not allowed per order!'
                    }
                }
            },
            // unitCost: DataTypes.DECIMAL(10, 2)
            unitCost: { type: DataTypes.DECIMAL(10, 2), field: 'unit_cost' }
        },
        {
            paranoid: true,
            timestamps: true,
            tableName: 'order_products',
            defaultScope: {
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deletedAt']
                }
            }
        }
    );
    // return orderProduct;
};
