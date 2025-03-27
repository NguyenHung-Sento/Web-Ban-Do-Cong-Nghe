const Cart = require("../models/cart.model")
const Product = require("../models/product.model")

// Lấy giỏ hàng của người dùng
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findByUserId(req.user.id)

    // Thêm URL đầy đủ cho hình ảnh sản phẩm
    cart.items.forEach((item) => {
      if (item.image) {
        item.image = `${req.protocol}://${req.get("host")}/uploads/${item.image}`
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
    const { product_id, quantity } = req.body

    if (!product_id || !quantity || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "ID sản phẩm và số lượng là bắt buộc",
      })
    }

    // Kiểm tra xem sản phẩm có tồn tại và có đủ số lượng không
    const product = await Product.findById(product_id)

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: "error",
        message: "Không đủ số lượng sản phẩm trong kho",
      })
    }

    const cart = await Cart.addItem(req.user.id, product_id, quantity)

    // Thêm URL đầy đủ cho hình ảnh sản phẩm
    cart.items.forEach((item) => {
      if (item.image) {
        item.image = `${req.protocol}://${req.get("host")}/uploads/${item.image}`
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
    const { quantity } = req.body
    const { itemId } = req.params

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Số lượng phải ít nhất là 1",
      })
    }

    const cart = await Cart.updateItem(req.user.id, itemId, quantity)

    // Thêm URL đầy đủ cho hình ảnh sản phẩm
    cart.items.forEach((item) => {
      if (item.image) {
        item.image = `${req.protocol}://${req.get("host")}/uploads/${item.image}`
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

// Xóa sản phẩm khỏi giỏ hàng
exports.removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params

    const cart = await Cart.removeItem(req.user.id, itemId)

    // Thêm URL đầy đủ cho hình ảnh sản phẩm
    cart.items.forEach((item) => {
      if (item.image) {
        item.image = `${req.protocol}://${req.get("host")}/uploads/${item.image}`
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

