"use strict";
const path = require("path");
const jwt = require("jsonwebtoken");

const db = require(path.join(__dirname, "..", "..", "models", "index.js"));

const User = db.user;

module.exports = async function isAuth(req, res, next) {
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader) {
            const error = new Error("Unauthorized!");
            error.httpStatusCode = 401;
            throw error;
        }
        let decodedToken;
        try {
            const jwtToken = authHeader.split(" ")[1];
            decodedToken = jwt.verify(
                jwtToken,
                new Buffer(process.env.JWT_PRIVATE_KEY, "base64").toString(
                    "utf-8"
                )
            );
        } catch (error) {
            error.message = "Unauthenticated!";
            error.httpStatusCode = 401;
            throw error;
        }
        req.user = await User.findByPk(decodedToken.userId);
        if (!req.user) {
            const error = new Error("User not found!");
            error.httpStatusCode = 404;
            throw error;
        }
        next();
    } catch (error) {
        if (!error.httpStatusCode) error.httpStatusCode = 500;
        next(error);
    }
};
