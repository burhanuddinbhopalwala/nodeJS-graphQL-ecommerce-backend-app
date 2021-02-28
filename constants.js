module.exports.SOURCE = __dirname;
module.exports.ENV = process.env.NODE_ENV == "production" ? "prod" : "dev";

module.exports.JWT_PRIVATE_KEY_NAME = "private.key";
