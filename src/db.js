
const mongoose = require("mongoose")
const dotenv = require("dotenv");
dotenv.config();

async function mongodbConnect(){
   try {
      const connectInstance = await mongoose.connect(process.env.MONGO_DB_URL)
      console.log(`\n MongoDB connected !! DB HOST: ${connectInstance.connection.host}`);
   } catch (error) {
       console.log("error from db" , error);
       process.exit(1)
   }
}

module.exports = {mongodbConnect}