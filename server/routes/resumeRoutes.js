import express from "express";

import userAuth from "../middleware/userAuth.js";

import { getUserResumes } from "../controllers/resumeController.js";

import {
  createResume,
  updateResume,
  deleteResume,
  getResumeById,
  getPublicResumeId
} from "../controllers/resumeController.js";

import upload from "../config/multer.js";

const resumeRouter = express.Router();


// CREATE RESUME
resumeRouter.post("/create", userAuth, createResume);


// UPDATE RESUME
resumeRouter.put(
  "/update/:resumeId",
  userAuth,
  upload.single("image"),
  updateResume
);


// DELETE RESUME
resumeRouter.delete(
  "/delete/:resumeId",
  userAuth,
  deleteResume
);


// GET PRIVATE RESUME
resumeRouter.get(
  "/get/:resumeId",
  userAuth,
  getResumeById
);

resumeRouter.get("/my-resumes", userAuth, getUserResumes);

// GET PUBLIC RESUME
resumeRouter.get(
  "/public/:resumeId",
  getPublicResumeId
);


export default resumeRouter;