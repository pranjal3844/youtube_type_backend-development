//require('dotenv').config({path: './env'})

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})



connectDB()
.then(()=>{
    app.on("erroe",(error)=>{
            console.log("ERROR: ",error);
            throw error;
    })
    app.listen(process.env.PORT,()=>{
        console.log(`app is running on the port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("mongodb connection is failed",err);
})
















// import express from "express";
// const app = express();




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


