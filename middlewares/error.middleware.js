const errorMiddleware= (error,req,res,next)=>{
    req.stausCode=req.statusCode||500
    req.message=req.message|| "Something wend wrong"
   return  res.status().json({
        success:false,
        message: req.message,
        stack:error.stack

    })
}
export default errorMiddleware