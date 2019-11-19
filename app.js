"use strict";
const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const expressGraphQL = require("express-graphql");

require(path.join(__dirname, "config", "env.js"));
const sequelize = require(path.join(__dirname, "models")).sequelize;
const isAuth = require(path.join(__dirname, "customMiddlewares", "isAuth.js"));
const usersRoutes = require(path.join(__dirname, "routes", "users.js"));
const productsRoutes = require(path.join(__dirname, "routes", "products.js"));
const cartsRoutes = require(path.join(__dirname, "routes", "carts.js"));
const shippingAddressesRoutes = require(path.join(
	__dirname,
	"routes",
	"shippingAddresses.js"
));
const ordersRoutes = require(path.join(__dirname, "routes", "orders.js"));
const graphQLSchema = require(path.join(__dirname, "graphQL", "schema.js"));
const graphQLResolvers = require(path.join(
	__dirname,
	"graphQL",
	"resolvers.js"
));
const errorController = require(path.join(
	__dirname,
	"controllers",
	"errorsController.js"
));

const app = express();
const PORT = process.env.PORT || 3500;
const accessLogStream = fs.createWriteStream(
	path.join(__dirname, "logs", "access.log"),
	{ flags: "a" }
);

//* For ELB Health Check!
app.use("/health", (req, res, next) => {
	res.status(200).json({
		message: "Up..."
	});
});

app.use(/\/((?!graphql).)*/, bodyParser.urlencoded({ extended: true }));
app.use(/\/((?!graphql).)*/, bodyParser.json());
app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"OPTIONS, GET, POST, PUT, PATCH, DELETE"
	);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization"
	);
	next();
});

app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/carts", cartsRoutes);
app.use("/api/shippingAddresses", shippingAddressesRoutes);
app.use("/api/orders", ordersRoutes);

//* Only for graphQL
//! Don't use custom productValidator here, as graphQL query will not resolve, leads to errors only
app.use(
	"/api/graphql",
	isAuth,
	expressGraphQL({
		schema: graphQLSchema,
		rootValue: graphQLResolvers,
		graphiql: true,
		formatError(error) {
			if (!error.originalError) return error;
			const code = error.originalError.httpStatusCode;
			const name = error.originalError.name;
			const message = error.originalError.message;
			const data = error.originalError.data;
			return { code, name, message, data };
		}
	})
);

app.use(errorController.throwError);
app.use(errorController.throw404);

sequelize
	.sync()
	.then(data => {
		console.log("mySQL Sync Successful && Connected!!!");
		app.listen(PORT, () =>
			console.log(`Started listening on port ${PORT}...`)
		);
	})
	.catch(err => {
		console.log(err);
	});
