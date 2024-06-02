'use strict';

const path = require('path');

const jwt = require('jsonwebtoken');

const { SOURCE } = require(path.join(
    __dirname,
    '..',
    '..',
    '..',
    'constants.js'
));
const jwtUtil = require(path.join(SOURCE, 'utils', 'jwt.js'));
const db = require(path.join(SOURCE, 'models', 'index.js'));

const User = db.user;

module.exports = async function isAuth(req, res, next) {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const error = new Error('Unauthorized!');
            error.httpStatusCode = 401;
            throw error;
        }
        let decodedToken;
        try {
            const jwtToken = authHeader.split(' ')[1];
            decodedToken = jwt.verify(jwtToken, jwtUtil.getPrivateKey());
        } catch (error) {
            error.message = 'Unauthorized!';
            error.httpStatusCode = 401;
            throw error;
        }
        req.user = await User.findByPk(decodedToken.userId);
        if (!req.user) {
            const error = new Error('User not found!');
            error.httpStatusCode = 404;
            throw error;
        }
        next();
    } catch (error) {
        if (!error.httpStatusCode) error.httpStatusCode = 500;
        next(error);
    }
};
