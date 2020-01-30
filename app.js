"use strict";
const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const expressGraphQL = require("express-graphql");
const rateLimiter = require("express-rate-limit");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUiExpress = require("swagger-ui-express");

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

//* https://expressjs.com/en/guide/behind-proxies.html
app.set("trust proxy", 1);

//* Logging
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "logs", "access.log"),
    { flags: "a" }
);

//* API rate limiter
const apiRateLimiter = rateLimiter({
    windowMs: 10 * 60 * 1000, //* 10 minutes
    max: 100000
});

//* For ELB Health Check!
app.use("/health", (req, res, next) => {
    res.status(200).json({
        message: "Up..."
    });
});

//* Middlewares
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

//* Buisness routes
app.use("/api/", apiRateLimiter);
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
    apis: ["./models/*.js", "./routes/*.js"]
};
const swaggerSpec = swaggerJsDoc(options);

app.get("/swagger.json", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});
app.use(
    "/api-docs",
    swaggerUiExpress.serve,
    swaggerUiExpress.setup(swaggerSpec)
);
/*
 * Swagger ref links:
 * https://itnext.io/setting-up-swagger-in-a-node-js-application-d3c4d7aa56d4
 * https://scotch.io/tutorials/speed-up-your-restful-api-development-in-node-js-with-swagger
 * https://levelup.gitconnected.com/the-simplest-way-to-add-swagger-to-a-node-js-project-c2a4aa895a3c
 */

//* Error handling
app.use(errorController.throwError);
app.use(errorController.throw404);

//* Sequelize sync
sequelize
    .sync()
    .then(data => {
        console.log("mySQL Sync Successful && Connected!!!");
        app.listen(PORT, () =>
            console.log(`Listening and serving HTTP on :${PORT}`)
        );
    })
    .catch(err => {
        console.log(err);
    });
