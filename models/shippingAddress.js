"use strict";
// const { validate } = require("express-validator/check");

module.exports = function(sequelize, DataTypes) {
    const shippingAddress = sequelize.define(
        "shippingAddress",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            fullname: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [5, 25],
                        msg: "Fullname must be of length between 5 to 25!"
                    }
                }
            },
            mobilePhone: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [10],
                        msg: "Mobile phone must be of length between 10 digits!"
                    }
                }
            },
            address1: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [5, 50],
                        msg: "Address1 must be of length between 5 to 50!"
                    }
                }
            },
            address2: { type: DataTypes.STRING },
            landmark: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [5, 50],
                        msg: "Landmark must be of length between 5 to 50!"
                    }
                }
            },
            postalCode: {
                type: DataTypes.STRING,
                allowNull: true
                // set: function(value) {
                //   if (validate.isPostalCode(value.toString(), ["IN", "US"])) {
                //     throw new Error("Postal code invalid!");
                //   }
                // }
            },
            city: {
                type: DataTypes.STRING(25),
                allowNull: false,
                validate: {
                    len: {
                        args: [5, 25],
                        msg: "City must be of length between 5 to 25!"
                    }
                }
            },
            state: {
                type: DataTypes.ENUM(
                    "Madhya Pradesh",
                    "Uttar Pradesh",
                    "Washington",
                    "Texas"
                ),
                allowNull: false,
                defaultValue: "Uttar Pradesh"
            },
            country: {
                type: DataTypes.ENUM("IND", "USA"),
                allowNull: false,
                defaultValue: "IND"
            },
            type: {
                type: DataTypes.ENUM("home", "office", "other"),
                allowNull: false,
                defaultValue: "home"
            }
        },
        {
            timestamps: true,
            paranoid: true,
            tableName: "shipping_addresses",
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
                    shippingAddress.belongsTo(models.user);

                    shippingAddress.belongsTo(models.order);
                }
            },
            instanceMethods: {},
            hooks: {}
        }
    );
    return shippingAddress;
};
