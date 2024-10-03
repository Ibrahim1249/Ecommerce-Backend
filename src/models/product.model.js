const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    reviewMessage: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    media: {
        type: []
    }
});

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    description : {
        type : String
    },
    productImage: {
        type: []
    },
    reviews: {
        type: [reviewSchema],
        default : []
    },
    averageRating : {
         type : Number,
         default : 0
    } 
});

const productModel = mongoose.model("product", productSchema);
module.exports = { productModel };