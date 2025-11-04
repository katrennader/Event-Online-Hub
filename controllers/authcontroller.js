const { StatusCodes } = require('http-status-codes')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const otpGenerator = require('otp-generator')
const sendOtpEmail = require("../utils/sendEmail"); // صححي المسار حسب مكان الفايل


// registeration user
const register = async (req, res) => {
  const { username, role, password, email } = req.body;
  if (!username || !role || !password || !email) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, msg: "please provide all requirements" })
  }
  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, msg: "Username is already taken" })
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    })
    otpExpiry = Date.now() + 30 * 60 * 1000   // valid for 30 mins

    const newUser = new User({
      username,
      role,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false
    })
    await newUser.save();
    await sendOtpEmail(newUser.email, newUser.otp); // assuming username = email

    res.status(StatusCodes.CREATED).json({ success: true, msg: "User created successfully! Check your email for OTP." })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, msg: error.message })
  }
}

// verification user 
const verifyOtp = async (req, res) => {
  const { username, otp } = req.body
  if (!username || !otp) {
    return res.status(StatusCodes.BAD_REQUEST)
      .json({ message: "please provide all requirments( username and otp )" })
  }
  const user = await User.findOne({ username })
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND)
      .json({ message: `User with username ${username} not found in system` })
  }
  if (user.isVerified) {
    return res.status(StatusCodes.BAD_REQUEST)
      .json({ message: `User already verified` })
  }
  // invalid or expired otp
  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, msg: 'Invalid or expired OTP' });
  }
  // make verification for this user 
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save()
    ;
  res.status(StatusCodes.OK).json({ success: true, msg: 'User verified successfully!' });
}


// RESEND OTP
const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST)
      .json({ message: "Please provide email" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND)
      .json({ message: `User with email ${email} not found` });
  }

  if (user.isVerified) {
    return res.status(StatusCodes.BAD_REQUEST)
      .json({ message: "User already verified" });
  }

  // generate new OTP
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });
  const otpExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  await sendOtpEmail(user.email, user.otp);

  res.status(StatusCodes.OK)
    .json({ success: true, msg: "New OTP has been sent to your email" });
};



// login function 
const login = async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `User with username ${username} not found ` })
  }

  try {
    const isMatched = await bcrypt.compare(password, user.password)
    if (!isMatched) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Wrong password , please try again" })
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRETS, { expiresIn: "7d" })
    res.status(StatusCodes.OK).json({
      token, user: {
        username: user.username,
        role: user.role,
        email: user.email

      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, msg: error.message })
  }
}
const logout = async (req, res) => {
  // Since JWT is stateless, logout can be handled on the client side by deleting the token.

  res.status(StatusCodes.OK).json({ msg: "User logged out successfully" });
}

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtp,
  logout
}