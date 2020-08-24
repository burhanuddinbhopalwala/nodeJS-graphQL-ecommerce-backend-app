"use strict";
//* https://bundlephobia.com
const fs = require("fs");
const path = require("path");

require(path.join(__dirname, "config", "env.js"));

const express = require("express");
const morgan = require("morgan");
const xssClean = require("xss-clean");
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const expressGraphQL = require("express-graphql");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUiExpress = require("swagger-ui-express");

const sequelize = require(path.join(__dirname, "models")).sequelize;
const apiV1Auth = require(path.join(
	__dirname,
	"customMiddlewares",
	"api",
	"v1",
	"isAuth.js"
));
const apiV1UsersRoutes = require(path.join(
	__dirname,
	"routes",
	"api",
	"v1",
	"users.js"
));
const apiV1ProductsRoutes = require(path.join(
	__dirname,
	"routes",
	"api",
	"v1",
	"products.js"
));
const apiV1CartsRoutes = require(path.join(
	__dirname,
	"routes",
	"api",
	"v1",
	"carts.js"
));
const apiV1ShippingAddressesRoutes = require(path.join(
	__dirname,
	"routes",
	"api",
	"v1",
	"shippingAddresses.js"
));
const apiV1OrdersRoutes = require(path.join(
	__dirname,
	"routes",
	"api",
	"v1",
	"orders.js"
));
const apiV1GraphQLSchema = require(path.join(
	__dirname,
	"graphQL",
	"api",
	"v1",
	"schema.js"
));
const apiV1GraphQLResolvers = require(path.join(
	__dirname,
	"graphQL",
	"api",
	"v1",
	"resolvers.js"
));
const errorHandlingRoutes = require(path.join(
	__dirname,
	"routes",
	"public",
	"errors.js"
));

const masterJobs = require(path.join(__dirname, "jobs", "masterJobs.js"));

const app = express();
const PORT = process.env.PORT || 3500;

app.set("trust proxy", 1);
//* https://expressjs.com/en/guide/behind-proxies.html
//* https://medium.com/@sevcsik/authentication-using-https-client-certificates-3c9d270e8326

//* Logging
const accessLogStream = fs.createWriteStream(
	path.join(__dirname, "logs", "access.log"),
	{ flags: "a" }
);

//* API rate limiter
const apiRateLimiter = rateLimiter({
	max: 1000, //* limit each IP to 100 requests per windowMs
	windowMs: 1 * 1 * 1000, //* 1 sec, min * sec * 1000
	message: "Too many requests" //* message to send
});

//! CSRF Attacks
const csrfProtection = csurf({
	cookie: true
});

//* Security Middlewares
app.use(morgan("combined", { stream: accessLogStream })); //* Logging
app.use("/api", apiRateLimiter); //! DoS Attacks + Brute Force Attacks
app.use(express.json({ limit: "10kb" })); //! Body limit is 10 - DoS Attacks
app.use(xssClean()); //! Data (HTML & JS-Scripts ) Sanitization against - XSS Attacks
app.use(helmet()); //! XSS Attacks
//! No SQL Sequelize RAW Queries - SQL Injection Attacks
//* https://itnext.io/make-security-on-your-nodejs-api-the-priority-50da8dc71d68

//* Other Middlewares
app.use(/\/((?!graphql).)*/, bodyParser.urlencoded({ extended: true }));
app.use(/\/((?!graphql).)*/, bodyParser.json());
app.use(cookieParser()); //* // We need this because "cookie" is true in csrfProtection
if (process.env.NODE_ENV === "production") app.use(csrfProtection); //* _csrf, req.csrfToken() + req.body._csrf
// app.all("*", function(req, res) {
//     res.cookie("XSRF-TOKEN", req.csrfToken());
// }); //* SPA
//* err.code === "EBADCSRFTOKEN"
//! CSRF Attacks
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

//* For ALB Health Check!
app.get("/api/health", (req, res, next) => {
	const uptimeSeconds = process.uptime();
	const uptime =
		Math.floor(uptimeSeconds / (3600 * 24)) +
		" days " +
		Math.floor((uptimeSeconds % (3600 * 24)) / 3600) +
		" hours " +
		Math.floor((uptimeSeconds % 3600) / 60) +
		" minutes " +
		Math.floor(uptimeSeconds % 60) +
		" seconds";
	res.status(200).json({
		message: "Up...",
		uptime: uptime,
		timestamp: new Date().toString()
	});
});

//* Buisness routes
app.use("/api/v1/users", apiV1UsersRoutes);
app.use("/api/v1/products", apiV1ProductsRoutes);
app.use("/api/v1/carts", apiV1CartsRoutes);
app.use("/api/v1/shippingAddresses", apiV1ShippingAddressesRoutes);
app.use("/api/v1/orders", apiV1OrdersRoutes);

//* Only for graphQL
//! Don't use custom productValidator here, as graphQL query will not resolve, leads to errors only
app.use(
	"/api/v1/graphql",
	apiV1Auth,
	expressGraphQL({
		schema: apiV1GraphQLSchema,
		rootValue: apiV1GraphQLResolvers,
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

//* Swagger API Documentation
const swaggerDefinition = {
	openapi: "3.0.0",
	info: {
		title: "nodeJS-graphQL-ecommerce-backend-app",
		version: "1.0.0",
		description: "nodeJS-graphQL-ecommerce-backend-app",
		termsOfService: "nodeJS-graphQL-ecommerce-backend-app - TOS",
		host: "http://localhost:3500",
		basePath: "/api",
		schemes: ["http", "https"],
		license: {
			name: "MIT",
			url: "https://choosealicense.com/licenses/mit/"
		},
		contact: {
			name: "Burhanuddin Bhopalwala",
			url: "https://github.com/burhanuddinbhopalwala",
			email: "burhanuddinbhopalwala.connect@gmail.com"
		}
	},
	servers: [
		{
			url: "http://localhost:3500",
			description: "dev"
		}
	],
	components: {
		schemas: {},
		securitySchemes: {
			authHeader: {
				type: "http", //* http, apiKey, oauth2 or openIdConnect
				scheme: "bearer",
				bearerFormat: "JWT"
			}
		}
	}
};
const options = {
	swaggerDefinition,
	apis: ["./models/*.js", "./routes/*.js", "./swaggerComponents/*.js"]
};
const swaggerSpec = swaggerJsDoc(options);

app.get("/swagger.json", function(req, res) {
	res.setHeader("Content-Type", "application/json");
	res.send(swaggerSpec);
});
app.use(
	"/api/api-docs",
	swaggerUiExpress.serve,
	swaggerUiExpress.setup(swaggerSpec)
);
/*
 * Swagger ref links:
 * https://itnext.io/setting-up-swagger-in-a-node-js-application-d3c4d7aa56d4
 * https://scotch.io/tutorials/speed-up-your-restful-api-development-in-node-js-with-swagger
 * https://levelup.gitconnected.com/the-simplest-way-to-add-swagger-to-a-node-js-project-c2a4aa895a3c
 */

//* Scheduling master jobs
masterJobs.runMasterJobs();

//* Error handling
app.use(errorHandlingRoutes);

//* Sequelize sync
sequelize
	.sync({ force: false })
	.then(data => {
		console.log("mySQL Sync Successful && Connected!!!");
		app.listen(PORT, () =>
			console.log(`Listening and serving HTTP on :${PORT}`)
		);
	})
	.catch(err => {
		console.log(err);
	});
