import jwt from 'jsonwebtoken'

import AppError from "../utils/appError.js";

const isLoggedIn= async (req,res,next)=>{

    const {token}=req.cookies;
     console.log(token)
    
    if(!token)
    {
   return next(new AppError('Unauthorised,Plz Login',401))
    } 
    const tokenDetails=jwt.verify(token,process.env.JWT_SECRET)
    if(!tokenDetails)
    {
        return next(new AppError('token may xpired',401))
    }
    req.user=tokenDetails;
    next();

}

export default isLoggedIn