import express from "express";
const router = express.Router();
import {isLoggedIn,authorizedRoles} from "../middlewares/auth.middleware.js";
import {
  getAllCourses,
  createCourse,
  getLecturesById,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";

import upload from "../middlewares/multer.middleware.js";
 

router.get("/", getAllCourses);

router.post("/",isLoggedIn,authorizedRoles('ADMIN') , upload.single("thumbnail"), createCourse);

router.get("/:id", isLoggedIn, getLecturesById);
router.put("/:id", isLoggedIn, authorizedRoles('ADMIN') ,updateCourse);
router.delete("/:id", isLoggedIn, authorizedRoles('ADMIN') ,deleteCourse);

export default router;
