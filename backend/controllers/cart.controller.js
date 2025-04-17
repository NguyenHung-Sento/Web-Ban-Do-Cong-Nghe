const Cart = require("../models/cart.model")
const Product = require("../models/product.model")
const ProductVariant = require("../models/product_variant.model")

// Lấy giỏ hàng
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findByUserId(req.user.id)

    res.json({
      status: "success",
      data: {
        cart,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Thêm sản phẩm vào giỏ hàng
exports.addItem = async (req, res, next) => {
  try {
    const { product_id, quantity, options, variant_image } = req.body

    if (!product_id || !quantity || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "ID sản phẩm và số lượng là bắt buộc",
      })
    }

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(product_id)

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    // Parse options nếu là chuỗi
    let parsedOptions = null
    if (options) {
      try {
        parsedOptions = typeof options === "string" ? JSON.parse(options) : options
      } catch (e) {
        return res.status(400).json({
          status: "error",
          message: "Định dạng tùy chọn không hợp lệ",
        })
      }
    }

    // Kiểm tra tồn kho
    const hasStock = await Product.checkStock(product_id, parsedOptions, quantity)
    if (!hasStock) {
      return res.status(400).json({
        status: "error",
        message: "Không đủ số lượng sản phẩm trong kho",
      })
    }

    // Thêm sản phẩm vào giỏ hàng - bao gồm cả variant_image nếu có
    const cart = await Cart.addItem(req.user.id, product_id, quantity, parsedOptions, variant_image)

    res.json({
      status: "success",
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      data: {
        cart,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Số lượng phải lớn hơn 0",
      })
    }

    // Lấy thông tin item trong giỏ hàng
    const cartItem = await Cart.findItemById(itemId)
    if (!cartItem) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      })
    }

    // Kiểm tra quyền truy cập
    const cart = await Cart.findById(cartItem.cart_id)
    if (cart.user_id !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền cập nhật giỏ hàng này",
      })
    }

    // Parse options nếu có
    let parsedOptions = null
    if (cartItem.options) {
      try {
        parsedOptions = typeof cartItem.options === "string" ? JSON.parse(cartItem.options) : cartItem.options
      } catch (e) {
        return res.status(400).json({
          status: "error",
          message: "Định dạng tùy chọn không hợp lệ",
        })
      }
    }

    // Kiểm tra tồn kho
    const hasStock = await Product.checkStock(cartItem.product_id, parsedOptions, quantity)
    if (!hasStock) {
      return res.status(400).json({
        status: "error",
        message: "Không đủ số lượng sản phẩm trong kho",
      })
    }

    // Cập nhật số lượng
    const updated = await Cart.updateItem(itemId, req.user.id, { quantity })

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      })
    }

    const updatedCart = await Cart.findByUserId(req.user.id)

    res.json({
      status: "success",
      message: "Cập nhật giỏ hàng thành công",
      data: {
        cart: updatedCart,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Xóa sản phẩm khỏi giỏ hàng
exports.removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params

    // Lấy thông tin item trong giỏ hàng
    const cartItem = await Cart.findCartItemById(itemId)
    if (!cartItem) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      })
    }

    // Kiểm tra quyền truy cập
    if (cartItem.user_id !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền xóa sản phẩm khỏi giỏ hàng này",
      })
    }

    // Xóa sản phẩm khỏi giỏ hàng
    const removed = await Cart.removeItem(itemId, req.user.id)

    if (!removed) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      })
    }

    const updatedCart = await Cart.findByUserId(req.user.id)

    res.json({
      status: "success",
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
      data: {
        cart: updatedCart,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.clearCart(req.user.id)

    res.json({
      status: "success",
      message: "Xóa giỏ hàng thành công",
      data: {
        cart,
      },
    })
  } catch (error) {
    next(error)
  }
}
