import express from "express";
import mongoose from "mongoose";


import cloudinary from "../config/cloudinary.js";
import videoModel from "../models/videos.model.js";
import { authmiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/upload", authmiddleware, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    if (!req.files || !req.files.videoUrl || !req.files.thumbnailUrl) {
      return res.status(400).json({
        message: "Video file and thumbnail are required",
      });
    }
    const videoUplaod = await cloudinary.uploader.upload(
      req.files.videoUrl.tempFiles.path,
      { resource_type: "video", folder: "videos" },
    );
    const thumbnailUpload = await cloudinary.uploader.upload(
      req.files.thumbnailUrl.tempFiles.path,
      {
        folder: "thumbnails",
      },
    );
    const newVideo = new videoModel({
      __id: new mongoose.Types.ObjectId(),
      title,
      description,
      user_id: req.user._id,
      videoUrl: videoUpload.secure_url,
      videoId: videoUpload.public_id,
      thumbnailUrl: thumbnailUpload.secure_url,
      thumbnailId: thumbnailUpload.public_id,
      category,
      tags: tags ? tags.split(",") : [],
    });

    await newVideo.save();
    res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed in uploading ",
      error: error.message,
    });
  }
});

router.put("/update/:id", authmiddleware, async (req, res) => {
  try {
    t;
    const { title, description, tags, category } = req.body;
    const video = await videoModel.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }
    if (video.user_id.toString() != req.user_id.toString()) {
      return res.status(403).json({
        message: "You are not the owner of this video",
      });
    }
    if (req.files && req.files.thumbnail) {


      await cloudinary.uploader.destroy(video.thumbnmailId); // Delete old thumbnail

      const thumbnailUpload = await cloudinary.uploader.upload(
        req.files.thumbnail.tempFilePath,
        { folder: "thumbnails" },
      );
      video.thumbnailUrl = thumbnailUpload.secure_url;
      video.thumbnailId = thumbnailUpload.public_id;
    }
    // Update Fields
    video.title = title || video.title;
    video.description = description || video.description;
    video.category = category || video.category;
    video.tags = tags ? tags.split(",") : video.tags;

    await video.save();
    res.status(200).json({ message: "Video updated successfully", video });
  } catch (error) {
    res.status(500).json({
      message: "Failed in updating video",
      error: error.message,
    });
  }
});

router.delete("/delete/:id", authmiddleware, async (req,res)=>{
  try {
    const videoId = req.params.id;
    const video = await videoModel.findById(videoId);
    if(!video){
      return res.status(404).json({
        message: "Video not found",
      }); 
    }
    if(video._user_id.toString() != req.user._id.toString()){
      return res.status(403).json({
        message: "You are not the owner of this video",
      });
    }
    await cloudinary.uploader.destroy(video.videoId,{
      resource_type: "video",
    });
    
    await cloudinary.uploader.destroy(video.thumbnailId);
    await videoModel.findByIdAndDelete(videoId);
    res.status(200).json({
      message: "Video deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed in deleting video",
      error: error.message,
    });
  }  
 }
)

//get your own videos
router.get("/user/:id", authmiddleware , async (req,res)=>{
  try {

    const video = await videoModel.find({user_id:req.params.id}).sort({createdAt:-1})
    res.status(200).json({
    video:video

  })
    
  } catch (error) {
    res.status(500).json({
      message: "Failed in fetching videos",
      error: error.message,
    });
  }
 



})

router.get("/all", authmiddleware, async (req,res)=>{
  try {
    const video = await videoModel.find().sort({createdAt :-1})
    res.status(200).json({
      video:video
    })
  } catch (error) {
   res.status(500).json({
      message: "Failed ",
      error: error.message,
    });
    
    
  }
})
router.get("/category/:category", authmiddleware , async (req,res)=>{
  try {
    const video = (await videoModel.find({category:req.params.category})).toSorted({createdAt:-1});
    res.status(200).json({
      video:video
    })  
  } catch (error) {
      res.status(500).json({
        message: "Failed ",
        error: error.message,
      });
    
  }
})

router.get("/tag/:tag", authmiddleware , async (req,res)=>{
  try {
    const video = (await videoModel.find({tag:req.params.tag})).toSorted({createdAt:-1})
    res.status(200).json({
      video:video
    })
  } catch (error) {
    res.status(500).json({
      message:"failed",
      error:error.message
    })
    
  }
  
})
router.get("/like", authmiddleware, async (req,res)=>{
  try {
    const {videoId} = req.body;
    

    
    
  } catch (error) {
    
  }
})


export default router;
