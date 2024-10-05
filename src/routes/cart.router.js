const express = require("express");

const { verifyJwt } = require("../middleware/jwt");
const { handleUserCart, handleUpdateCartItemQuantity } = require("../controllers/cart.controller");


const cartRouter = express.Router();

cartRouter.post("/:id" , verifyJwt, handleUserCart);
cartRouter.patch("/:productID" , verifyJwt, handleUpdateCartItemQuantity);


module.exports = {cartRouter}

