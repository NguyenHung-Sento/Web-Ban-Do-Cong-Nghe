const User = require("../models/user.model")
const db = require("../config/db.config")

// Lấy tất cả người dùng (chỉ admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const search = req.query.search || ""
    const role = req.query.role || ""

    let query = `
      SELECT id, name, email, phone, role, created_at, updated_at 
      FROM users 
      WHERE 1=1
    `
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`
    const queryParams = []
    const countParams = []

    // Search filter
    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`
      countQuery += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`
      const searchParam = `%${search}%`
      queryParams.push(searchParam, searchParam, searchParam)
      countParams.push(searchParam, searchParam, searchParam)
    }

    // Role filter
    if (role) {
      query += ` AND role = ?`
      countQuery += ` AND role = ?`
      queryParams.push(role)
      countParams.push(role)
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    const [users] = await db.query(query, queryParams)
    const [countResult] = await db.query(countQuery, countParams)
    const total = countResult[0].total

    res.json({
      status: "success",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// Lấy một người dùng theo ID (chỉ admin)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

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

// Tạo người dùng mới (chỉ admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body

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
      role: role || "user",
    })

    res.status(201).json({
      status: "success",
      message: "Tạo người dùng thành công",
      data: {
        id: userId,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Cập nhật người dùng (chỉ admin)
exports.updateUser = async (req, res, next) => {
  try {
    const success = await User.update(req.params.id, req.body)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng hoặc không có thay đổi",
      })
    }

    res.json({
      status: "success",
      message: "Cập nhật người dùng thành công",
    })
  } catch (error) {
    next(error)
  }
}

// Xóa người dùng (chỉ admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const success = await User.delete(req.params.id)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
      })
    }

    res.json({
      status: "success",
      message: "Xóa người dùng thành công",
    })
  } catch (error) {
    next(error)
  }
}
