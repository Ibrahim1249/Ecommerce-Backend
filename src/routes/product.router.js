
const express = require("express");

const { verifyJwt } = require("../middleware/jwt");
const { verifyUserRole } = require("../middleware/verifyUserRole");
const { handleCreateProduct, handleUpdateProduct, handleDeleteProduct, handleGetAllProduct, handleProductReview } = require("../controllers/product.controller");
const { upload } = require("../middleware/upload.middleware");

const productRouter = express.Router();


productRouter.post("/create-product",verifyJwt , verifyUserRole ,upload.array('productImage', 5) , handleCreateProduct)

productRouter.put("/create-product/:id",verifyJwt , verifyUserRole ,upload.array('productImage', 5) , handleUpdateProduct)

productRouter.delete("/create-product/:id",verifyJwt , verifyUserRole , handleDeleteProduct)
productRouter.get("/",verifyJwt , verifyUserRole , handleGetAllProduct)
productRouter.post("/:id/review",verifyJwt,upload.array('media', 5),handleProductReview)

module.exports = { productRouter }