const { validationResult, body } = require("express-validator")

// Middleware để kiểm tra kết quả validation
exports.validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Dữ liệu không hợp lệ",
      errors: errors.array(),
    })
  }
  next()
}

// Quy tắc validation cho sản phẩm
exports.productRules = [
  body("name").notEmpty().withMessage("Tên sản phẩm là bắt buộc"),
  body("slug").notEmpty().withMessage("Slug sản phẩm là bắt buộc"),
  body("price").isNumeric().withMessage("Giá phải là số"),
  body("stock").isInt({ min: 0 }).withMessage("Số lượng phải là số nguyên không âm"),
  body("category_id").optional().isInt().withMessage("ID danh mục phải là số nguyên"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Trạng thái phải là active hoặc inactive"),
]

// Quy tắc validation cho danh mục
exports.categoryRules = [
  body("name").notEmpty().withMessage("Tên danh mục là bắt buộc"),
  body("slug").notEmpty().withMessage("Slug danh mục là bắt buộc"),
]

// Quy tắc validation cho đăng ký người dùng
exports.registerRules = [
  body("name").notEmpty().withMessage("Tên là bắt buộc"),
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("phone").optional().isMobilePhone().withMessage("Số điện thoại không hợp lệ"),
]

// Quy tắc validation cho đăng nhập
exports.loginRules = [
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password").notEmpty().withMessage("Mật khẩu là bắt buộc"),
]

// Quy tắc validation cho đơn hàng
exports.orderRules = [
  body("shipping_address").notEmpty().withMessage("Địa chỉ giao hàng là bắt buộc"),
  body("payment_method").notEmpty().withMessage("Phương thức thanh toán là bắt buộc"),
  body("items").isArray({ min: 1 }).withMessage("Đơn hàng phải có ít nhất một sản phẩm"),
  body("items.*.product_id").isInt().withMessage("ID sản phẩm phải là số nguyên"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Số lượng phải ít nhất là 1"),
  body("items.*.price").isNumeric().withMessage("Giá phải là số"),
]

// Quy tắc validation cho giỏ hàng
exports.cartItemRules = [
  body("quantity").isInt({ min: 1 }).withMessage("Số lượng phải ít nhất là 1"),
]