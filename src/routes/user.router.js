const express = require("express");
const { handleRegisterUser, handleLoginUser, handleLogoutUser } = require("../controllers/user.controller");
const { verifyJwt } = require("../middleware/jwt");

const userRouter = express.Router();


userRouter.post("/register",handleRegisterUser)
userRouter.post("/login",handleLoginUser)
userRouter.post("/logout",verifyJwt , handleLogoutUser)




module.exports = { userRouter }
