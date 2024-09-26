
const express = require("express");

const { verifyJwt } = require("../middleware/jwt");
const { verifyUserRole } = require("../middleware/verifyUserRole");
const { handleAddWishlist } = require("../controllers/user.controller");
const { handleCreateProduct } = require("../controllers/product.controller");

const productRouter = express.Router();


productRouter.post("/create-product",verifyJwt , verifyUserRole , handleCreateProduct)






module.exports = { productRouter }