"use strict";

class ErrorsController {
	static throw404(req, res, next) {
		res.status(404).json({
			name: "Route not found!",
			message: "Route not found!",
			data: {}
		});
	}

	static throwError(error, req, res, next) {
		console.log(error);
		const status = error.httpStatusCode || 500;
		res.status(status).json({
			name: error.name,
			message: error.message,
			data: error.data
		});
	}
}

module.exports = ErrorsController;
