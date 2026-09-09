import { asyncHandler } from "../utils/asynchandelar.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadonCloaudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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


    const {fullName, email, username, password} = req.body
    console.log("email: ", email);


    // if(fullName === ""){
    //     throw new ApiError(400, "fullname is required")
    // }
    // if(email === ""){

    // }
    // if()
    // if()

    if([fullName, email, username, password].some((field)=> field?.trim === "")

    ){
        throw new ApiError(400,"All fields are required")
    }
    //we can write more validation whatever we like

    const existedUser = User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser) throw new ApiError(409,"user with email or username already exist")


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverimage[0]?.path;

    if(!avatarLocalPath) throw new ApiError(400,"pls upload avatar");

    

    const avatar = await uploadonCloaudinary(avatarLocalPath);
    const coverImage = await uploadonCloaudinary(coverImageLocalPath);

    if(!avatar) throw new ApiError(400,"pls upload avatar");

    const user = await User.create({
        fileName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500,"something went wrong while registering user");


    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )





    
    



})

export {registerUser}