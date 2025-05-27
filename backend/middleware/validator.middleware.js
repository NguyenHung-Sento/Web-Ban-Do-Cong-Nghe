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

exports.bannerRules = [
  body("title")
    .notEmpty()
    .withMessage("Tiêu đề banner là bắt buộc")
    .isLength({ max: 255 })
    .withMessage("Tiêu đề không được vượt quá 255 ký tự"),

  body("subtitle")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("Phụ đề không được vượt quá 255 ký tự"),

  body("description")
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage("Mô tả không được vượt quá 1000 ký tự"),

  body("button_text")
    .optional({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage("Văn bản nút không được vượt quá 50 ký tự"),

  body("position").optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage("Vị trí phải là số nguyên không âm"),

  body("is_active")
    .optional()
    .custom((value) => {
      // Accept boolean, string 'true'/'false', or numbers 0/1
      if (typeof value === "boolean") return true
      if (typeof value === "string" && (value === "true" || value === "false")) return true
      if (typeof value === "number" && (value === 0 || value === 1)) return true
      throw new Error("Trạng thái phải là true hoặc false")
    }),

  body("image_url")
    .notEmpty()
    .withMessage("Link hình ảnh banner là bắt buộc")
    .isURL()
    .withMessage("Link hình ảnh phải là URL hợp lệ"),
]