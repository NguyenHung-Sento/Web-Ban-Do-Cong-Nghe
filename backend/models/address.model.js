const db = require("../config/db.config")

const Address = {
  // Lấy tất cả địa chỉ của một user
  findByUserId: async (userId) => {
    const [rows] = await db.query(
      `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [userId],
    )
    return rows
  },

  // Lấy địa chỉ mặc định của user
  findDefaultByUserId: async (userId) => {
    const [rows] = await db.query(`SELECT * FROM addresses WHERE user_id = ? AND is_default = TRUE LIMIT 1`, [userId])
    return rows[0]
  },

  // Lấy địa chỉ theo ID
  findById: async (id) => {
    const [rows] = await db.query(`SELECT * FROM addresses WHERE id = ?`, [id])
    return rows[0]
  },

  // Tạo địa chỉ mới
  create: async (addressData) => {
    // Nếu đây là địa chỉ mặc định, bỏ mặc định của các địa chỉ khác
    if (addressData.is_default) {
      await db.query(`UPDATE addresses SET is_default = FALSE WHERE user_id = ?`, [addressData.user_id])
    }

    const [result] = await db.query(`INSERT INTO addresses SET ?`, [addressData])
    return result.insertId
  },

  // Cập nhật địa chỉ
  update: async (id, addressData) => {
    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (addressData.is_default) {
      const address = await Address.findById(id)
      if (address) {
        await db.query(`UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?`, [address.user_id, id])
      }
    }

    const [result] = await db.query(`UPDATE addresses SET ? WHERE id = ?`, [addressData, id])
    return result.affectedRows > 0
  },

  // Xóa địa chỉ
  delete: async (id) => {
    const [result] = await db.query(`DELETE FROM addresses WHERE id = ?`, [id])
    return result.affectedRows > 0
  },

  // Đặt địa chỉ mặc định
  setDefault: async (id, userId) => {
    // Bỏ mặc định của tất cả địa chỉ khác
    await db.query(`UPDATE addresses SET is_default = FALSE WHERE user_id = ?`, [userId])

    // Đặt địa chỉ này làm mặc định
    const [result] = await db.query(`UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?`, [id, userId])
    return result.affectedRows > 0
  },

  // Kiểm tra quyền sở hữu địa chỉ
  checkOwnership: async (id, userId) => {
    const [rows] = await db.query(`SELECT id FROM addresses WHERE id = ? AND user_id = ?`, [id, userId])
    return rows.length > 0
  },
}

module.exports = Address
