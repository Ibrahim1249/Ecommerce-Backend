const express = require("express");
const { mongodbConnect } = require("./src/db");
const { userRouter } = require("./src/routes/user.router");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { productRouter } = require("./src/routes/product.router");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000

app.use(express.json());
app.use(express.urlencoded({extended : false}))
app.use(cookieParser())


mongodbConnect().then(()=>{
    app.listen(port,()=>{
        console.log("server is running on port" , port)
    })
}).catch((error)=>{console.log(error)})


app.use("/api/v1/user",userRouter);
app.use("/api/v1/product",productRouter);
