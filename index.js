import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";


import { connectDB } from "./config/db.config.js";
import router from "./routes/user.routes.js";



dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();


app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))


app.use("/api/v1/user", router);


app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
})