import express from "express";
const router = express.Router();
 
import { getAllCourses,createCourses,getLecturesById} from "../controllers/course.controller.js";
import isLoggedIn from "../middlewares/auth.middleware.js";

router.get('/',getAllCourses);

router.post('/',createCourses)

router.get('/:id',isLoggedIn, getLecturesById)




export default router;