const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const { authenticate } = require("../middleware/auth.middleware")
const { validate, registerRules, loginRules } = require("../middleware/validator.middleware")
const passport = require("../config/passport.config")

// Public routes
router.post("/register", registerRules, validate, authController.register)
router.post("/login", loginRules, validate, authController.login)
router.post("/verify-email", authController.verifyEmail)
router.post("/resend-otp", authController.resendOtp)
router.post("/cancel-registration", authController.cancelRegistration)
router.post("/refresh-token", authController.refreshToken)
router.post("/logout", authController.logout)

// Social login routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", {
      failureRedirect: "/api/auth/social-login-failure",
      session: false,
    })(req, res, next)
  },
  authController.socialLoginSuccess,
)

router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }))

router.get(
  "/facebook/callback",
  (req, res, next) => {
    passport.authenticate("facebook", {
      failureRedirect: "/api/auth/social-login-failure",
      session: false,
    })(req, res, next)
  },
  authController.socialLoginSuccess,
)

router.get("/social-login-failure", authController.socialLoginFailure)

// Protected routes
router.get("/profile", authenticate, authController.getProfile)
router.put("/profile", authenticate, authController.updateProfile)
router.put("/change-password", authenticate, authController.changePassword)

module.exports = router
