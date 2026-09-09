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

export {registerUser}