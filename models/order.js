'use strict';

module.exports = function(sequelize, DataTypes) {
    const Order = sequelize.define(
        'order',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            totalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            state: {
                type: DataTypes.ENUM('cart', 'checkout', 'hold', 'closed'),
                allowNull: false,
                defaultValue: 'cart'
            },
            status: {
                type: DataTypes.ENUM(
                    'created',
                    'completed',
                    'delivered',
                    'cancelled'
                ),
                allowNull: false,
                defaultValue: 'created'
            },
            completedAt: { type: DataTypes.DATE }, //* Only filled when completed else not
            comments: DataTypes.STRING
        },
        {
            timestamps: true,
            paranoid: true,
            tableName: 'orders',
            validate: {},
            indexes: [],
            defaultScope: {
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deletedAt']
                }
            },
            scopes: {
                closedState: {
                    where: {
                        state: 'closed'
                    }
                }
            },
            classMethods: {
                associate: function(models) {
                    Order.belongsToMany(models.product, {
                        through: 'orderProduct'
                    });

                    Order.hasOne(models.shippingAddress, {
                        constraints: true,
                        onDelete: 'CASCADE'
                    });

                    Order.hasMany(models.paymentLine, {
                        constraints: true,
                        onDelete: 'CASCADE'
                    });
                }
            },
            instanceMethods: {},
            hooks: {}
        }
    );
    return Order;
};
