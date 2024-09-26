const { userModel } = require("../models/user.model")

async function generateAccessAndRefreshToken(userId) {
    try {
        const user = await userModel.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})

        return {accessToken , refreshToken}
    } catch (error) {
        console.log("error in generateAccessAndRefreshToken controller " , error);
        return res.status(500).json({error : "Something went wrong while generating refresh and access token"})
    }
}

async function handleRegisterUser(req,res) {
    try {
        
    const {firstName , lastName , email , password , role } = req?.body

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


async function handleLoginUser(req, res) {
    try{
       const{ email , password} = req.body;
       if(email.trim() === "" || password.trim() === "") return res.status(400).json({error : "email & password is required"})

        const user = await userModel.findOne({email : email});
        if(!user) return res.status(404).json({error : "user is not found with this email"})

        const isPassword = await user.isPasswordCorrect(password);
        if(!isPassword) return res.status(401).json({error : "Invalid password"})

        const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

        const loggedInUser = await userModel.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly : true,
            secure : true
        }

        return res.status(200).cookie("accessToken" ,accessToken , options).cookie("refreshToken",refreshToken , options).json({message : "user successfully logged In " , user: loggedInUser, accessToken, refreshToken} )
    }catch(error){
        console.log("error in login controller " , error);
        return res.status(500).json({error : error.message})
    }
}





module.exports = {
    handleRegisterUser,
    handleLoginUser
}