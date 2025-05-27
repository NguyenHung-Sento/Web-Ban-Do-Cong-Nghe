const Cart = require("../models/cart.model")
const Product = require("../models/product.model")
const ProductVariant = require("../models/product_variant.model")

// Lấy giỏ hàng
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findByUserId(req.user.id)

    // Thêm URL đầy đủ cho hình ảnh sản phẩm
    cart.items.forEach((item) => {
      if (item.image) {
        // Nếu là URL Cloudinary thì không cần thêm host
        if (!item.image.startsWith("http")) {
          item.image = `${req.protocol}://${req.get("host")}/uploads/${item.image}`
        }
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

    // Thêm URL đầy đủ cho hình ảnh sản phẩm
    cart.items.forEach((item) => {
      if (item.image) {
        // Nếu là URL Cloudinary thì không cần thêm host
        if (!item.image.startsWith("http")) {
          item.image = `${req.protocol}://${req.get("host")}/uploads/${item.image}`
        }
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

    // Thêm URL đầy đủ cho hình ảnh sản phẩm
    updatedCart.items.forEach((item) => {
      if (item.image) {
        // Nếu là URL Cloudinary thì không cần thêm host
        if (!item.image.startsWith("http")) {
          item.image = `${req.protocol}://${req.get("host")}/uploads/${item.image}`
        }
      }
    })

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

    // Thêm URL đầy đủ cho hình ảnh sản phẩm
    updatedCart.items.forEach((item) => {
      if (item.image) {
        // Nếu là URL Cloudinary thì không cần thêm host
        if (!item.image.startsWith("http")) {
          item.image = `${req.protocol}://${req.get("host")}/uploads/${item.image}`
        }
      }
    })

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

// Add the mergeCart method
exports.mergeCart = async (req, res) => {
  try {
    const userId = req.user.id
    const { items } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid cart items" })
    }

    // Get the user's current cart
    let cart = await Cart.findByUserId(userId)

    // If user doesn't have a cart yet, create one
    if (!cart) {
      cart = await Cart.create({ user_id: userId })
    }

    // Get current cart items
    const currentCartItems = cart.items || []

    // Process each guest cart item
    for (const guestItem of items) {
      // Extract product info from guest item
      const productId = guestItem.product_id
      const quantity = guestItem.quantity
      const options = guestItem.options || null

      // Check if this product (with same options) already exists in user's cart
      let existingItem = null

      if (options) {
        // For items with options, we need to compare options
        for (const cartItem of currentCartItems) {
          if (cartItem.product_id === productId) {
            const cartItemOptions = cartItem.options ? JSON.parse(cartItem.options) : null

            if (cartItemOptions) {
              // Compare relevant options (excluding variantPrice and variantImage)
              const areOptionsEqual = Object.keys(options)
                .filter((key) => !["variantPrice", "variantImage"].includes(key))
                .every((key) => options[key] === cartItemOptions[key])

              if (areOptionsEqual) {
                existingItem = cartItem
                break
              }
            }
          }
        }
      } else {
        // For items without options, just check product_id
        existingItem = currentCartItems.find((item) => item.product_id === productId && !item.options)
      }

      if (existingItem) {
        // If item exists, update quantity
        await Cart.updateItem(existingItem.id, userId, { quantity: existingItem.quantity + quantity })
      } else {
        // If item doesn't exist, create new cart item
        await Cart.addItem(userId, productId, quantity, options)
      }
    }

    // Get updated cart with items
    const updatedCart = await Cart.findByUserId(userId)

    // Thêm URL đầy đủ cho hình ảnh sản phẩm
    updatedCart.items.forEach((item) => {
      if (item.image) {
        // Nếu là URL Cloudinary thì không cần thêm host
        if (!item.image.startsWith("http")) {
          item.image = `${req.protocol}://${req.get("host")}/uploads/${item.image}`
        }
      }
    })

    res.status(200).json({
      status: "success",
      message: "Cart merged successfully",
      data: {
        cart: updatedCart,
      },
    })
  } catch (error) {
    console.error("Error merging cart:", error)
    res.status(500).json({ status: "error", message: "Failed to merge cart" })
  }
}
