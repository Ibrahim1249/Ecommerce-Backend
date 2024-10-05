const express = require("express");

const { verifyJwt } = require("../middleware/jwt");
const { handleUserCart, handleUpdateCartItemQuantity, handleGetUserCart, handleDeleteProductFromCart } = require("../controllers/cart.controller");


const cartRouter = express.Router();

cartRouter.post("/:id" , verifyJwt, handleUserCart);
cartRouter.patch("/:productID" , verifyJwt, handleUpdateCartItemQuantity);
cartRouter.get("/" , verifyJwt , handleGetUserCart);
cartRouter.delete("/",verifyJwt , handleDeleteProductFromCart)


module.exports = {cartRouter}

