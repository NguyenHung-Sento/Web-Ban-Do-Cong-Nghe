const User = require("../models/user.model")
const Verification = require("../models/verification.model")
const Token = require("../models/token.model")
const EmailService = require("../services/email.service")
const jwt = require("jsonwebtoken")
const db = require("../config/db.config")
const crypto = require("crypto")

// Generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  })
}

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  })
}

// Đăng ký người dùng mới - Bước 1: Gửi OTP
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body

    // Validate required fields
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng điền đầy đủ thông tin",
      })
    }

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email đã được sử dụng",
      })
    }

    // Chuẩn bị dữ liệu đăng ký
    const userData = {
      name,
      email,
      password,
      phone,
      address,
      role: "user", // Vai trò mặc định
    }

    // Tạo OTP và lưu dữ liệu đăng ký tạm thời
    const otp = generateOTP()
    await Verification.createOtp(email, otp, userData)

    try {
      await EmailService.sendVerificationEmail(email, otp)
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
      // Continue with registration even if email fails
    }

    res.status(201).json({
      status: "success",
      message: "Vui lòng kiểm tra email để xác thực tài khoản.",
      data: {
        email: email,
        requireVerification: true,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    next(error)
  }
}

// Xác thực OTP và tạo tài khoản
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Email và mã OTP là bắt buộc",
      })
    }

    // Kiểm tra OTP và lấy dữ liệu đăng ký
    const registrationData = await Verification.verifyOtp(email, otp)

    if (!registrationData) {
      return res.status(400).json({
        status: "error",
        message: "Mã OTP không hợp lệ hoặc đã hết hạn",
      })
    }

    // Tạo tài khoản người dùng mới
    try {
      const userId = await User.create(registrationData)

      // Verify that the user was created
      const user = await User.findById(userId)

      if (!user) {
        return res.status(500).json({
          status: "error",
          message: "Không thể tạo tài khoản. Vui lòng thử lại sau.",
        })
      }

      // No longer generating tokens or setting cookies

      res.json({
        status: "success",
        message: "Xác thực email thành công! Tài khoản của bạn đã được tạo.",
        data: {
          email: email,
        },
      })
    } catch (error) {
      console.error("Error creating user:", error)
      return res.status(500).json({
        status: "error",
        message: "Không thể tạo tài khoản. Vui lòng thử lại sau.",
      })
    }
  } catch (error) {
    console.error("Verification error:", error)
    next(error)
  }
}

// Gửi lại mã OTP
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email là bắt buộc",
      })
    }

    // Kiểm tra xem có dữ liệu đăng ký cho email này không
    const registrationData = await Verification.getRegistrationData(email)

    if (!registrationData) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy dữ liệu đăng ký cho email này hoặc đã hết hạn",
      })
    }

    // Tạo OTP mới và gửi email
    const otp = generateOTP()
    await Verification.createOtp(email, otp, registrationData)
    await EmailService.sendVerificationEmail(email, otp)

    res.json({
      status: "success",
      message: "Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.",
    })
  } catch (error) {
    console.error("Resend OTP error:", error)
    next(error)
  }
}

// Cancel registration
exports.cancelRegistration = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email là bắt buộc",
      })
    }

    // Delete the pending registration data
    await db.query("DELETE FROM email_verification WHERE email = ?", [email])

    res.json({
      status: "success",
      message: "Đã hủy đăng ký thành công",
    })
  } catch (error) {
    console.error("Cancel registration error:", error)
    next(error)
  }
}

// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email và mật khẩu là bắt buộc",
      })
    }

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Thông tin đăng nhập không hợp lệ",
      })
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await User.comparePassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Thông tin đăng nhập không hợp lệ",
      })
    }

    // Tạo access token và refresh token
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Lưu refresh token vào database
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await Token.saveRefreshToken(user.id, refreshToken, refreshExpires)

    // Loại bỏ mật khẩu khỏi phản hồi
    delete user.password

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
    })

    res.json({
      status: "success",
      message: "Đăng nhập thành công",
      data: {
        user,
        accessToken,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    next(error)
  }
}

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token không tồn tại",
      })
    }

    // Verify refresh token in database
    const tokenData = await Token.findRefreshToken(refreshToken)
    if (!tokenData) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token không hợp lệ hoặc đã hết hạn",
      })
    }

    // Verify JWT
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)

      // Get user data
      const user = await User.findById(decoded.id)
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Người dùng không tồn tại",
        })
      }

      // Generate new tokens
      const accessToken = generateAccessToken(user)
      const newRefreshToken = generateRefreshToken(user)

      // Update refresh token in database
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await Token.deleteRefreshToken(refreshToken)
      await Token.saveRefreshToken(user.id, newRefreshToken, refreshExpires)

      // Set new refresh token as HTTP-only cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
      })

      res.json({
        status: "success",
        data: {
          accessToken,
        },
      })
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token không hợp lệ",
      })
    }
  } catch (error) {
    console.error("Refresh token error:", error)
    next(error)
  }
}

// Đăng xuất
exports.logout = async (req, res, next) => {
  try {
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (refreshToken) {
      // Delete refresh token from database
      await Token.deleteRefreshToken(refreshToken)
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken")

    res.json({
      status: "success",
      message: "Đăng xuất thành công",
    })
  } catch (error) {
    console.error("Logout error:", error)
    next(error)
  }
}

// Lấy thông tin người dùng hiện tại
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
      })
    }

    res.json({
      status: "success",
      data: {
        user,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    next(error)
  }
}

// Cập nhật thông tin người dùng
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body

    if (!name || !phone || !address) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng điền đầy đủ thông tin",
      })
    }

    const success = await User.update(req.user.id, {
      name,
      phone,
      address,
    })

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng hoặc không có thay đổi",
      })
    }

    res.json({
      status: "success",
      message: "Cập nhật thông tin thành công",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    next(error)
  }
}

// Đổi mật khẩu
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc",
      })
    }

    // Lấy thông tin người dùng kèm mật khẩu
    const [rows] = await db.query(`SELECT * FROM users WHERE id = ?`, [req.user.id])
    const user = rows[0]

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
      })
    }

    // Xác minh mật khẩu hiện tại
    const isPasswordValid = await User.comparePassword(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Mật khẩu hiện tại không chính xác",
      })
    }

    // Cập nhật mật khẩu
    const success = await User.update(req.user.id, {
      password: newPassword,
    })

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng hoặc không có thay đổi",
      })
    }

    res.json({
      status: "success",
      message: "Đổi mật khẩu thành công",
    })
  } catch (error) {
    console.error("Change password error:", error)
    next(error)
  }
}

