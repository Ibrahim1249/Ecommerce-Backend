const { productModel } = require("../models/product.model");




async function handleCreateProduct(req,res) {
    try {
        const {productName , price , brand , category , stock } = req.body;
        if([productName , price , brand , category , stock ].some((filed)=> filed?.trim() === "")) return res.status(409).json({error : "All field is required"})

        const createdProduct = await productModel.create({
            productName,
            brand,
            price,
            stock,
            category,
        })
        const product = await productModel.findById(createdProduct._id).select("-brand -stock -price -category");
        if(!product) return res.status(500).json({error : "Error while add product "});

        return res.status(201).json({message : "Product is created successfully" , product})
    } catch (error) {
        console.log("error in get wishlist controller " , error);
        return res.status(500).json({error : error.message})
    }
}

module.exports = {handleCreateProduct}