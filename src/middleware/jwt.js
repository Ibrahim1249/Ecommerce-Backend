const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user.model");


async function verifyJwt(req,res,next){
    try{
       const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    //    console.log(token)

       if(!token) return res.status(401).json({error : "Unauthorized request"});

       const decoded = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
 
       const user = await userModel.findById(decoded?._id).select("-password -refreshToken");

       if(!user) return res.status(401).json({error : "Invalid Access Token"});

       req.user = user;
       next()
    }catch(error){
        console.log("error from jwt " , error);
        return res.status(401).json({error : error.message})
    }
}


module.exports = {verifyJwt}