const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt =require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
    // console.log('before',req.user) // undefined
    try { 
        // Token 
        const token = req.cookies.token
        if (!token) {
            res.status(401) // Not authorized
            throw new Error("Not authorized, please login")
        }

        //  Verify Token
        const verified = jwt.verify(token, process.env.JWT_SECRET)
            // token เราสร้างมาจากการเอา id ไป gen กับ JWST_SECRET ใน env และใส่วันหมดอายุใน userController.js line 25 แต่เรียกใช้บรรทัดที่ 69 เพราะเป็น function  
        // Get user id from token
        const user = await User.findById(verified.id).select("-password") // select("-password") = ไม่เอา password มาด้วย
        
        if(!user) {
            res.status(401) // Not authorized
            throw new Error("User not found")
        }
        req.user = user // req.user จะให้ data user ที่เราไป findbyid มาซึ่งไม่มี password แก่ route อื่นๆที่ต่อจากมัน
        
        // console.log('after',req.user)
        /* log ได้ประมาณนี้
        {
            _id: new ObjectId("63a0c81a9bc0a669848ab546"),
            name: 'test-04',
            email: 'user_test04@gmail.com',
            photo: 'https://res.cloudinary.com/practicaldev/image/fetch/s--0FRJGdyZ--/c_imagga_scale,f_auto,fl_progressive,h_500,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/epv55hgtsfi8csprpj9u.jpg',
            phone: '+123',
            bio: 'bio',
            createdAt: 2022-12-19T20:22:50.144Z,
            updatedAt: 2022-12-19T20:22:50.144Z,
            __v: 0
        }
        */
        next()

    } catch (error) {
        res.status(401) // Not authorized
        throw new Error("Not authorized, please login")
    }
});


module.exports = protect


/* 
This code is an example of an async middleware function that checks for an authenticated user by verifying a JSON web token (JWT).

The asyncHandler function is a utility that wraps the middleware function in a try-catch block to handle any errors that may occur.

The middleware function first checks for the presence of a token cookie in the request. If the token is not present, the function sends a 401 status code to the client, indicating that the request is not authorized, and throws an error.

If the token is present, the function verifies the token using the jwt.verify method, passing in the token and the secret used to sign the token (process.env.JWT_SECRET). If the token is not valid, the function will throw an error.

If the token is valid, the function queries the database for the user associated with the id in the token's payload. If the user is not found, the function sends a 401 status code to the client and throws an error.

*** อธิบายบรรทัดที่ 24 If the user is found, the user's information (excluding the password) is attached to the request object (req.user) and the request is passed on to the next middleware function or route handler by calling next().

If any errors are thrown in the try block, they will be caught by the catch block, which sends a 401 status code to the client and throws an error.

*/