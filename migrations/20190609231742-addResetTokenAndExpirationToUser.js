"use strict";

//* https://sequelize.readthedocs.io/en/latest/docs/migrations/

module.exports = {
	up: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.addColumn("users", "resetToken", {
				type: Sequelize.STRING,
				allowNull: true
			}),

			queryInterface.addColumn("users", "resetTokenExpiration", {
				type: Sequelize.DATE,
				allowNull: true
			})
		]);
	},

	down: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.removeColumn("users", "resetToken"),
			queryInterface.removeColumn("users", "resetTokenExpiration")
		]);
	}
};
