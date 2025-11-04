const express = require("express")
const router = express.Router()
const { login, register, verifyOtp,resendOtp, logout} = require("../controllers/authcontroller")
const { verify } = require("jsonwebtoken")

router.route('/register').post(register)
router.route ('/verify-otp').post(verifyOtp)
router.post("/resend-otp", resendOtp);
router.route('/login').post(login)
router.route('/logout').post(logout);

module.exports =router