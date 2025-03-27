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
      `SELECT oi.*, p.name as product_name, p.image as product_image 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id],
    )

    const order = orderRows[0]
    order.items = itemRows

    return order
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

