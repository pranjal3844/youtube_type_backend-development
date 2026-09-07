//require('dotenv').config({path: './env'})
import dotenv from "dotenv"

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";


import connectDB from "./db/index.js";
connectDB()

dotenv.config({
    path: './env'
})














import express from "express";
const app = express();




/* This is our first arpproach 

( async() => {
    try{
        mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("erroe",(error)=>{
            console.log("ERROR: ",error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is running on the port ${process.env.PORT}`);
        })

    }
    catch(error){
        console.error("ERROR: ",error);
        throw error;
    }
})()

*/


