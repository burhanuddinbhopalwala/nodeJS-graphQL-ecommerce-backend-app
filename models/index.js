"use strict";

const fs = require("fs");
const path = require("path");

const Sequelize = require("sequelize");

const basename = path.basename(__filename);

const NODE_ENV = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "..", "config", "config.js"))[
    NODE_ENV
];

const db = {};
let sequelize;

if (false && config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js"
        );
    })
    .forEach(file => {
        const model = sequelize["import"](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (
        db[modelName].options.classMethods &&
        db[modelName].options.classMethods.hasOwnProperty("associate")
    ) {
        db[modelName].options.classMethods.associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
