const { uploadToCloudinary } = require("../middleware/cloudinary.middleware");
const { productModel } = require("../models/product.model");

async function handleCreateProduct(req, res) {
  try {
    const { productName, price, brand, category, stock , description} = req.body;
    if ( [productName, price, brand, category, stock].some( (filed) => filed?.trim() === ""))
      return res.status(409).json({ error: "All field is required" });


    // Check if product images are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one product image is required" });
    }

   // Upload all images to Cloudinary
    const productURLS = await Promise.all(
        req.files.map(async(file)=>{
            const productURL = await uploadToCloudinary(file.path);
            // console.log("Uploaded image URL:", productURL);
            return productURL
        })
    )

    // filter out any failed upload to cloudinary
    const validProductURLs = productURLS.filter((url)=> url !== null)
    if(validProductURLs.length === 0) return res.status(500).json({ error: "Failed to upload all product images" });

       // Create product in database
       const newProduct = {
        productName,
        price: parseFloat(price),
        brand,
        category,
        stock: parseInt(stock),
        productImage: validProductURLs,
        description: description || "" // Optional field
    };

    const createdProduct = await productModel.create(newProduct);
       // Fetch the created product (excluding reviews)
       const product = await productModel.findById(createdProduct._id).select("-review");

   if (!product) {
       return res.status(500).json({ error: "Error while adding product" });
   }

   return res.status(201).json({
       message: "Product created successfully",
       product
   });
  } catch (error) {
    console.log("error in product controller ", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { handleCreateProduct };
