

// const registerUser = async (req,res) => {
//     res.send("Register User")
// };

// const registerUser = async (req,res) => {
//     // Error handler of email
//     if (!req.body.email) {
//         res.status(400);
//         throw new Error("Please add and email");
//     }
//     res.send("Register User")
// };

// -------------------------------------------------------------------------------------------------------


const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt =require("jsonwebtoken");
const bcrypt = require("bcryptjs") 

// Generate Token function
const generateToken =(id) => {
    // gen token ใส่ id และ jwt secret ไป รวมถึงเวลาหมดอายุด้วย ถ้าหมด logout auto
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
}

// Register User
    // ก่อนทำลง npm i express-async-handler ก่อนด้วย  มันเอามาใช้แทน syntax try {} catch (error) {} ของ async
    // Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers.
const registerUser = asyncHandler(async (req,res) => {
   const {name, email, password} = req.body 
   
   // Validation
   if (!name || !email || ! password) {
    res.status(400)
    throw new Error("Please fill in all required fields")
   }
   if (password.length <6) {
    res.status(400)
    throw new Error("Password must be up to 6 characters")
   }
   
   // Check if user email already exists
   const userExists = await User.findOne({email}) //find email email ถูก destructure แล้วสามารถะเขียนแบบนี้ได้เลย
   if (userExists) {
    res.status(400)
    throw new Error("Email has already been registered")
   }

   

            // Encrypt pass before saving to DB เอาไปทำใน model
            // const salt = await bcrypt.genSalt(10) // 1.how long to gen hash pass
            // const hashedPassword = await bcrypt.hash(password, salt) // 2. hash pass  input arg.1 = password to hash arg.2 = salt


   // Create new user
    // จะเห็นว่าเราไม่เอา password มาโชว์ ไม่มีใคร save password ไว้ตรงๆ
   const user = await User.create({ 
    name, email, 
    // password: hashedPassword, มันถูก hash ตอนส่งไปที่หน้า model userSchema หลังบ้าน 
    // ที่ต้องทำแบบนี้เพราะในอนาคตมีการ reset password ด้วยถ้าเราเขียนใน register ก็ต้องไปเขียนซ้ำอีกรอบที่ reset password
    password, // frontend send normal password to backend model for hash
})
    // Generate Token
   const token = generateToken(user._id) // ถ้า user ถูก gen เราจะเอามา gen token ใช้ login อีกที 

    // Send HTTP-only cookie เราจะไม่เก็บ token ใน local storage เพราะไม่ค่อยปลอดภัยเพราะจะทำให้โดน hack ได้เราจะเอาไปเก็บใน cookie แทน
    // name , ตัวแปรที่จะเอามาเก็บใน name , object ที่จะบอกว่าจะเก็บที่ไหน
    res.cookie("token", token, {
        path: "/",
        httpOnly: true, // cookie can use only by web server
        expires: new Date(Date.now() + 1000 * 86400), // expires in 1day
        sameSite: "none",
        secure: true, // make cookie can use only with https
        
    })
        // ลองส่ง cookie ใน insomnia มันจะอยู่ในหน้า Cookies ชื่อว่า token ตามที่เราตั้งไว้

   if (user) {
    const {_id, name, email, photo, phone, bio} = user
    // The HTTP 201 Created success status response code indicates that the request has succeeded
    res.status(201).send({
        // _id: user.id, เขียนแบบ destucture เอาด้านบน
        _id, name, email, photo, phone, bio, token,
        
    })
   } else {
    res.status(400)
    throw new Error("Invalid user data")
   }

});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    // Validate Request
    if (!email || !password) {
        res.status(400)
        throw new Error("Please add email and password");
    }

    // Check if user exists
    const user = await User.findOne({email})
    if (!user) {
        res.status(400)
        throw new Error("User not found, please signup");
    }

    // User exists, check if password is correct
        // use bcrypt to compare password user input on login to user.password we find on database line 108
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    // console.log(passwordIsCorrect)

    // Generate Token
    const token = generateToken(user._id)
    // ส่ง cookie ไปเก็บที่ front 
    res.cookie("token", token, {
        path: "/",
        httpOnly: true, // cookie can use only by web server
        expires: new Date(Date.now() + 1000 * 86400), // expires in 1day
        sameSite: "none",
        secure: true, // make cookie can use only with https
        
    });

    if (user && passwordIsCorrect) {
        // destructure all information like we save before register from user we find on database at line 108
        // And with that we can now know that this user is properly validated ให้ user access to our application or log the user in
        const {  _id, name, email, photo, phone, bio,  } = user; 
        res.status(200).json({
            _id, name, email, photo, phone, bio, token, //token เป็น token ที่เราเก็บไว้
        });
    } else {
        res.status(400)
        throw new Error("Invalid email or password!!");
    }


});

// Logout User
const logout = asyncHandler(async(req, res) => {
    // 2 way to logout 1. frontend delete cookie 2. backend make expire
    res.cookie("token", "", {
        path: "/",
        httpOnly: true, // cookie can use only by web server
        expires: new Date(0), // expires in 1day
        sameSite: "none",
        secure: true, // make cookie can use only with https
        
    })
    return res.status(200).json({ message: "Success Logged Out !" })
});

// Get User Data
const getUser = asyncHandler(async (req, res)=>{
    console.log("getUser : ",req.user); // req.user เป็น req.user ที่ส่งมาจาก protect ของ authMiddleware.js
    const user= await User.findById(req.user._id);

    if (user) {
        const {_id, name, email, photo, phone, bio} = user;
        res.status(201).send({
            _id, name, email, photo, phone, bio, 
            
        });
       } else {
        res.status(400);
        throw new Error("User Not Found")

       }
});

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
};

