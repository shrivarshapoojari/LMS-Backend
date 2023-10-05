const isLoggedIn=(req,res,next)=>{
    const {token}=req.cookies;
    if(!token)
    {
   return next(new AppError('Unauthorised',401))
    } 
    const tokenDetails=jwt.verify(token,process.env.JWT_SECRET)
    if(!tokenDetails)
    {
        return next(new AppError('token may xpired',401))
    }
    req.user=tokenDetails;
    next();

}
module.exports = isLoggedIn