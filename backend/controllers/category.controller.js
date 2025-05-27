const Category = require("../models/category.model")
const db = require("../config/db.config")

// Lấy tất cả danh mục
exports.getAllCategories = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const search = req.query.search || ""

    let query = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE 1=1
    `
    let countQuery = `SELECT COUNT(*) as total FROM categories WHERE 1=1`
    const queryParams = []
    const countParams = []

    // Search filter
    if (search) {
      query += ` AND c.name LIKE ?`
      countQuery += ` AND name LIKE ?`
      const searchParam = `%${search}%`
      queryParams.push(searchParam)
      countParams.push(searchParam)
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    const [categories] = await db.query(query, queryParams)
    const [countResult] = await db.query(countQuery, countParams)
    const total = countResult[0].total

    res.json({
      status: "success",
      data: {
        categories,
        total, // Thêm total vào data level
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

// Lấy một danh mục theo ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy danh mục",
      })
    }

    res.json({
      status: "success",
      data: {
        category,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Lấy một danh mục theo slug
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findBySlug(req.params.slug)

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy danh mục",
      })
    }

    res.json({
      status: "success",
      data: {
        category,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Tạo danh mục mới
exports.createCategory = async (req, res, next) => {
  try {
    const categoryData = { ...req.body }

    const categoryId = await Category.create(categoryData)

    res.status(201).json({
      status: "success",
      message: "Tạo danh mục thành công",
      data: {
        id: categoryId,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Cập nhật danh mục
exports.updateCategory = async (req, res, next) => {
  try {
    const categoryData = { ...req.body }

    // Lấy danh mục hiện tại
    const existingCategory = await Category.findById(req.params.id)

    if (!existingCategory) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy danh mục",
      })
    }

    const success = await Category.update(req.params.id, categoryData)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy danh mục hoặc không có thay đổi",
      })
    }

    res.json({
      status: "success",
      message: "Cập nhật danh mục thành công",
    })
  } catch (error) {
    next(error)
  }
}

// Xóa danh mục
exports.deleteCategory = async (req, res, next) => {
  try {
    // Lấy danh mục hiện tại
    const existingCategory = await Category.findById(req.params.id)

    if (!existingCategory) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy danh mục",
      })
    }

    const success = await Category.delete(req.params.id)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy danh mục",
      })
    }

    res.json({
      status: "success",
      message: "Xóa danh mục thành công",
    })
  } catch (error) {
    next(error)
  }
}
