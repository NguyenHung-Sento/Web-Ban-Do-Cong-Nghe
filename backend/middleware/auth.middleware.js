const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

// Middleware để xác thực người dùng
exports.authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Yêu cầu xác thực",
      })
    }

    const token = authHeader.split(" ")[1]

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Không tìm thấy người dùng",
      })
    }

    // Gắn thông tin người dùng vào request
    req.user = {
      id: user.id,
      role: user.role,
    }

    next()
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token không hợp lệ hoặc đã hết hạn",
    })
  }
}

// Middleware để kiểm tra quyền admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    return res.status(403).json({
      status: "error",
      message: "Yêu cầu quyền admin",
    })
  }
}

