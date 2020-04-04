"use strict";
const { validationResult } = require("express-validator/check");

class shippingAddressesController {
    static async getAllUserShippingAdressesDetails(req, res, next) {
        try {
            const currentPage = +req.query.page || 1;
            const itemsPerPage = +process.env.PAGINATION_PER_PAGE;
            const totalUserShippingAddressesCount = await req.user.countShippingAddresses();
            if (+totalUserShippingAddressesCount === 0) {
                const error = new Error("shippingAddress not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const userShippingAddresses = await req.user.getShippingAddresses({
                order: [["updatedAt", "DESC"]],
                offset: (currentPage - 1) * itemsPerPage,
                limit: itemsPerPage
            });
            if (!userShippingAddresses || !(userShippingAddresses.length > 0)) {
                const error = new Error("shippingAddress not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const finalResult = {
                shippingAddresses: userShippingAddresses,
                currentPage: currentPage,
                hasNextPage:
                    itemsPerPage * currentPage <
                    totalUserShippingAddressesCount,
                hasPreviousPage: currentPage > 1,
                nextPage: currentPage + 1,
                previousPage: currentPage - 1,
                lastPage: Math.ceil(
                    totalUserShippingAddressesCount / itemsPerPage
                )
            };
            res.status(200).json({
                message: "shippingAddresses fetched!",
                data: finalResult
            });
            return;
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async addShippingAddress(req, res, next) {
        try {
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                const error = new Error("Client invalid input!");
                error.httpStatusCode = 422;
                error.data = validationErrors.array();
                throw error;
            }
            //* Creating shippingAddress now
            const shippingAddress = await req.user.createShippingAddress({
                fullname: req.body.fullname,
                mobilePhone: req.body.mobilePhone,
                address1: req.body.address1,
                address2: req.body.address2,
                landmark: req.body.landmark,
                postalCode: req.body.postalCode,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                type: req.body.type
            });
            res.status(201).json({
                message: "shippingAddress created!",
                data: { shippingAddress: shippingAddress }
            });
            return;
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async updateShippingAddress(req, res, next) {
        try {
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                const error = new Error("Client invalid input!");
                error.httpStatusCode = 422;
                error.data = validationErrors.array();
                throw error;
            }
            const shippingAddressId = +req.params.shippingAddressId;
            const shippingAddresses = await req.user.getShippingAddresses({
                where: { id: shippingAddressId }
            });
            if (!shippingAddresses || !(shippingAddresses.length > 0)) {
                const error = new Error("shippingAddress not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const shippingAddress = shippingAddresses[0];
            await shippingAddress.update({
                fullname: req.body.fullname,
                mobilePhone: req.body.mobilePhone,
                address1: req.body.address1,
                address2: req.body.address2,
                landmark: req.body.landmark,
                postalCode: req.body.postalCode,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                type: req.body.type
            });
            res.status(200).json({
                message: "shippingAddress updated!",
                data: { shippingAddress: shippingAddress }
            });
            return;
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async deleteShippingAddress(req, res, next) {
        try {
            const shippingAddressId = +req.params.shippingAddressId;
            const shippingAddresses = await req.user.getShippingAddresses({
                where: { id: shippingAddressId }
            });
            if (!shippingAddresses || !(shippingAddresses.length > 0)) {
                const error = new Error("shippingAddress not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const shippingAddress = shippingAddresses[0];
            await shippingAddress.destroy();
            res.status(200).json({
                message: "shippingAddress destroyed!",
                data: { shippingAddress: shippingAddress }
            });
            return;
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }
}

module.exports = shippingAddressesController;
