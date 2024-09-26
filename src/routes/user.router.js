const express = require("express");
const { handleRegisterUser } = require("../controllers/user.controller");

const userRouter = express.Router();


userRouter.post("/register",handleRegisterUser)




module.exports = { userRouter }
