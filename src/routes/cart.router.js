const express = require("express");

const { verifyJwt } = require("../middleware/jwt");
const { handleUserCart, handleUpdateCartItemQuantity, handleGetUserCart } = require("../controllers/cart.controller");


const cartRouter = express.Router();

cartRouter.post("/:id" , verifyJwt, handleUserCart);
cartRouter.patch("/:productID" , verifyJwt, handleUpdateCartItemQuantity);
cartRouter.get("/" , verifyJwt, handleGetUserCart);


module.exports = {cartRouter}

