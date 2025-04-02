const jwt = require("jsonwebtoken")

exports.authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Không có token xác thực",
      })
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Add user info to request
    req.user = decoded

    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token đã hết hạn",
        tokenExpired: true,
      })
    }

    return res.status(401).json({
      status: "error",
      message: "Token không hợp lệ",
    })
  }
}

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền truy cập tài nguyên này",
      })
    }

    next()
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

