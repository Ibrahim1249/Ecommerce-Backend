const express = require("express");
const { handleRegisterUser, handleLoginUser, handleLogoutUser, changePassword, handleRefreshToken, handleAddWishlist, handleGetWishlist } = require("../controllers/user.controller");
const { verifyJwt } = require("../middleware/jwt");
const { upload } = require("../middleware/upload.middleware");

const userRouter = express.Router();


userRouter.post("/register", upload.single("avatar") , handleRegisterUser)
userRouter.post("/login",handleLoginUser)
userRouter.post("/logout",verifyJwt , handleLogoutUser)
userRouter.post("/change-password",verifyJwt , changePassword)
userRouter.post("/refresh-token",verifyJwt , handleRefreshToken)
userRouter.post("/:productId", verifyJwt , handleAddWishlist);
userRouter.get("/wishlist",verifyJwt , handleGetWishlist)





module.exports = { userRouter }
