
const express = require("express");

const { verifyJwt } = require("../middleware/jwt");
const { verifyUserRole } = require("../middleware/verifyUserRole");
const { handleCreateProduct, handleUpdateProduct, handleDeleteProduct, handleGetAllProduct, handleProductReview, handleGetSingleProduct, handleDeleteProductReview } = require("../controllers/product.controller");
const { upload } = require("../middleware/upload.middleware");

const productRouter = express.Router();


productRouter.post("/create-product",verifyJwt , verifyUserRole ,upload.array('productImage', 5) , handleCreateProduct)
productRouter.put("/create-product/:id",verifyJwt , verifyUserRole ,upload.array('productImage', 5) , handleUpdateProduct)
productRouter.delete("/create-product/:id",verifyJwt , verifyUserRole , handleDeleteProduct)
productRouter.get("/",verifyJwt , handleGetAllProduct)
productRouter.get("/:id",verifyJwt , handleGetSingleProduct)
productRouter.post("/:id",verifyJwt,upload.array('media', 5),handleProductReview)
productRouter.delete("/:id",verifyJwt,handleDeleteProductReview)

module.exports = { productRouter }