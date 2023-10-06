import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import cloudinary from "cloudinary"
import fs from 'fs/promises'
import crypto from "crypto"
import sendEmail from "../utils/sendEmail.js";
const cookieOptions = {
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // save cookie for 7 days
  httpOnly: true,
};






export const register = async (req,res,next) => {
  const { fullname, email, password } = req.body;

  console.log(req.body);

  // rejecting if user doesnt enter password or email or name

  if (!fullname || !email || !password) {
    return next(new AppError("All Fields are required", 400));
  }
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError("Email Already Exist", 400));
  }
  const user = await User.create({
    fullname: fullname,
    email: email,
    password: password,
    avatar: {
      public_id: email,
      secure_url: "htts://www.google.com",
    },
  });
  if (!user) {
    return next(new AppError("Registeration Failed ", 400));
  }
   // Upload Image  
   if(req.file)
   {
     try{
           const result = await cloudinary.v2.uploader.upload(req.file.path ,{
            folder:'lms',
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
           })

           if(result)
           {
               user.avatar.public_id=result.public_id;
               user.avatar.secure_url=result.secure_url;
               // after uploading remove file from local server

               
               fs.rm(`uploads/${req.file.filename}`)


           }

     }

    
     catch(e){
           return next(new AppError(e.message,500))
     }

   }



  await user.save();

  // Generate JWT TOKEN
  const token = await user.generateJWTToken();
  
res.cookie('token', token, cookieOptions);
user.password = undefined;
  res.status(200).json({
    success: true,
    message: "User Created SuccessFully ",
    user
  });
};











export const login = async (req, res,next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("All Fields are required for Login", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.comparePassword(password)) {
    return next(new AppError("Email or password doesnt match", 400));
  }
  const token = await user.generateJWTToken();
  user.password = undefined;

  res.cookie('token', token, cookieOptions);

  console.log(token)
  res.status(201).json({
    success: true,
    message: "Logged in succes",
    user,
    token
  });
};





export const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    message: "User Details",
    user,
  });
};

export const forgotPassword=async(req,res,next)=>{

  const {email}=req.body;
  if(!email)
  {
    return next(new AppError("Email is required", 400));

  }

  const user =await User.findOne({email})

  if(!user)
  {
    return next(new AppError("Email doesnt match", 400));
  }

const resetToken = await user.generateResetToken();


 await user.save();

 const resetPasswordUrl=`${process.env.FRONTEND_URL}/api/user/reset/${resetToken}`
 
 const subject ="Reset Password"


 const message= `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;
  console.log(resetPasswordUrl)
try{



  await sendEmail(email,subject,message);
  res.status(200).json({
    success:true,
    message:'Reset Password email sent successfully'
  })
}
catch(e)
{
  user.forgotPasswordExpiry=undefined;
  user.forgotPasswordToken= undefined
  await user.save();

  return next(new AppError(e.message, 500));
  

}

}
export const resetPassword= async(req,res,next)=>{


  const {resetToken}=req.params;
  const {password}=req.body;

  const forgotPasswordToken=crypto
                            .createHash('sha256')
                            .update(resetToken)
                            .digest('hex');
            
const user =await User.findOne({
  forgotPasswordToken,
  forgotPasswordExpiry:{$gt:Date.now()} // checks the token expiry time is greater than current time
})

if(!user)
{
  return next(new AppError("Token is invalid or expired ,try again", 400));
  
}
user.password=password;
user.forgotPasswordExpiry=undefined;
user.forgotPasswordToken=undefined;

await user.save();

res.status(200).json({
  success:true,
  message:"password Reset Success"
})




}



export const changePassword = async (req,res,next)=>{

const {oldPassword,newPassword}=req.body;
const {id}=req.user;
if(!oldPassword || !newPassword)
{
  return next(new AppError("Both old and new password required", 400));
  
}
  const user = await User.findById(id).select('+password');

  if(!user)
  {
    return next(new AppError("User not found try again", 400));
  
  }
  const isPasswordValid=await user.comparePassword(oldPassword)
  if(!isPasswordValid)
  {
    return next(new AppError("Invalid Password", 400));
  
  }

user.password=newPassword;

await user.save();
user.password=undefined;
res.status(200).json({
  success:true,
  message:"Password Changed Successfully"
})
}