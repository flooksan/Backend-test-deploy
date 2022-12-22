const  mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    name:{
        type: String,
        require: [true, "Please add a name!"] // if user dont input name front will recieve "Please add a name!!"
    },
    email: {
        type: String,
        require: [true, "Please add a email!"],
        unique: true,
        trim: true,
        match: [ // this match for validate email
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valuid email!"
        ]
    },
    password: {
        type: String,
        require: [true, "Please add a word"],
        // validate
        minLength: [6, "Password must be up to 6 characters"],
            // maxLength: [23, "Password must not be more than up to 23 characters"],
    },
    photo: {
        type: String,
        require: [true, "Please add a photo"],
        default: "https://res.cloudinary.com/practicaldev/image/fetch/s--0FRJGdyZ--/c_imagga_scale,f_auto,fl_progressive,h_500,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/epv55hgtsfi8csprpj9u.jpg"
    },
    phone: {
        type: String,
        require: [true, "Please add a photo"],
        default: "+123"
    },
    bio: {
        type: String,
        maxLength: [250, "Bio must not be more than up to 250 characters"],
        default: "bio"
    }
}, {
    timestamps:true,
});

// Encrypt pass before saving to DB เอาไปทำใน model
userSchema.pre("save",async function(next) {
    // ต้องสร้าง function ใส่ class check ว่ามีการ modify password ไหม
    if(!this.isModified("password")) {
        return next();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10); // 1.how long to gen hash pass
    const hashedPassword = await bcrypt.hash(this.password, salt); // 2. hash pass  input arg.1 = password to hash arg.2 = salt
    // this.password ชี้ไปใน class userSchema เพื่อเรียกใช้ตัวนี้
    this.password = hashedPassword;
    next();
});

// declare for access schema and export to use
const User = mongoose.model("User",userSchema);
module.exports = User;