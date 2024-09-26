const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const addressSchema = new mongoose.Schema({
  address: {
    type: String,
  },
  city: {
    type: String,
    trim : true
  },
  state: {
    type: String,
    trim : true
  },
  pincode : {
    type: String,
    trim : true
  },
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    ],
    address: {
      type: addressSchema,
    },
  },
  { timestamps: true }
);

 userSchema.pre("save" , async function (next) {
    // this meant we are saving password for first time if password is already modify means we dont need to hash that password 
    if(!this.isModified("password")) return next();
     
    // convert plain text password to hash 
    this.password = await bcrypt.hash(this.password , 10);
    next()
 })

 userSchema.methods.isPasswordCorrect = async function (password) {
     return await bcrypt.compare(password , this.password)
 }

 userSchema.methods.generateAccessToken = function () {
    // payload and secret key
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
          process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
 }
 userSchema.methods.generateRefreshToken = function () {
    // payload and secret key
    return jwt.sign(
        {
            _id: this._id,
        },
          process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
 }


const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };
