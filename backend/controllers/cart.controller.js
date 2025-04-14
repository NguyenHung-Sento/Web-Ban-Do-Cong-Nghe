const Product = require("../models/product.model")
const Cart = require("../models/cart.model")

// Cập nhật phương thức addItem để hỗ trợ các tùy chọn sản phẩm và hình ảnh biến thể
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

        // Add variant image to options if provided
        if (variant_image && typeof variant_image === "string") {
          parsedOptions.variantImage = variant_image
        }
      } catch (e) {
        console.error("Error parsing options:", e)
        return res.status(400).json({
          status: "error",
          message: "Định dạng tùy chọn không hợp lệ",
        })
      }
    } else if (variant_image) {
      // If no options but variant_image is provided, create options object
      parsedOptions = { variantImage: variant_image }
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

    try {
      const cart = await Cart.addItem(req.user.id, product_id, quantity, parsedOptions)
      
      cart.items.forEach((item) => {
        // If item has variant image in options, use that instead
        if (item.options && item.options.variantImage) {
          item.image = item.options.variantImage
        }
      })

      res.json({
        status: "success",
        message: "Thêm sản phẩm vào giỏ hàng thành công",
        data: {
          cart,
        },
      })
    } catch (error) {
      console.error("Error in Cart.addItem:", error)
      return res.status(500).json({
        status: "error",
        message: "Lỗi khi thêm vào giỏ hàng: " + error.message,
      })
    }
  } catch (error) {
    console.error("Unexpected error in addItem controller:", error)
    next(error)
  }
}

// Get cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findByUserId(req.user.id)

    // Thêm URL đầy đủ cho hình ảnh sản phẩm và xử lý hình ảnh biến thể
    cart.items.forEach((item) => {
      // If item has variant image in options, use that instead
      if (item.options && item.options.variantImage) {
        item.image = item.options.variantImage
      }
    })

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

// Update cart item
exports.updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Số lượng phải lớn hơn 0",
      })
    }

    const cart = await Cart.updateItem(req.user.id, req.params.itemId, quantity)

    // xử lý hình ảnh biến thể
    cart.items.forEach((item) => {
      // If item has variant image in options, use that instead
      if (item.options && item.options.variantImage) {
        item.image = item.options.variantImage
      }
    })

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

// Remove cart item
exports.removeItem = async (req, res, next) => {
  try {
    const cart = await Cart.removeItem(req.user.id, req.params.itemId)

    // xử lý hình ảnh biến thể
    cart.items.forEach((item) => {
      // If item has variant image in options, use that instead
      if (item.options && item.options.variantImage) {
        item.image = item.options.variantImage
      }
    })

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

// Clear cart
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

