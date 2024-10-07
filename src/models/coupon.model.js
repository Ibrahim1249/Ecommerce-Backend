const { default: mongoose } = require("mongoose");


const couponSchema = new mongoose.Schema({
    coupon :{
         type : String,
         unique : true,
         required : true,
    }
})

const couponModel = mongoose.model("coupon" , couponSchema);

module.exports = {couponModel}