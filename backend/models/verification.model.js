const db = require("../config/db.config")

const Verification = {
  /**
   * Create or update OTP for email verification
   * @param {string} email - User email
   * @param {string} otp - One-time password
   * @returns {Promise<boolean>} - Success status
   */
  createOtp: async (email, otp) => {
    // OTP expires after 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Delete any existing OTP for this email
    await db.query("DELETE FROM email_verification WHERE email = ?", [email])

    // Create new OTP
    const [result] = await db.query("INSERT INTO email_verification (email, otp, expires_at) VALUES (?, ?, ?)", [
      email,
      otp,
      expiresAt,
    ])

    return result.affectedRows > 0
  },

  /**
   * Verify OTP for email
   * @param {string} email - User email
   * @param {string} otp - One-time password to verify
   * @returns {Promise<boolean>} - Verification result
   */
  verifyOtp: async (email, otp) => {
    const [rows] = await db.query(
      "SELECT * FROM email_verification WHERE email = ? AND otp = ? AND expires_at > NOW()",
      [email, otp],
    )

    if (rows.length === 0) {
      return false
    }

    // Delete the OTP after verification
    await db.query("DELETE FROM email_verification WHERE email = ?", [email])

    return true
  },

  /**
   * Mark user as verified
   * @param {string} email - User email
   * @returns {Promise<boolean>} - Success status
   */
  markUserAsVerified: async (email) => {
    const [result] = await db.query("UPDATE users SET is_verified = TRUE WHERE email = ?", [email])

    return result.affectedRows > 0
  },
}

module.exports = Verification

