const db = require("../config/db.config")

const Review = {
  findByProductId: async (productId, limit = 10, offset = 0) => {
    const [rows] = await db.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [productId, limit, offset],
    )
    return rows
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id],
    )
    return rows[0]
  },

  create: async (reviewData) => {
    const [result] = await db.query(`INSERT INTO reviews SET ?`, [reviewData])
    return result.insertId
  },

  update: async (id, reviewData) => {
    const [result] = await db.query(`UPDATE reviews SET ? WHERE id = ?`, [reviewData, id])
    return result.affectedRows > 0
  },

  delete: async (id) => {
    const [result] = await db.query(`DELETE FROM reviews WHERE id = ?`, [id])
    return result.affectedRows > 0
  },

  countByProductId: async (productId) => {
    const [rows] = await db.query(`SELECT COUNT(*) as total FROM reviews WHERE product_id = ?`, [productId])
    return rows[0].total
  },

  getAverageRating: async (productId) => {
    const [rows] = await db.query(`SELECT AVG(rating) as average_rating FROM reviews WHERE product_id = ?`, [productId])
    return rows[0].average_rating || 0
  },

  getRatingDistribution: async (productId) => {
    const [rows] = await db.query(
      `SELECT rating, COUNT(*) as count
       FROM reviews
       WHERE product_id = ?
       GROUP BY rating
       ORDER BY rating DESC`,
      [productId],
    )
    return rows
  },

  // Kiểm tra xem người dùng đã mua sản phẩm và thanh toán chưa
  checkUserPurchased: async (userId, productId) => {
    const [rows] = await db.query(
      `SELECT o.id 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? 
       AND oi.product_id = ? 
       AND o.payment_status = 'paid'
       AND o.status IN ('delivered', 'completed')
       LIMIT 1`,
      [userId, productId],
    )
    return rows.length > 0
  },

  // Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
  checkUserReviewed: async (userId, productId) => {
    const [rows] = await db.query(`SELECT id FROM reviews WHERE user_id = ? AND product_id = ?`, [userId, productId])
    return rows.length > 0
  },

  // Lấy đánh giá của người dùng cho sản phẩm
  getUserReview: async (userId, productId) => {
    const [rows] = await db.query(`SELECT * FROM reviews WHERE user_id = ? AND product_id = ?`, [userId, productId])
    return rows[0]
  },
}

module.exports = Review
