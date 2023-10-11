import AppError from "../utils/appError.js";
import Course from "../models/course.model.js";
import fs from "fs/promises";
import cloudinary from "cloudinary";
import upload from "../middlewares/multer.middleware.js";
export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).select("-lectures");
    if (courses) {
      res.status(200).json({
        success: true,
        message: "Couses fetched",
        courses,
      });
    }
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

export const getLecturesById = async (req, res, next) => {
  try {
    const id = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("No course found", 400));
    }
    res.status(200).json({
      success: true,
      message: "Course fetchecd",
      lectures: course.lectures,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy } = req.body;
    if (!title || !description || !category || !createdBy) {
      return next(new AppError("Title and all things required", 400));
    }

    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        public_id: "Dummy",
        secure_url: "Dummy",
      },
    });
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
          // after uploading remove file from local server

          fs.rm(`uploads/${req.file.filename}`);
        }
        await course.save();
        res.status(200).json({
          success: true,
          message: "Coure Created Success",
        });
      } catch (e) {
        return next(new AppError(e.message, 500));
      }
    }
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body, // updates the info given in reqbody
      },
      {
        runValidators: true,
      }
    );

    if (!course) {
      return next(new AppError("No course found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Course Update Success",
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};
export const deleteCourse = async (req, res, next) => {
  try {
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};
