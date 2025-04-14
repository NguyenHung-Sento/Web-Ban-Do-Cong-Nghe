const db = require("../config/db.config")

const Order = {
  findAll: async (userId = null) => {
    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `

    const queryParams = []

    if (userId) {
      query += ` WHERE o.user_id = ?`
      queryParams.push(userId)
    }

    query += ` ORDER BY o.created_at DESC`

    const [rows] = await db.query(query, queryParams)
    return rows
  },

  findById: async (id) => {
    const [orderRows] = await db.query(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id],
    )

    if (!orderRows[0]) return null

    const [itemRows] = await db.query(
      `SELECT oi.*, oi.options, p.name as product_name, p.image as product_image 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id],
    )

    const order = orderRows[0]
    order.items = itemRows

    return order
  },

  update: async (id, orderData) => {
    const [result] = await db.query(`UPDATE orders SET ? WHERE id = ?`, [orderData, id])
    return result.affectedRows > 0
  },

  create: async (orderData, orderItems) => {
    // Start transaction
    await db.query("START TRANSACTION")

    try {
      // Insert order
      const [orderResult] = await db.query(`INSERT INTO orders SET ?`, [orderData])

      const orderId = orderResult.insertId

      // Insert order items
      for (const item of orderItems) {
        item.order_id = orderId
        await db.query(`INSERT INTO order_items SET ?`, [item])

        // Update product stock
        await db.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [item.quantity, item.product_id])

        // Nếu có tùy chọn, cập nhật tồn kho cho biến thể
        if (item.options) {
          const options = typeof item.options === "string" ? JSON.parse(item.options) : item.options
          const product = await db.query(`SELECT * FROM products WHERE id = ?`, [item.product_id])

          if (product[0][0] && product[0][0].variants) {
            const variants =
              typeof product[0][0].variants === "string" ? JSON.parse(product[0][0].variants) : product[0][0].variants

            // Cập nhật tồn kho cho điện thoại
            if (product[0][0].product_type === "phone" && options.color && options.storage && variants.combinations) {
              const combinationIndex = variants.combinations.findIndex(
                (c) => c.color === options.color && c.storage === options.storage,
              )

              if (combinationIndex !== -1) {
                variants.combinations[combinationIndex].stock -= item.quantity
                await db.query(`UPDATE products SET variants = ? WHERE id = ?`, [
                  JSON.stringify(variants),
                  item.product_id,
                ])
              }
            }

            // Cập nhật tồn kho cho laptop
            else if (product[0][0].product_type === "laptop" && options.config && variants.configs) {
              const configIndex = variants.configs.findIndex((c) => c.value === options.config)

              if (configIndex !== -1 && variants.configs[configIndex].stock !== undefined) {
                variants.configs[configIndex].stock -= item.quantity
                await db.query(`UPDATE products SET variants = ? WHERE id = ?`, [
                  JSON.stringify(variants),
                  item.product_id,
                ])
              }
            }
          }
        }
      }

      // Commit transaction
      await db.query("COMMIT")

      return orderId
    } catch (error) {
      // Rollback transaction on error
      await db.query("ROLLBACK")
      throw error
    }
  },

  updateStatus: async (id, status) => {
    const [result] = await db.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id])
    return result.affectedRows > 0
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    const [result] = await db.query(`UPDATE orders SET payment_status = ? WHERE id = ?`, [paymentStatus, id])
    return result.affectedRows > 0
  },
}

module.exports = Order
