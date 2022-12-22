const express = require("express");
const { 
    registerUser,
    loginUser,
    logout, 
    getUser
} = require("../controllers/userController");
const protect = require("../middleWare/authMiddleware")

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout); // send get request because we're not sending any data and we don't intend to send any data to this route
router.get("/getuser", protect, getUser);


module.exports = router;