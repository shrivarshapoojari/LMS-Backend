import AppError from "../utils/appError.js"
import Course from "../models/course.model.js"


export const getAllCourses=async (req,res,next)=>{

try{

    const courses= await Course.find({}).select('-lectures')
    if(courses)
    {
        res.status(200).json({
            success:true,
            message:"Couses fetched",
            courses,

        })
    }

}
catch(e){
    return next(new AppError(e.message,500))
}


}

export const createCourses=async(req,res,next)=>{

}

export const getLecturesById=async(req,res,next)=>{
    
    
    try{
        const id =req.params;
        const course=await Course.findById(id);
        if(!course)
        {
            return next(new AppError("No course found",400));
        }
          res.status(200).json({
            success:true,
            message:"Course fetchecd",
            lectures:course.lectures
          })

        
    }
    catch(e){
        return next(new AppError(e.message,500));

    }

}