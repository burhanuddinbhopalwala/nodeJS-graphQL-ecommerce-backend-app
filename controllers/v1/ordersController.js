"use strict";
const fs = require("fs");
const path = require("path");

const pdfKit = require("pdfkit");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { validationResult } = require("express-validator/check");

const db = require(path.join(__dirname, "..", "..", "models", "index.js"));

const { Op } = db.Sequelize;

class OrdersController {
    static async getAllUserOrders(req, res, next) {
        try {
            const currentPage = +req.query.page || 1;
            const itemsPerPage = +process.env.PAGINATION_PER_PAGE;
            const totalUserClosedOrdersCount = await req.user.countOrders({
                where: { state: "closed" }
            });
            const totalUserClosedOrders = await req.user.getOrders({
                where: { state: "closed" },
                include: [
                    {
                        model: db.product,
                        duplicating: false
                    },
                    {
                        model: db.shippingAddress,
                        duplicating: false
                    }
                ],
                order: [["updatedAt", "DESC"]],
                offset: (currentPage - 1) * itemsPerPage,
                limit: itemsPerPage
            });
            if (!totalUserClosedOrders || !(totalUserClosedOrders.length > 0)) {
                const error = new Error("userOrders not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const finalResult = {
                orders: totalUserClosedOrders,
                currentPage: currentPage,
                hasNextPage:
                    itemsPerPage * currentPage < totalUserClosedOrdersCount,
                hasPreviousPage: currentPage > 1,
                nextPage: currentPage + 1,
                previousPage: currentPage - 1,
                lastPage: Math.ceil(totalUserClosedOrdersCount / itemsPerPage)
            };
            res.status(200).json({
                message: "userOrders fetched!",
                data: finalResult
            });
            return;
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async getOrderDetails(req, res, next) {
        try {
            const orderId = +req.params.orderId;
            const userOrders = await req.user.getOrders({
                where: { id: orderId, state: "closed" },
                include: [
                    {
                        model: db.product,
                        duplicating: false
                    },
                    {
                        model: db.shippingAddress,
                        duplicating: false
                    }
                ]
            });
            if (!userOrders || !(userOrders.length > 0)) {
                const error = new Error("Order not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const userOrder = userOrders[0];
            userOrder.dataValues.invoiceLink = `${process.env.URL}/orders/invoice/${orderId}`;
            res.status(200).json({
                message: "userOrder fetched!",
                data: { order: userOrder }
            });
            return;
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async getOrderInvoice(req, res, next) {
        try {
            const orderId = req.params.orderId;
            const userOrders = await req.user.getOrders({
                where: { id: orderId, state: "closed" },
                include: [
                    {
                        model: db.product,
                        duplicating: false
                    },
                    {
                        model: db.shippingAddress,
                        duplicating: false
                    },
                    {
                        model: db.paymentLine,
                        attributes: ["id", "currency"],
                        duplicating: false
                    }
                ]
            });
            if (!userOrders && !(userOrders.length > 0)) {
                const error = new Error("Order not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const userOrder = userOrders[0];
            //* Preparing invoice
            const pdfInvoice = new pdfKit();
            const invoiceName = "invoice_" + orderId + ".pdf";
            const invoicePath = path.join("data", "invoices", invoiceName);
            pdfInvoice.pipe(fs.createWriteStream(invoicePath));
            pdfInvoice.pipe(res);
            //* Writing invoice data
            pdfInvoice.fontSize(20).text("Invoice", { underline: true });
            pdfInvoice.fontSize(18).text(
                `orderID:${userOrder.id}@${userOrder.completedAt
                    .toString()
                    .split("GMT")[0]
                    .trim()}`
            );
            pdfInvoice.text("---------------------------------------");
            userOrder.products.forEach(product => {
                pdfInvoice
                    .fontSize(14)
                    .text(
                        `${product.title}---- ${product.orderProduct.quantity} x ${product.price}`
                    );
                pdfInvoice.text("------\n");
            });
            pdfInvoice.fontSize(10).text(
                `Shipping/ Billing Address: \n
				fullname: ${userOrder.shippingAddress.fullname}
				mobPhone: ${userOrder.shippingAddress.mobPhone}
				address1: ${userOrder.shippingAddress.address1}
				address2: ${userOrder.shippingAddress.address2}
				landmark: ${userOrder.shippingAddress.landmark}
				postalCode: ${userOrder.shippingAddress.postalCode}
				city: ${userOrder.shippingAddress.city}
				state: ${userOrder.shippingAddress.state}
				country: ${userOrder.shippingAddress.country}
				type: ${userOrder.shippingAddress.type}`
            );
            pdfInvoice.text("------\n");
            pdfInvoice
                .fontSize(16)
                .text(
                    `\nTotal price: ${
                        userOrder.totalAmount
                    } ${userOrder.paymentLines[0].currency.toUpperCase()}`
                );
            //* -------------------------------------------------------;
            pdfInvoice.end();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `inline; filename=${invoicePath}`
            );
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async getCheckoutOrder(req, res, next) {
        try {
            const cart = await req.user.getCart({
                include: [{ model: db.product, duplicating: false }],
                lock: true
            });
            if (!cart) {
                const error = new Error("Cart not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const cartProducts = cart.products;
            if (!cartProducts || !(cartProducts.length > 0)) {
                const error = new Error("cartProducts not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            let totalAmount;
            if (cartProducts.length === 1)
                totalAmount =
                    +cartProducts[0].price *
                    +cartProducts[0].cartProduct.quantity;
            else
                totalAmount = cartProducts.reduce((product1, product2) => ({
                    totalAmount:
                        +product1.price * +product1.cartProduct.quantity +
                        +product2.price * +product2.cartProduct.quantity
                })).totalAmount;
            res.status(200).json({
                message: "Checkout fetched!",
                data: {
                    cart: cart,
                    totalAmount: totalAmount
                }
            });
            return;
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async postCheckoutOrder(req, res, next) {
        let userOrder; //* For updating the state, in catch block
        try {
            const cart = await req.user.getCart({
                include: [{ model: db.product, duplicating: false }],
                lock: true
            });
            if (!cart) {
                const error = new Error("Cart not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            //* Exracting user address
            const userShippingAddresses = await req.user.getShippingAddresses({
                where: { id: +req.body.shippingAddressId }
            });
            if (!userShippingAddresses || !(userShippingAddresses.length > 0)) {
                const error = new Error("Shipping address not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const userShippingAddress = userShippingAddresses[0];
            const cartProducts = cart.products;
            if (!cartProducts || !(cartProducts.length > 0)) {
                const error = new Error("cartProducts not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            //* Need to closed the exisitng open order first before creating new order
            const existingUserCartOrder = await req.user.getOrders({
                where: {
                    state: { [Op.or]: ["cart", "checkout"] },
                    status: "created"
                },
                limit: 1, //* "hold" orders must be completed manually
                lock: true
            });
            if (!existingUserCartOrder || !(existingUserCartOrder.length > 0)) {
                if (cartProducts.length === 1) {
                    userOrder = await req.user.createOrder({
                        totalAmount:
                            +cartProducts[0].price *
                            +cartProducts[0].cartProduct.quantity
                    });
                    await userOrder.setShippingAddress(userShippingAddress);
                } else {
                    userOrder = await req.user.createOrder({
                        totalAmount: cartProducts.reduce(
                            (product1, product2) => ({
                                totalAmount:
                                    +product1.price *
                                        +product1.cartProduct.quantity +
                                    +product2.price *
                                        +product2.cartProduct.quantity
                            })
                        ).totalAmount
                    });
                    await userOrder.setShippingAddress(userShippingAddress);
                }
            }
            //* Now updating this order
            else {
                userOrder = existingUserCartOrder[0];
                if (cartProducts.length === 1) {
                    userOrder = await userOrder.update({
                        totalAmount:
                            +cartProducts[0].price *
                            +cartProducts[0].cartProduct.quantity
                    });
                    await userOrder.setShippingAddress(userShippingAddress);
                } else {
                    const totalAmount = cartProducts.reduce(
                        (product1, product2) => ({
                            totalAmount:
                                +product1.price *
                                    +product1.cartProduct.quantity +
                                +product2.price * +product2.cartProduct.quantity
                        })
                    ).totalAmount;
                    userOrder = await userOrder.update({
                        totalAmount: totalAmount
                    });
                    await userOrder.setShippingAddress(userShippingAddress);
                }
            }
            //* addProducts() overwrites
            await userOrder.addProducts(
                cartProducts.map(product => {
                    product.orderProduct = {
                        quantity: product.cartProduct.quantity,
                        unitCost: (1 + Math.random() * 30).toFixed(2) //* [1 30] random for now
                    };
                    return product;
                })
            );
            OrdersController.processPayment(req, res, cart, userOrder);
            return;
        } catch (error) {
            if (userOrder && userOrder.state !== "checkout") {
                console.log(
                    //* For later debugging
                    `>>>>>>PAYMENT ERROR FOR ORDER ID: ${userOrder.id}>>>>>${error.message}>>>>>>>>>`
                );
                userOrder.state = "checkout";
                const updatedUserOrder = await userOrder.save();
                error.data = {
                    order: {
                        orderId: +updatedUserOrder.id,
                        username: req.user.username,
                        email: req.user.email,
                        totalAmount: +updatedUserOrder.totalAmount.toFixed(2),
                        state: updatedUserOrder.state,
                        status: updatedUserOrder.status
                    }
                };
            }
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }

    static async processPayment(req, res, cart, userOrder) {
        try {
            //* Create a new stripe customer
            const stripeCustomer = await stripe.customers.create({
                email: userOrder.email
            });
            const sourceForStripe = await stripe.customers.createSource(
                stripeCustomer.id,
                {
                    source: "tok_visa"
                }
            );
            //* Creating charge
            const userStripeCharge = await stripe.charges.create({
                amount: Math.ceil(+userOrder.totalAmount),
                currency: "usd",
                customer: sourceForStripe.customer,
                description: "Burhanuddin! for turing project",
                metadata: {
                    email: req.user.email,
                    orderId: userOrder.id
                }
            });
            //FIXME: Missing CHECKSUM verification!, doing manually on some fields now
            let state = "closed";
            console.log(
                `>>>>>>STRIPE SUCCESS FOR ORDER ID: ${userOrder.id}>>>>>>>>>>>>>>`
            );
            if (
                !(userStripeCharge.status === "succeeded") ||
                !(+userStripeCharge.amount === +userOrder.totalAmount) ||
                !(userStripeCharge.captured === true) ||
                !(userStripeCharge.currency === "usd") ||
                !(userStripeCharge.customer === sourceForStripe.customer) ||
                !(+userStripeCharge.metadata.orderId === +userOrder.id) ||
                !(userStripeCharge.metadata.email === req.user.email) ||
                !(userStripeCharge.paid === true) ||
                !(
                    userStripeCharge.outcome.seller_message ===
                    "Payment complete."
                )
            ) {
                state = "hold";
            }
            let status = "created";
            if (state === "closed") status = "completed";
            if (status === "completed")
                await userOrder.update({
                    state: state,
                    status: status,
                    completedAt: Date.now()
                });
            else await userOrder.update({ state: state, status: status });
            //* Saving payment details
            const orderPayment = await userOrder.createPaymentLine({
                transactionId: userStripeCharge.id,
                totalAmount: userOrder.totalAmount.toFixed(2), //* For easy debugging
                status: userStripeCharge.status,
                captured: userStripeCharge.captured,
                capturedAt: Date.now(),
                customer: userStripeCharge.customer,
                paid: userStripeCharge.paid,
                method: userStripeCharge.payment_method,
                currency: userStripeCharge.currency,
                receiptUrl: userStripeCharge.receipt_url,
                jsonResponse: userStripeCharge
            });
            //* Deleting the existing CART now
            await cart.destroy(); //* cartProducts will also be cascade, onDelete
            res.status(200).json({
                message: "Order processed!",
                order: {
                    orderId: +userOrder.id,
                    username: req.user.username,
                    email: req.user.email,
                    totalAmount: +userOrder.totalAmount.toFixed(2),
                    state: userOrder.state,
                    status: userOrder.status
                },
                orderPaymentDetails: orderPayment
            });
        } catch (error) {
            throw error;
        }
    }

    static async updateOrderStatus(req, res, next) {
        try {
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                const error = new Error("Client invalid input!");
                error.httpStatusCode = 422;
                error.data = validationErrors.array();
                throw error;
            }
            const orderId = +req.params.orderId;
            const userOrders = await req.user.getOrders({
                where: { id: orderId }
            });
            if (!userOrders || !(userOrders.length > 0)) {
                const error = new Error("Order not found!");
                error.httpStatusCode = 404;
                throw error;
            }
            const userOrder = userOrders[0];
            if (
                !(userOrder.state === "closed") ||
                !(userOrder.status === "completed") ||
                !(userOrder.state !== "hold")
            ) {
                const error = new Error("Not allowed!");
                error.httpStatusCode = 405;
                throw error;
            }
            //! Data truncated for column "status" at row 1
            //! For invalid value other then ENUM defined -- Update carefully
            const updatedUserOrder = await userOrder.update({
                status: req.body.status
            });
            res.status(200).json({
                message: "Order updated!",
                data: { order: { updatedUserOrder } }
            });
            return;
        } catch (error) {
            if (!error.httpStatusCode) error.httpStatusCode = 500;
            next(error);
        }
    }
}

module.exports = OrdersController;
