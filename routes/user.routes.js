import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";
import cors from "cors";


const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    const uploadLogo = await cloudinary.uploader.upload(
      req.files.logoUrl.tempFilePath,
    );
    

    const newuser = new User({
      _id: new mongoose.Types.ObjectId(),
      email: req.body.email,
      channelName: req.body.channelName,
      phone: req.body.phone,
      password: hashedpassword,
      logoUrl: uploadLogo.secure_url,
      logoId: uploadLogo.public_id,
    });
    const user = await newuser.save();
    res.status(201).json({
      mesaage: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
});

router.post("/login", async (req,res)=>{
    try {
        const existingUser = await User.findOne({email: req.body.email});
        if(!existingUser){
            return  res.status(500).json({
                message: "Failed to login",
                error: error.message,
            });
        }
        const isvalid = await bcrypt.compare(req.body.password , existingUser.password)
        if(!isvalid){return res.status(500).json({message: "Failed to login" })}

        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            phone: existingUser.phone,
            logoId: existingUser.logoId


        }, process.env.JWT_TOKEN,{expiresIn:"2d"});

        res.status(200).json({
            _id: existingUser._id,
            email: existingUser.email,
            channelName: existingUser.channelName,
            phone: existingUser.phone,
            logoId: existingUser.logoId,
            logoUrl: existingUser.logoUrl,
            token:token,
            subscribers: existingUser.subscribers,
            subcribedChannels: existingUser.subscribedChannels
        })
        
    } catch (error) {
            res.status(500).json({
                message: "Failed to login",
                error: error.message,
            });

        
    }
})

export default router;
