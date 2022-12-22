const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// bodyParser help us convert any information that's coming from the body of our frontend or our frontend request
const cors =require("cors");
const userRoute = require("./routes/userRoute");
const errorHandler = require('./middleWare/errorMiddleware');
const morgan = require("morgan");
const cookieParser = require("cookie-parser");


const app = express();

//  Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan("dev"))

// Routes Middleware
app.use("/api/users/v1", userRoute)

// Routes
app.get("/",(req,res)=>{
    res.send("Home Page");
});

//  Error Middleware
app.use(errorHandler); //ไม่ต้องใส่ () ไปที่หลัง errorHandler เราเรียกมันเป็นเป็นการอ้างถึงเฉยๆ ไม่ต้องใส่ () คือให้ app เรียกใช้ธรรมดา

const PORT = process.env.PORT || 5005;

// Connect to DB and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT,() => {
            console.log(`Server Running on port ${PORT}`);
        })
    })
    .catch((err) => console.log(err));

// **MVC pattern of beauty and application create models routes controller