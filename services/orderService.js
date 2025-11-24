const stripe = require('stripe')(process.env.STRIPE_SECRET);
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const factory = require('./handlersFactory');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// @desc    Create Cash Order
// @route   POST /api/v1/order/:cartId
// @access  Private/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const shippingPrice = 0;
  const taxPrice = 0;
  // 1) Get CartID based on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) next(new ApiError('There is no cart for this ID', 404));

  // 2) Get total price from cart, if coupon applied we get price after discount
  const cartPrice = cart.totalDiscountedPrice
    ? cart.totalDiscountedPrice
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + shippingPrice + taxPrice;
  // 3) Create order with default payment Method ( Cash )
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) After creating order, decrement "quantity" value, increase "sold" value of the product
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: 'success', data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') {
    req.filterObj = { user: req.user._id };
  }

  next();
});

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/User-Admin-Manager
exports.getAllOrders = factory.getAll(Order);

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/User-Admin-Manager
exports.getSpecificOrder = factory.getOne(Order);

// @desc    Update Order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError('No Order for this id: ', req.params.id));
  }

  // update Order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc    Update Order delivery status to delivered
// @route   PUT /api/v1/orders/:id/deliver
// @access  Private/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError('No Order for this id: ', req.params.id));
  }

  // update Order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc    Get Stripe Checkout Session & send it as response
// @route   GET /api/v1/orders/checkout-session/:cartId
// @access  Private/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const shippingPrice = 0;
  const taxPrice = 0;

  // 1) Get CartID based on cartId
  const cart = await Cart.findById(req.params.id);

  if (!cart) next(new ApiError('There is no cart for this ID', 404));

  // 2) Get total price from cart, if coupon applied we get price after discount
  const cartPrice = cart.totalDiscountedPrice
    ? cart.totalDiscountedPrice
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + shippingPrice + taxPrice;

  // 3) Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    client_reference_id: req.params.id,
    metadata: req.body.shippingAddress,
  });

  // 4) Send Session to response
  res.status(200).json({ status: 'success', session });
});
