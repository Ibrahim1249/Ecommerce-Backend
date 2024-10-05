const { default: mongoose } = require("mongoose");
const { cartModel } = require("../models/cart.model");

async function handleUserCart(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { quantity, price } = req.body;

    const itemOject = {
      productID: new mongoose.Types.ObjectId(id),
      quantity,
      price,
    };
    
    // find if the user cart or create the cart if not exist
    const userCart = await cartModel.findOne({ user: userId });

    if (!userCart) {
      userCart = new cartModel({
        user: userId,
        items: [itemOject],
      });
    } else {
       const existingProductIndex = userCart.items.findIndex((product)=> product.productID.toString() === id.toString())
       if(existingProductIndex === -1){
        userCart.items.push(itemOject);
       }else{
          return res.status(400).json({message : "product is already add in cart"})
       }
    }

    const updatedCart = await userCart.save();
    return res
      .status(201)
      .json({ message: "product is added in cart ", cart: updatedCart });
  } catch (error) {
    console.log("error in cart controller ", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleUpdateCartItemQuantity(req, res) {
  try {
    const userId = req.user._id;
    const { productID } = req.params;
    const { action } = req.body; // here action means "increment" or "decrement"

    // first we have to check the action is valid or not
    if (action !== "increment" && action !== "decrement") {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'increment' or 'decrement'." });
    }

    // check correspond to user cart exist of not
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // find the item in the cart
    const cartItem = cart.items.find(
      (item) => item.productID.toString() === productID.toString()
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const quantityChange = action === "increment" ? 1 : -1;

    // Update the cart item quantity
    let updatedCart = await cartModel
      .findOneAndUpdate(
        {
          user: userId,
          "items.productID": new mongoose.Types.ObjectId(productID),
        },
        {
          $inc: { "items.$.quantity": quantityChange },
        },
        {
          new: true,
          runValidators: true,
        }
      )
      .populate({
        path: "items.productID",
        model: "product",
        select: "name price",
      });

     
        // Check if the item quantity became 0 or less and remove it 
        const updatedItem = updatedCart.items.find((item)=> item.productID._id.toString() === productID.toString());
        if(updatedItem && updatedItem.quantity <= 0){
            updatedCart = await cartModel.findOneAndUpdate(
                {user : userId},
                {$pull : {items : {productID : new mongoose.Types.ObjectId(productID) }}},
                {new : true}
            ).populate({
                path: 'items.productID',
                model: 'product',
                select: 'name price'
            })
        }

    await updatedCart.save();
    res
      .status(200)
      .json({ message: "Cart updated successfully", cart: updatedCart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
}

async function handleGetUserCart(req,res) {
    try {
        const userId = req.user._id;
        console.log(userId)
        // const userCart = await cartModel.findOne({user : userId})
        // console.log(userCart)
        // return null
    } catch (error) {
        console.log("Error getting cart:", error);
        res
          .status(500)
          .json({ message: "Error get user cart", error: error.message });
    }
}


module.exports = { handleUserCart, handleUpdateCartItemQuantity , handleGetUserCart };
