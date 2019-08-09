"use strict";

//* This saves the paymentVendor response, hence to be less validated purposefully
module.exports = function(sequelize, DataTypes) {
	const PaymentLine = sequelize.define(
		"paymentLine",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			transactionId: { type: DataTypes.STRING },
			totalAmount: { type: DataTypes.DECIMAL(10, 2) },
			status: { type: DataTypes.STRING },
			captured: { type: DataTypes.BOOLEAN },
			capturedAt: { type: DataTypes.DATE },
			customer: { type: DataTypes.STRING },
			paid: { type: DataTypes.BOOLEAN },
			method: { type: DataTypes.STRING },
			currency: { type: DataTypes.STRING },
			receiptUrl: { type: DataTypes.STRING },
			jsonResponse: {
				type: DataTypes.TEXT,
				get: function() {
					return JSON.parse(this.getDataValue("jsonResponse"));
				},
				set: function(value) {
					this.setDataValue("jsonResponse", JSON.stringify(value));
				}
			}
		},
		{
			timestamps: true,
			paranoid: true,
			tableName: "payment_lines",
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
					PaymentLine.belongsTo(models.order);
				}
			},
			instanceMethods: {},
			hooks: {}
		}
	);
	return PaymentLine;
};
