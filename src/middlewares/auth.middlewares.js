import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandelar.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async(req,_,next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        console.log("TOKEN:", token)
    
        if(!token){
            throw new ApiError(401,"authorization required");
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid access token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")
    }

    
})