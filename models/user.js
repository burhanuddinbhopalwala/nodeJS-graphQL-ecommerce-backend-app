"use strict";

module.exports = function(sequelize, DataTypes) {
    const User = sequelize.define(
        "user",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
                validate: { isEmail: { args: true, msg: "Invalid email!" } }
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [5, 25],
                        msg: "Username must be of length between 5 to 25!"
                    }
                }
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
                //FIXME: Password length check
                // validate: {
                //   len: {
                //     args: [5, 25],
                //     msg: "Passowrd must be of length between 5 to 25!"
                //   }
                // }
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true
            },
            creditCard: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    isCreditCard: {
                        args: true,
                        msg: "Credit card number invalid!"
                    }
                }
            },
            resetToken: {
                type: DataTypes.STRING,
                allowNull: true
            },
            resetTokenExpiration: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            timestamps: true,
            paranoid: true,
            tableName: "users",
            validate: {},
            indexes: [
                {
                    name: "idx_email_customers",
                    method: "BTREE",
                    fields: ["email"]
                }
            ],
            defaultScope: {
                attributes: {
                    exclude: ["createdAt", "updatedAt", "deletedAt"]
                }
            },
            scopes: {},
            classMethods: {
                associate: function(models) {
                    User.hasMany(models.product, {
                        foreignKey: "creatorId",
                        constraints: true,
                        onDelete: "CASCADE"
                    });

                    User.hasOne(models.cart, {
                        constraints: true,
                        onDelete: "CASCADE"
                    });

                    User.hasMany(models.shippingAddress, {
                        constraints: true,
                        onDelete: "CASCADE"
                    });

                    User.hasMany(models.order, {
                        constraints: true,
                        onDelete: "CASCADE"
                    });
                }
            },
            instanceMethods: {
                isAdmin: function() {
                    return this.is_admin;
                }
            },
            hooks: {}
        }
    );
    return User;
};
