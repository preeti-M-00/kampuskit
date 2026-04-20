import imageKit from "../config/imageKit.js";   // FIXED path
import Resume from "../models/resumeModel.js";
import fs from "fs";


// ================= CREATE RESUME =================
// POST /api/resume/create

export const createResume = async (req, res) => {
  try {

    const userId = req.userId;   // matches your userAuth middleware
    const { title } = req.body;

    const newResume = await Resume.create({
      userId,
      title
    });

    res.status(201).json({
      message: "Resume created successfully",
      resume: newResume
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



// ================= DELETE RESUME =================
// DELETE /api/resume/delete/:resumeId

export const deleteResume = async (req, res) => {

  try {

    const userId = req.userId;
    const { resumeId } = req.params;

    await Resume.findOneAndDelete({
      _id: resumeId,
      userId
    });

    res.json({
      message: "Resume deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// GET ALL RESUMES
export const getUserResumes = async (req, res) => {

  try {

    const resumes = await Resume.find({
      userId: req.userId
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      resumes
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};




// ================= GET PRIVATE RESUME =================
// GET /api/resume/get/:resumeId

export const getResumeById = async (req, res) => {

  try {

    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId
    });

    if (!resume) {

      return res.status(404).json({
        message: "Resume not found"
      });

    }

    res.json({ resume });

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};




// ================= GET PUBLIC RESUME =================
// GET /api/resume/public/:resumeId

export const getPublicResumeId = async (req, res) => {

  try {

    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      public: true
    });

    if (!resume) {

      return res.status(404).json({
        message: "Resume not found"
      });

    }

    res.json({ resume });

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};




// ================= UPDATE RESUME =================
// PUT /api/resume/update/:resumeId

export const updateResume = async (req, res) => {

  try {

    const userId = req.userId;
    const { resumeId } = req.params;

    const { resumeData, removeBackground } = req.body;

    const image = req.file;

    let resumeDataCopy;


    if (typeof resumeData === "string") {

      resumeDataCopy = JSON.parse(resumeData);

    }

    else {

      resumeDataCopy = structuredClone(resumeData);

    }


    // upload image if exists

    if (image) {

      const imageBuffer = fs.createReadStream(image.path);

      const response = await imageKit.files.upload({

        file: imageBuffer,

        fileName: "resume.png",

        folder: "user-resumes",

        transformation: {

          pre:
            "w-300,h-300,fo-face,z-0.75" +
            (removeBackground ? ",e-bgremove" : "")

        }

      });


      resumeDataCopy.personal_info.image = response.url;

    }



    const resume = await Resume.findOneAndUpdate(

      {

        _id: resumeId,

        userId

      },

      resumeDataCopy,

      {

        new: true

      }

    );


    res.json({

      message: "Saved successfully",

      resume

    });


  }

  catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};