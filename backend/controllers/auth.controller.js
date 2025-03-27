const User = require("../models/user.model")
const jwt = require("jsonwebtoken")
const db = require("../config/db.config")

// Đăng ký người dùng mới
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email đã được sử dụng",
      })
    }

    // Tạo người dùng mới
    const userId = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: "user", // Vai trò mặc định
    })

    res.status(201).json({
      status: "success",
      message: "Đăng ký thành công",
      data: {
        id: userId,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

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

    // Tạo JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    // Loại bỏ mật khẩu khỏi phản hồi
    delete user.password

    res.json({
      status: "success",
      message: "Đăng nhập thành công",
      data: {
        user,
        token,
      },
    })
  } catch (error) {
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
    next(error)
  }
}

// Cập nhật thông tin người dùng
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body

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
    next(error)
  }
}

// Đổi mật khẩu
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

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
    next(error)
  }
}

