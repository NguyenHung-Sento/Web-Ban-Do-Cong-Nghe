const db = require("../config/db.config")

const Review = {
  findByProductId: async (productId, limit = 10, offset = 0) => {
    // Lấy tất cả đánh giá gốc (không phải reply)
    const [rows] = await db.query(
      `SELECT r.*, u.name as user_name, u.role as user_role
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.parent_id IS NULL
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [productId, limit, offset],
    )

    // Lấy tất cả các reply cho các đánh giá gốc
    if (rows.length > 0) {
      const reviewIds = rows.map((review) => review.id)
      const [replies] = await db.query(
        `SELECT r.*, u.name as user_name, u.role as user_role
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.parent_id IN (?)
         ORDER BY r.created_at ASC`,
        [reviewIds],
      )

      // Gán replies vào đánh giá gốc tương ứng
      rows.forEach((review) => {
        review.replies = replies.filter((reply) => reply.parent_id === review.id)
      })
    }

    return rows
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT r.*, u.name as user_name, u.role as user_role
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
    // Xóa tất cả các reply trước
    await db.query(`DELETE FROM reviews WHERE parent_id = ?`, [id])
    // Sau đó xóa đánh giá gốc
    const [result] = await db.query(`DELETE FROM reviews WHERE id = ?`, [id])
    return result.affectedRows > 0
  },

  countByProductId: async (productId) => {
    const [rows] = await db.query(
      `SELECT COUNT(*) as total FROM reviews 
     WHERE product_id = ? AND parent_id IS NULL AND is_admin_reply IS NULL`,
      [productId],
    )
    return rows[0].total
  },

  getAverageRating: async (productId) => {
    const [rows] = await db.query(
      `SELECT AVG(rating) as average_rating 
     FROM reviews 
     WHERE product_id = ? AND parent_id IS NULL AND is_admin_reply = 0 AND rating IS NOT NULL`,
      [productId],
    )
    return rows[0].average_rating || 0
  },

  getRatingDistribution: async (productId) => {
    const [rows] = await db.query(
      `SELECT rating, COUNT(*) as count
     FROM reviews
     WHERE product_id = ? AND parent_id IS NULL AND is_admin_reply = 0 AND rating IS NOT NULL
     GROUP BY rating
     ORDER BY rating DESC`,
      [productId],
    )
    return rows
  },

  // Kiểm tra xem người dùng đã mua sản phẩm và thanh toán chưa
  checkUserPurchased: async (userId, productId) => {
    const [rows] = await db.query(
      `SELECT o.id, oi.options
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? 
       AND oi.product_id = ? 
       AND o.payment_status = 'paid'
       AND o.status IN ('delivered', 'completed')
       LIMIT 1`,
      [userId, productId],
    )
    return rows.length > 0 ? rows[0] : null
  },

  // Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
  checkUserReviewed: async (userId, productId) => {
    const [rows] = await db.query(`SELECT id FROM reviews WHERE user_id = ? AND product_id = ? AND parent_id IS NULL`, [
      userId,
      productId,
    ])
    return rows.length > 0
  },

  // Lấy đánh giá của người dùng cho sản phẩm
  getUserReview: async (userId, productId) => {
    const [rows] = await db.query(`SELECT * FROM reviews WHERE user_id = ? AND product_id = ? AND parent_id IS NULL`, [
      userId,
      productId,
    ])
    return rows[0]
  },

  // Tìm reply cho một đánh giá
  findReplyByParentId: async (parentId) => {
    const [rows] = await db.query(
      `SELECT r.*, u.name as user_name, u.role as user_role
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.parent_id = ?
       ORDER BY r.created_at ASC`,
      [parentId],
    )
    return rows[0]
  },

  // Tạo reply cho đánh giá
  createReply: async (replyData) => {
    // Đảm bảo rating nằm trong khoảng hợp lệ (1-5)
    if (!replyData.rating || replyData.rating < 1 || replyData.rating > 5) {
      replyData.rating = 5 // Mặc định là 5 sao cho reply của admin
    }

    const [result] = await db.query(`INSERT INTO reviews SET ?`, [replyData])
    return result.insertId
  },

  // Cập nhật reply
  updateReply: async (id, replyData) => {
    const [result] = await db.query(`UPDATE reviews SET ? WHERE id = ?`, [replyData, id])
    return result.affectedRows > 0
  },
}

module.exports = Review
