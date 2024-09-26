const express = require("express");
const { handleRegisterUser, handleLoginUser, handleLogoutUser, changePassword, handleRefreshToken } = require("../controllers/user.controller");
const { verifyJwt } = require("../middleware/jwt");

const userRouter = express.Router();


userRouter.post("/register",handleRegisterUser)
userRouter.post("/login",handleLoginUser)
userRouter.post("/logout",verifyJwt , handleLogoutUser)
userRouter.post("/change-password",verifyJwt , changePassword)
userRouter.post("/refresh-token",verifyJwt , handleRefreshToken)





module.exports = { userRouter }
