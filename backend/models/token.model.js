const db = require("../config/db.config")

const Token = {
  /**
   * Save refresh token to database
   * @param {number} userId - User ID
   * @param {string} refreshToken - Refresh token
   * @param {Date} expiresAt - Expiration date
   * @returns {Promise<boolean>} - Success status
   */
  saveRefreshToken: async (userId, refreshToken, expiresAt) => {
    // Delete any existing refresh tokens for this user
    await db.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId])

    // Save new refresh token
    const [result] = await db.query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [
      userId,
      refreshToken,
      expiresAt,
    ])

    return result.affectedRows > 0
  },

  /**
   * Find refresh token in database
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object|null>} - Token data or null
   */
  findRefreshToken: async (refreshToken) => {
    const [rows] = await db.query("SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()", [refreshToken])

    return rows.length > 0 ? rows[0] : null
  },

  /**
   * Delete refresh token from database
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<boolean>} - Success status
   */
  deleteRefreshToken: async (refreshToken) => {
    const [result] = await db.query("DELETE FROM refresh_tokens WHERE token = ?", [refreshToken])

    return result.affectedRows > 0
  },

  /**
   * Delete all refresh tokens for a user
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  deleteAllUserTokens: async (userId) => {
    const [result] = await db.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId])

    return result.affectedRows > 0
  },
}

module.exports = Token

