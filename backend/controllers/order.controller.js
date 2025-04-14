const Order = require("../models/order.model")
const db = require("../config/db.config") // Import the database connection

// Lấy tất cả đơn hàng (admin) hoặc đơn hàng của người dùng (khách hàng)
exports.getAllOrders = async (req, res, next) => {
  try {
    // Nếu người dùng không phải admin, chỉ hiển thị đơn hàng của họ
    const userId = req.user.role === "admin" ? null : req.user.id

    const orders = await Order.findAll(userId)

    res.json({
      status: "success",
      data: {
        orders,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Lấy một đơn hàng theo ID
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đơn hàng",
      })
    }

    // Nếu người dùng không phải admin và không phải chủ đơn hàng, từ chối truy cập
    if (req.user.role !== "admin" && order.user_id !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền xem đơn hàng này",
      })
    }

    res.json({
      status: "success",
      data: {
        order,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Tạo đơn hàng mới
exports.createOrder = async (req, res, next) => {
  try {
    const { shipping_address, payment_method, items } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Đơn hàng phải có ít nhất một sản phẩm",
      })
    }

    // Tính tổng tiền
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const { product_id, quantity, price } = item
      totalAmount += price * quantity

      orderItems.push({
        product_id,
        quantity,
        price,
      })
    }

    const orderData = {
      user_id: req.user.id,
      total_amount: totalAmount,
      shipping_address,
      payment_method,
      status: "pending",
      payment_status: "pending",
    }

    const orderId = await Order.create(orderData, orderItems)

    res.status(201).json({
      status: "success",
      message: "Tạo đơn hàng thành công",
      data: {
        id: orderId,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Cập nhật trạng thái đơn hàng (chỉ admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Trạng thái đơn hàng không hợp lệ",
      })
    }

    const success = await Order.updateStatus(req.params.id, status)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đơn hàng hoặc không có thay đổi",
      })
    }

    res.json({
      status: "success",
      message: "Cập nhật trạng thái đơn hàng thành công",
    })
  } catch (error) {
    next(error)
  }
}

// Cập nhật trạng thái thanh toán (chỉ admin)
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { payment_status } = req.body

    if (!["pending", "paid", "failed"].includes(payment_status)) {
      return res.status(400).json({
        status: "error",
        message: "Trạng thái thanh toán không hợp lệ",
      })
    }

    const success = await Order.updatePaymentStatus(req.params.id, payment_status)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đơn hàng hoặc không có thay đổi",
      })
    }

    res.json({
      status: "success",
      message: "Cập nhật trạng thái thanh toán thành công",
    })
  } catch (error) {
    next(error)
  }
}

// Add a new method to delete an order
exports.deleteOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id

    // Get the order to check ownership
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đơn hàng",
      })
    }

    // Check if the user has permission to delete this order
    if (req.user.role !== "admin" && order.user_id !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền xóa đơn hàng này",
      })
    }

    // Check if the order can be deleted (only pending orders)
    if (order.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "Chỉ có thể hủy đơn hàng đang chờ xử lý",
      })
    }

    // Start transaction
    await db.query("START TRANSACTION")

    try {
      // Restore product stock for each item
      for (const item of order.items) {
        // Update product stock
        await db.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [item.quantity, item.product_id])

        // If there are options, update variant stock
        if (item.options) {
          const options = typeof item.options === "string" ? JSON.parse(item.options) : item.options
          const product = await db.query(`SELECT * FROM products WHERE id = ?`, [item.product_id])

          if (product[0][0] && product[0][0].variants) {
            const variants =
              typeof product[0][0].variants === "string" ? JSON.parse(product[0][0].variants) : product[0][0].variants

            // Update stock for phone variants
            if (product[0][0].product_type === "phone" && options.color && options.storage && variants.combinations) {
              const combinationIndex = variants.combinations.findIndex(
                (c) => c.color === options.color && c.storage === options.storage,
              )

              if (combinationIndex !== -1) {
                variants.combinations[combinationIndex].stock += item.quantity
                await db.query(`UPDATE products SET variants = ? WHERE id = ?`, [
                  JSON.stringify(variants),
                  item.product_id,
                ])
              }
            }

            // Update stock for laptop variants
            else if (product[0][0].product_type === "laptop" && options.config && variants.configs) {
              const configIndex = variants.configs.findIndex((c) => c.value === options.config)

              if (configIndex !== -1 && variants.configs[configIndex].stock !== undefined) {
                variants.configs[configIndex].stock += item.quantity
                await db.query(`UPDATE products SET variants = ? WHERE id = ?`, [
                  JSON.stringify(variants),
                  item.product_id,
                ])
              }
            }
          }
        }
      }

      // Delete order items
      await db.query(`DELETE FROM order_items WHERE order_id = ?`, [orderId])

      // Delete payments associated with the order
      await db.query(`DELETE FROM payments WHERE order_id = ?`, [orderId])

      // Delete the order
      await db.query(`DELETE FROM orders WHERE id = ?`, [orderId])

      // Commit transaction
      await db.query("COMMIT")

      res.json({
        status: "success",
        message: "Đơn hàng đã được hủy thành công",
      })
    } catch (error) {
      // Rollback transaction on error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    next(error)
  }
}
