import User from "../models/user.model.js";
import AppError from "../utils/appError.js";

const cookieOptions = {
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // save cookie for 7 days
  httpOnly: true,
};

export const register = async (req, res) => {
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

  await user.save();

  // Generate JWT TOKEN

  user.password = undefined;
  res.status(200).json({
    success: true,
    message: "User Created SuccessFully ",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (email || !password) {
    return next(new AppError("All Fields are required for Login", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.comparePassword(password)) {
    return next(new AppError("Email or password doesnt match", 400));
  }
  const token = await user.generateJWTToken();
  user.password = undefined;
  res.cookie("token", token, cookieOptions);
  res.status(201).json({
    success: true,
    message: "Logged in succes",
    user,
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
