"use strict";
class ErrorsController {
    static throw404(req, res, next) {
        const status = 404;
        const error = new Error("Route not found!");
        res.status(status).json({
            status,
            name: error.name, //* Error
            code: error.message,
            message: error.message,
            data: error.data
        });
    }

    static throwError(error, req, res, next) {
        console.log(error);
        const status = error.httpStatusCode || 500;
        res.status(status).json({
            status,
            name: error.name, //* Error
            code: error.message,
            message: error.message,
            data: error.data
        });
    }
}

module.exports = ErrorsController;
