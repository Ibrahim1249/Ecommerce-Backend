const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
     productID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "ref"
     },
     quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
})

const cartSchema = new mongoose.Schema({
     user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        // required: false  
     },
     items : [cartItemSchema],
     totalAmount : {
        type: Number,
        default: 0
     }
},{timestamps : true})

// add pre hook for calculating the total amount

cartSchema.pre("save" , function(next){
    this.totalAmount = this.items.reduce((accumulator , current)=> accumulator + (current.price * current.quantity),0)
    // here we can a line for discount price if user have applied some coupon code then this would be turn out to this.totalAmount = this.totalAmount - this.discount
    this.totalAmount = this.totalAmount.toFixed(2)
    next()
})

const cartModel = new mongoose.model("cart",cartSchema);

module.exports = { cartModel };