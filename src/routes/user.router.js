const express = require("express");
const { handleRegisterUser, handleLoginUser } = require("../controllers/user.controller");

const userRouter = express.Router();


userRouter.post("/register",handleRegisterUser)
userRouter.post("/login",handleLoginUser)




module.exports = { userRouter }
