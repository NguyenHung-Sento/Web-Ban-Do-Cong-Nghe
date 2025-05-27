const db = require("../config/db.config")
const bcrypt = require("bcrypt")

const User = {
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, role, created_at, updated_at, 
       profile_picture, google_id, facebook_id
       FROM users ORDER BY created_at DESC`,
    )
    return rows
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, role, created_at, updated_at, 
       profile_picture, google_id, facebook_id
       FROM users WHERE id = ?`,
      [id],
    )
    return rows[0]
  },

  findByEmail: async (email) => {
    const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [email])
    return rows[0]
  },

  findBySocialId: async (provider, id) => {
    const field = provider === "google" ? "google_id" : "facebook_id"
    const [rows] = await db.query(`SELECT * FROM users WHERE ${field} = ?`, [id])
    return rows[0]
  },

  create: async (userData) => {
    // Hash password if it's not already hashed (for social logins)
    if (userData.password && !userData.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10)
      userData.password = await bcrypt.hash(userData.password, salt)
    }

    const [result] = await db.query(`INSERT INTO users SET ?`, [userData])
    return result.insertId
  },

  update: async (id, userData) => {
    // If password is being updated, hash it
    if (userData.password && !userData.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10)
      userData.password = await bcrypt.hash(userData.password, salt)
    }

    const [result] = await db.query(`UPDATE users SET ? WHERE id = ?`, [userData, id])
    return result.affectedRows > 0
  },

  delete: async (id) => {
    const [result] = await db.query(`DELETE FROM users WHERE id = ?`, [id])
    return result.affectedRows > 0
  },

  comparePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword)
  },

  // Link social account to existing user
  linkSocialAccount: async (userId, provider, socialId, profilePicture) => {
    const field = provider === "google" ? "google_id" : "facebook_id"
    const [result] = await db.query(
      `UPDATE users SET ${field} = ?, profile_picture = COALESCE(profile_picture, ?) WHERE id = ?`,
      [socialId, profilePicture, userId],
    )
    return result.affectedRows > 0
  },
}

module.exports = User
