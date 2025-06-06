const mysql = require("mysql2")
const dotenv = require("dotenv")

dotenv.config()

// Tạo pool kết nối
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
})

// Chuyển đổi pool để sử dụng promises
const promisePool = pool.promise()

module.exports = promisePool

