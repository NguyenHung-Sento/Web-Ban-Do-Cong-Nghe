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
}

module.exports = Review

