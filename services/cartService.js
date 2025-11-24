const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');

// Calc cart total price
const calcCartTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });

  cart.totalCartPrice = totalPrice;
  cart.totalDiscountedPrice = undefined;
};

// @desc    Get logged user's cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);

  // 1) Get logged user's cart
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // create cart for logged user with chosen product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });

    res.json({ message: 'Cart Created' });
  } else {
    // if product exists in cart => update product quantity
    const productIndex = cart.cartItems.findIndex((item) => {
      return item.product.toString() === productId && item.color === color;
    });

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
      console.log('Cart Quantity', cart.cartItems[productIndex].quantity);
    }

    // if product does no exist push product to cartItems
    cart.cartItems.push({ product: productId, color, price: product.price });
  }

  // calc total price
  calcCartTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    data: cart,
  });
});

// @desc    Get logged user's cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(
        `No Cart for user with id ${req.user._id}, because no products added to cart`,
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    remove cart item cart
// @route   DELETE /api/v1/cart/:cartItemId
// @access  Private/User
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.cartItemId } },
    },
    { new: true }
  );

  calcCartTotalPrice(cart);
  cart.save();

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Clear Cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(204).send();
});

// @desc    Apply coupon on cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    next(new ApiError('Coupon is invalid or expired', 404));
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });
  const totalPrice = cart.totalCartPrice;

  // 3) Calc price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    totalPrice * (coupon.discount / 100)
  ).toFixed(2);

  cart.totalDiscountedPrice = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
