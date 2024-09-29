
const express = require("express");

const { verifyJwt } = require("../middleware/jwt");
const { verifyUserRole } = require("../middleware/verifyUserRole");
const { handleCreateProduct } = require("../controllers/product.controller");
const { upload } = require("../middleware/upload.middleware");

const productRouter = express.Router();


productRouter.post("/create-product",verifyJwt , verifyUserRole ,upload.array('productImage', 5) , handleCreateProduct)

module.exports = { productRouter }