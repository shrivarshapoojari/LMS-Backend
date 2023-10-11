import express from "express";
const router = express.Router();

import {
  getAllCourses,
  createCourse,
  getLecturesById,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";
import isLoggedIn from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

router.get("/", getAllCourses);

router.post("/", upload.single("thumbnail"), createCourse);

router.get("/:id", isLoggedIn, getLecturesById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;
