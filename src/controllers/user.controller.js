const { userModel } = require("../models/user.model")
const jwt = require("jsonwebtoken");

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

async function handleLogoutUser(req,res) {
    try {
        await userModel.findByIdAndUpdate(req.user._id , 
            {
               $unset : {
                  refreshToken : 1 // remove the value refresh token from current user 
               }
            }, 
            {new : true}
        )

        const options = {
            httpOnly : true,
            secure:true
        }
        return res.status(200).clearCookie("accessToken" , options).clearCookie('refreshToken' , options).json({message : "user is logout successfully"})
    } catch (error) {
        console.log("error in logout controller " , error);
        return res.status(500).json({error : error.message})
    }
}

async function changePassword(req,res) {
    try {
        const {oldPassword , newPassword} = req.body;
        const user = await userModel.findById(req.user._id);
        const isPassword = await user.isPasswordCorrect(oldPassword);
        if(!isPassword) return res.status(400).json({error : "invalid old password"})

        user.password = newPassword;
        await user.save({validateBeforeSave : false});

        res.status(201).json({message : "password is change successfully "})
    } catch (error) {
        console.log("error in change password controller " , error);
        return res.status(500).json({error : error.message})
    }
}

async function handleAddWishlist(req,res) {
    try {
        const {productId} = req.body;
        const updatedWishlist = await userModel.findByIdAndUpdate(req.user._id , {
             $push :{
                 wishlist : productId
             }
        },{new : true})

        // console.log(updatedWishlist)
        return res.json({message : "product add in wishlist" , updatedWishlist })

    } catch (error) {
        console.log("error in add wishlist controller " , error);
        return res.status(500).json({error : error.message})
    }
}
async function handleGetWishlist(req,res) {
    try {
        const updatedWishlist = await userModel.findById(req.user._id).populate("wishlist" , "title price description brand");
        if(!updatedWishlist)return res.status(404).json({message : `No Wishlist for user ${req.user._id}`})

        return res.json({message : `Wishlist for user ${req.user._id}` , updatedWishlist })

    } catch (error) {
        console.log("error in get wishlist controller " , error);
        return res.status(500).json({error : error.message})
    }
}

async function handleRefreshToken(req,res) {
    try {
        const inComingToken = req.cookie.refreshToken || req.body.refreshToken;
        if(!inComingToken) return res.status(401).json({error : "unauthorized request"});

        const decodedRefreshToken  = jwt.verify(inComingToken , process.env.REFRESH_TOKEN_SECRET);
        const user = await userModel.findById(decodedRefreshToken?._id);
        if(!user) return res.status(401).json({error : "invalid refresh token "});

        if(inComingToken !== user?.refreshToken) return res.status(401).json({error : "Refresh token is expired or used"});

        const options = {
            httpOnly : true,
            secure : true
        }

        const {accessToken , refreshToken} = generateAccessAndRefreshToken(user._id);
        return res.status(200).cookie("accessToken" ,accessToken , options).cookie("refreshToken",refreshToken , options).json({message : "user successfully logged In " , user: loggedInUser, accessToken, refreshToken} )

    } catch (error) {
        console.log("error in get wishlist controller " , error);
        return res.status(500).json({error : error.message})
    }
}



module.exports = {
    handleRegisterUser,
    handleLoginUser,
    handleLogoutUser,
    handleGetWishlist,
    handleAddWishlist,
    changePassword,
    handleRefreshToken
}