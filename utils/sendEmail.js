require('dotenv').config();
const nodemailer = require('nodemailer');
const User = require('../models/userModel');

async function sendOtpEmail(email, otp) {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.error("❌ User not found!");
      return { success: false, message: "User not found" };
    }
    if (!user.otp) {
      console.error("❌ No OTP found for this user!");
      return { success: false, message: "No OTP found" };
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS, 
      },
    });
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Your OTP Verification Code",
      text: `Your OTP is: ${user.otp}\nIt will expire in 30 minutes.`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent successfully:", info.response);

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return { success: false, message: error.message };
  }
}

module.exports = sendOtpEmail;
