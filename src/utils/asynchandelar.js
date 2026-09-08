

//try catch vala  and it already have error handler

// const asyncHandlar = (fn) => async(req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch(err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }

// promise valal it passes the error to the express next(err)

const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))
        .catch((err) => next(err))
    }
}

export {asyncHandler}