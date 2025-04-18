const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const { authenticate } = require("../middleware/auth.middleware")
const { validate, registerRules, loginRules } = require("../middleware/validator.middleware")

// Public routes
router.post("/register", registerRules, validate, authController.register)
router.post("/login", loginRules, validate, authController.login)
router.post("/verify-email", authController.verifyEmail)
router.post("/resend-otp", authController.resendOtp)
router.post("/cancel-registration", authController.cancelRegistration)
router.post("/refresh-token", authController.refreshToken)
router.post("/logout", authController.logout)

// Protected routes
router.get("/profile", authenticate, authController.getProfile)
router.put("/profile", authenticate, authController.updateProfile)
router.put("/change-password", authenticate, authController.changePassword)

module.exports = router

