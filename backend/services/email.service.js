const nodemailer = require("nodemailer")
const dotenv = require("dotenv")

dotenv.config()

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const EmailService = {
  /**
   * Send verification email with OTP
   * @param {string} to - Recipient email
   * @param {string} otp - One-time password
   * @returns {Promise} - Nodemailer response
   */
  sendVerificationEmail: async (to, otp) => {
    const mailOptions = {
      from: `"CellPhoneS" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Xác thực tài khoản CellPhoneS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #D70018;">CellPhoneS</h1>
          </div>
          <div style="margin-bottom: 20px;">
            <p>Xin chào,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại CellPhoneS. Để hoàn tất quá trình đăng ký, vui lòng nhập mã OTP sau đây:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${otp}</div>
            </div>
            <p>Mã OTP có hiệu lực trong vòng 10 phút.</p>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            <p>&copy; ${new Date().getFullYear()} CellPhoneS. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      `,
    }

    return await transporter.sendMail(mailOptions)
  },
}

module.exports = EmailService

