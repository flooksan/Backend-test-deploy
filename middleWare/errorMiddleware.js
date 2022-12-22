const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500; // ถ้ามีerror และจับ status code จาก controllerได้จะ return statuscode นั้นๆ ถ้าไม่ก็ return 500 server error

    res.status(statusCode);

    res.json({
        message: err.message,
        /*
        Error: Please add and email
            at registerUser (C:\Users\patip\Desktop\learn-workspace\React\mern-workshop-2\backend\controllers\userController.js:11:15)
            at Layer.handle [as handle_request] (C:\Users\patip\Desktop\learn-workspace\React\mern-workshop-2\backend\node_modules\express\lib\router\layer.js:95:5)
        เวลา error จะโชว์แบบด้านบน ไอ่พวก at registerUser ตามด้วย path file กับบรรทัดที่ error เราเรียก ว่า stack ซึ่งเราไม่อยากโชว์ไปที่ production
        อยากให้โชว์แค่เรา ด้านล่างเราเลยสร้าง stack ไว้เก็บ stack พวกนี้โดยสร้าง process.env.NODE_ENV ขึ้นมา
           */
        stack: process.env.NODE_ENV === "development" ? err.stack : null,// if !== development don't want to show error
    })
};

module.exports = errorHandler;