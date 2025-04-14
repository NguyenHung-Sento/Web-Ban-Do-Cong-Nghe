const Category = require("../models/category.model")

// Lấy tất cả danh mục
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll()

    res.json({
      status: "success",
      data: {
        categories,
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

