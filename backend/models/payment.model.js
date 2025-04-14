const db = require("../config/db.config")

const Payment = {
  create: async (paymentData) => {
    const [result] = await db.query(`INSERT INTO payments SET ?`, [paymentData])
    return result.insertId
  },

  findByOrderId: async (orderId) => {
    const [rows] = await db.query(`SELECT * FROM payments WHERE order_id = ?`, [orderId])
    return rows
  },

  findById: async (id) => {
    const [rows] = await db.query(`SELECT * FROM payments WHERE id = ?`, [id])
    return rows[0]
  },

  update: async (id, paymentData) => {
    const [result] = await db.query(`UPDATE payments SET ? WHERE id = ?`, [paymentData, id])
    return result.affectedRows > 0
  },

  updateStatus: async (id, status) => {
    const [result] = await db.query(`UPDATE payments SET status = ? WHERE id = ?`, [status, id])
    return result.affectedRows > 0
  },

  // Lấy danh sách tài khoản ngân hàng
  getBankAccounts: async () => {
    const [rows] = await db.query(`SELECT * FROM bank_accounts WHERE is_active = TRUE`)
    return rows
  },

  // Lấy thông tin tài khoản ngân hàng theo ID
  getBankAccountById: async (id) => {
    const [rows] = await db.query(`SELECT * FROM bank_accounts WHERE id = ? AND is_active = TRUE`, [id])
    return rows[0]
  },

  // Tạo mã giao dịch ngẫu nhiên
  generateTransactionId: () => {
    const timestamp = new Date().getTime()
    const randomNum = Math.floor(Math.random() * 1000000)
    return `TXN${timestamp}${randomNum}`
  },

  // Tạo mã đơn hàng
  generateOrderCode: (orderId) => {
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `CPS${year}${month}${day}${orderId.toString().padStart(6, "0")}`
  },
}

module.exports = Payment

