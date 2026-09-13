import { asyncHandler } from "../utils/asynchandelar.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadonCloaudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}


    }catch(error){
        
        throw new ApiError(500,error?.message || 'something went wrong while generating your token')
    }
}


const registerUser = asyncHandler( async(req,res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exist : username or email se,
    // check for images , check for avatar
    // upload  them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res 

    //step-1: get user details from frontend
    const {fullName, email, username, password} = req.body
    //console.log("email: ", email);
    //console.log(req.body);


    // if(fullName === ""){
    //     throw new ApiError(400, "fullname is required")
    // }
    // if(email === ""){...}
    // if()
    // if()

    //step-2: validation - not empty
    if([fullName, email, username, password].some((field)=> field?.trim === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    //we can write more validation whatever we like


    //step-3: check if user already exist : username or email se,
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser) throw new ApiError(409,"user with email or username already exist");


    //step-4: check for images , check for avatar
    //console.log(req.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) throw new ApiError(400,"pls upload avatar");

    
    //step-5: upload  them to cloudinary
    const avatar = await uploadonCloaudinary(avatarLocalPath);
    const coverImage = await uploadonCloaudinary(coverImageLocalPath);

    if(!avatar) throw new ApiError(400,"pls upload avatar");


    //step-6: create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })


    //step-7: remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    //step-8: check for user creation
    if(!createdUser) throw new ApiError(500,"something went wrong while registering user");



    //step-9: return res 
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )


})


const loginUser = asyncHandler( async(req,res) => {
    //req body -> data
    //username or email or both
    //find the user
    //password check
    //access and refresh token
    //send cookie
    //response that you logged in
    
    


    //1. req body - > data
    const {email, username, password} = req.body

    if(!username && !email){
        throw new ApiError(400,'username or password required')
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,'user does not exist')
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(404,'please enter correct password')
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id).select("-password,-refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedinUser,accessToken,refreshToken
            },
            "user logged in sccessfully"
        )
    )




})


const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out sccessfully"))
})


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    try {
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure: true
        }
    
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status()
        .cokkie("accessToken",accessToken)
        .cookie("refersToken",newrefreshToken)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken:newrefreshToken},
                "Access Token refreshed"
            )
        )
    
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }

})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}