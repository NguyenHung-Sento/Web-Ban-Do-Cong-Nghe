const db = require("../config/db.config")

const Verification = {
  /**
   * Create or update OTP for email verification and store registration data
   * @param {string} email - User email
   * @param {string} otp - One-time password
   * @param {Object} registrationData - User registration data (optional)
   * @returns {Promise<boolean>} - Success status
   */
  createOtp: async (email, otp, registrationData = null) => {
    // OTP expires after 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Delete any existing OTP for this email
    await db.query("DELETE FROM email_verification WHERE email = ?", [email])

    // Create new OTP with registration data if provided
    let registrationDataJson = null

    if (registrationData) {
      try {
        // Only stringify if it's not already a string
        if (typeof registrationData === "object") {
          registrationDataJson = JSON.stringify(registrationData)
        } else {
          registrationDataJson = registrationData
        }
      } catch (error) {
        console.error("Error stringifying registration data:", error)
      }
    }

    const [result] = await db.query(
      "INSERT INTO email_verification (email, otp, registration_data, expires_at) VALUES (?, ?, ?, ?)",
      [email, otp, registrationDataJson, expiresAt],
    )

    return result.affectedRows > 0
  },

  /**
   * Verify OTP for email and get registration data
   * @param {string} email - User email
   * @param {string} otp - One-time password to verify
   * @returns {Promise<Object|null>} - Registration data or null if invalid
   */
  verifyOtp: async (email, otp) => {
    const [rows] = await db.query(
      "SELECT * FROM email_verification WHERE email = ? AND otp = ? AND expires_at > NOW()",
      [email, otp],
    )

    if (rows.length === 0) {
      return null
    }

    let registrationData = null

    // Safely parse the registration_data
    if (rows[0].registration_data) {
      try {
        // Check if it's already an object
        if (typeof rows[0].registration_data === "object" && !Buffer.isBuffer(rows[0].registration_data)) {
          registrationData = rows[0].registration_data
        } else {
          // Try to parse it as JSON
          const dataStr = rows[0].registration_data.toString()
          registrationData = JSON.parse(dataStr)
        }
      } catch (error) {
        console.error("Error parsing registration data:", error)
        return null
      }
    }

    // Delete the OTP after verification
    await db.query("DELETE FROM email_verification WHERE email = ?", [email])

    return registrationData
  },

  /**
   * Get registration data by email without verifying OTP
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - Registration data or null if not found
   */
  getRegistrationData: async (email) => {
    const [rows] = await db.query("SELECT * FROM email_verification WHERE email = ? AND expires_at > NOW()", [email])

    if (rows.length === 0) {
      return null
    }

    let registrationData = null

    // Safely parse the registration_data
    if (rows[0].registration_data) {
      try {
        // Check if it's already an object
        if (typeof rows[0].registration_data === "object" && !Buffer.isBuffer(rows[0].registration_data)) {
          registrationData = rows[0].registration_data
        } else {
          // Try to parse it as JSON
          const dataStr = rows[0].registration_data.toString()
          registrationData = JSON.parse(dataStr)
        }
      } catch (error) {
        console.error("Error parsing registration data:", error)
        return null
      }
    }

    return registrationData
  },
}

module.exports = Verification

