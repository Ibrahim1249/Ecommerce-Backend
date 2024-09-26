const { userModel } = require("../models/user.model")

async function handleRegisterUser(req,res) {
    try {
        
    const {firstName , lastName , email , password , role } = req.body

     if([firstName , lastName , email , password , role ].some((field)=> field?.trim() === "")){
         return res.status(400).json({error : "All Field is Required!"})
     }

     // existing user check
     const existingUser = await userModel.findOne({email : email});
     if(existingUser){
        return res.status(409).json({error : "Email is already exist!"})
     }
     // put user in db

     const user = await userModel.create({firstName , lastName , email , password , role})

     const createUser = await userModel.findById(user?._id).select("-password -refreshToken")
     if(!createUser) return res.status(500).json({error : "Something went wrong while registering the user " })

    return res.status(201).json({message : "User is successfully register" , user : createUser})


    } catch (error) {
        console.log("error in user controller " , error);
        return res.status(500).json({error : error.message})
    }

}






module.exports = {
    handleRegisterUser
}