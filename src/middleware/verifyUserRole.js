const { userModel } = require("../models/user.model");


async function verifyUserRole(req, res,next){
     const user = await userModel.findById(req.user._id);
     if(user.role !== "admin") {
        return res.status(404).json({error : "Only admin is allowed to Create product"})
    }else{
        next();
    }

}

module.exports = {verifyUserRole}