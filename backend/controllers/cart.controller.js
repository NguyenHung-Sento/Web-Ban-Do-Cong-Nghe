const Cart = require("../models/cart.model")
const Product = require("../models/product.model")

// Lấy giỏ hàng của người dùng
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

exports.addItem = async (req, res, next) => {
  try {
    const { product_id, quantity, options } = req.body

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

    // Kiểm tra tồn kho dựa trên biến thể
    let availableStock = product.stock

    if (product.variants) {
      const variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants

      // Kiểm tra tồn kho cho sản phẩm điện thoại
      if (product.product_type === "phone" && parsedOptions && parsedOptions.color && parsedOptions.storage) {
        if (variants.combinations) {
          const combination = variants.combinations.find(
            (c) => c.color === parsedOptions.color && c.storage === parsedOptions.storage,
          )
          if (combination) {
            availableStock = combination.stock
          }
        }
      }

      // Kiểm tra tồn kho cho sản phẩm laptop
      else if (product.product_type === "laptop" && parsedOptions && parsedOptions.config) {
        if (variants.configs) {
          const config = variants.configs.find((c) => c.value === parsedOptions.config)
          if (config && config.stock !== undefined) {
            availableStock = config.stock
          }
        }
      }
    }

    if (availableStock < quantity) {
      return res.status(400).json({
        status: "error",
        message: "Không đủ số lượng sản phẩm trong kho",
      })
    }

    const cart = await Cart.addItem(req.user.id, product_id, quantity, parsedOptions)


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
    const { quantity } = req.body
    const { itemId } = req.params

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Số lượng phải ít nhất là 1",
      })
    }

    const cart = await Cart.updateItem(req.user.id, itemId, quantity)

    res.json({
      status: "success",
      message: "Cập nhật giỏ hàng thành công",
      data: {
        cart,
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

    const cart = await Cart.removeItem(req.user.id, itemId)

    res.json({
      status: "success",
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
      data: {
        cart,
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

