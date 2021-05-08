"use strict";

//* https://sequelize.readthedocs.io/en/latest/docs/migrations/

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn("orders", "state", {
                type: Sequelize.ENUM("cart", "checkout", "hold", "closed"),
                allowNull: false,
                defaultValue: "cart"
            }),

            queryInterface.addColumn("orders", "status", {
                type: Sequelize.ENUM(
                    "created",
                    "completed",
                    "delivered",
                    "cancelled"
                ),
                allowNull: false,
                defaultValue: "created"
            })
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn("orders", "state"),
            queryInterface.removeColumn("orders", "status")
        ]);
    }
};
