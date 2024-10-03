const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../middleware/cloudinary.middleware");
const { productModel } = require("../models/product.model");
const mongoose = require("mongoose");

async function handleCreateProduct(req, res) {
  try {
    const {
      productName,
      price,
      brand,
      category,
      stock,
      description,
      averageRating,
      review,
    } = req.body;

    if (
      [productName, brand, category].some((field) => field?.trim() === "") ||
      [price, stock].some(
        (field) => field === undefined || field === null || field === ""
      )
    )
      return res.status(409).json({ error: "All field is required" });

    // Check if product images are uploaded
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one product image is required" });
    }

    // Upload all images to Cloudinary
    const productURLS = await Promise.all(
      req.files.map(async (file) => {
        const productURL = await uploadToCloudinary(file.path);
        // console.log("Uploaded image URL:", productURL);
        return productURL;
      })
    );

    // filter out any failed upload to cloudinary
    const validProductURLs = productURLS.filter(
      (url) => url.secureURL !== null
    );
    if (validProductURLs.length === 0)
      return res
        .status(500)
        .json({ error: "Failed to upload all product images" });

    // Create product in database
    const newProduct = {
      productName,
      price: parseFloat(price),
      brand,
      category,
      stock: parseInt(stock),
      productImage: validProductURLs,
      description: description || "",
      review: [],
      averageRating,
    };

    const createdProduct = await productModel.create(newProduct);
    // Fetch the created product (excluding reviews)
    const product = await productModel
      .findById(createdProduct._id)
      .select("-review");

    if (!product) {
      return res.status(500).json({ error: "Error while adding product" });
    }

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.log("error in product controller ", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleUpdateProduct(req, res) {
  try {
    const { id } = req.params;
    let updatedData = { ...req.body };

    // Find the existing product first
    const existingProduct = await productModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    let allProductImages = [...existingProduct.productImage];

    if (req.files) {
      // Upload all images to Cloudinary
      const result = await Promise.all(
        req.files.map(async (file) => {
          const updatedURL = await uploadToCloudinary(file.path);
          return updatedURL;
        })
      );

      // filter out any failed upload to Cloudinary
      const validUpdatedProductURLs = result.filter(
        (url) => url.secureURL !== null
      );
      if (validUpdatedProductURLs.length === 0) {
        return res
          .status(500)
          .json({ error: "Failed to upload the updated product images" });
      }
      allProductImages = [...allProductImages, ...validUpdatedProductURLs];
    }
    updatedData.productImage = allProductImages;
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        $set: updatedData,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log("Error in update product controller", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleDeleteProduct(req, res) {
  try {
    const { id } = req.params;
    const fetchProductToDelete = await productModel.findById(id);
    if (!fetchProductToDelete) {
      return res.status(404).json({ error: "Product not found" });
    }

    // deleting the image from cloudinary as well
    for (const url of fetchProductToDelete.productImage) {
      try {
        await deleteFromCloudinary(url);
      } catch (cloudinaryError) {
        console.error(
          `Failed to delete image from Cloudinary: ${url}`,
          cloudinaryError
        );
      }
    }

    // delete image of review from cloudinary
    for(const review of fetchProductToDelete.reviews){
       if(review.media.length > 0){
           for(const url of review.media){
             try {
                await deleteFromCloudinary(url)
             } catch (error) {
              console.log(`Failed to delete image from Cloudinary: ${url}` , error)
             }
           }
       }
    }

    await productModel.findByIdAndDelete(id);
    return res.json({ message: `product is deleted successfully ${id}` });
  } catch (error) {
    console.log("Error in delete product controller", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleGetAllProduct(req, res) {
  try {
    const allProduct = await productModel.find({});
    if (!allProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json({ productDetails: allProduct });
  } catch (error) {
    console.log("Error in get all product controller", error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleProductReview(req, res) {
  try {
    const { rating, reviewMessage } = req.body;
    let { id } = req.params;
    const userId = req.user._id;
    let validProductURLs = [];

    id = new mongoose.Types.ObjectId(id);

    if (req.files && req.files.length > 0) {
      // Upload all images to Cloudinary
      const productURLS = await Promise.all(
        req.files.map(async (file) => {
          const productURL = await uploadToCloudinary(file.path);
          // console.log("Uploaded image URL:", productURL);
          return productURL;
        })
      );

      // filter out any failed upload to cloudinary
      validProductURLs = productURLS.filter((url) => url.secureURL !== null);
      if (validProductURLs.length === 0)
        return res
          .status(500)
          .json({ error: "Failed to upload all product images" });
    }
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the user has already rated the product
    const existingReviewIndex = product.reviews.findIndex(
      (review) => review.user.toString() === userId.toString()
    );

    let updatedProduct;

    if (existingReviewIndex !== -1) {
      // Update existing review
      product.reviews[existingReviewIndex].reviewMessage =
        reviewMessage || product.reviews[existingReviewIndex].reviewMessage;
      product.reviews[existingReviewIndex].rating =
        rating || product.reviews[existingReviewIndex].rating;

      if (validProductURLs.length > 0) {
        product.reviews[existingReviewIndex].media =
          validProductURLs || product.reviews[existingReviewIndex].media;
      }

      updatedProduct = await product.save();
    } else {
      // add new review
      const reviewObj = {
        user: userId,
        reviewMessage,
        rating: Number(rating),
        media: validProductURLs,
      };

      // Add review and update average rating

      /* one way to do this you save db call  */
      // product.reviews.push(reviewObj);
      // updatedProduct = await product.save();

      updatedProduct = await productModel.findByIdAndUpdate(
        id,
        { $push: { reviews: reviewObj } },
        { new: true, runValidators: true }
      );
    }

    // Recalculate average rating
    const averageRating =
      updatedProduct.reviews.reduce((acc, review) => acc + review.rating, 0) /
      updatedProduct.reviews.length;
    updatedProduct.averageRating = Number(averageRating.toFixed(1));
    await updatedProduct.save();

    res.status(201).json({
      message:
        existingReviewIndex !== -1
          ? "Review updated successfully"
          : "Review added successfully",
      review:
        updatedProduct.reviews[
          existingReviewIndex !== -1
            ? existingReviewIndex
            : updatedProduct.reviews.length - 1
        ],
      averageRating: updatedProduct.averageRating,
    });
  } catch (error) {
    console.error("Error in review controller:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the review" });
  }
}

async function handleDeleteProductReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const product = await productModel.findById(id);
    if (!product)
      return res.status(404).json({ error: "Product is not found " });

    const userReviewIndex = product.reviews.findIndex(
      (review) => review.user.toString() === userId.toString()
    );

    if(userReviewIndex === -1){
       return res.status(404).json({error : "user review is not found"})
    }
        
       // i need to remove the media from cloudinary of that user if user have uploaded any media in review before deleting from database
        for(const url of product.reviews[userReviewIndex].media){
           try {
             await deleteFromCloudinary(url);
           } catch (error) {
             console.log(`Failed to delete image from Cloudinary: ${url}` , error)
           }
        }
        
     product.reviews = [...product.reviews.slice(0,userReviewIndex) , ...product.reviews.slice(userReviewIndex+1)]
    // Recalculate average rating
  
     if(product.reviews.length > 0){
       const averageRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
       product.averageRating = Number(averageRating.toFixed(1));
     }else{
      product.averageRating = 0
     }

    await product.save();


    return res
      .status(200)
      .json({
        message: "You review is deleted successfully ",
        singleProduct: product,
      });
  } catch (error) {
    console.log("error from delete review controller ", error.message);
    res.status(500).json({ error: error.message });
  }
}
async function handleGetSingleProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    if (!product)
      return res.status(404).json({ error: "Product is not found " });

    res
      .status(200)
      .json({ message: "product found successfully ", singleProduct: product });
  } catch (error) {
    console.log("error from single product controller ", error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleGetAllProduct,
  handleProductReview,
  handleGetSingleProduct,
  handleDeleteProductReview,
};
