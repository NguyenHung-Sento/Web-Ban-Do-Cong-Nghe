const express = require("express")
const router = express.Router()
const paymentController = require("../controllers/payment.controller")
const { authenticate, isAdmin } = require("../middleware/auth.middleware")

// Public routes for payment callbacks
router.get("/vnpay/return", paymentController.vnpayCallback)
router.post("/momo/notify", express.json(), paymentController.momoCallback)

// Protected routes
router.use(authenticate)

// Xử lý thanh toán
router.post("/process", paymentController.processPayment)

// Kiểm tra trạng thái thanh toán
router.get("/check/:order_id", paymentController.checkPaymentStatus)

// Tạo QR code cho chuyển khoản ngân hàng
router.post("/bank-qr", paymentController.generateBankQR)

// Xác nhận thanh toán (chỉ admin)
router.post("/confirm/:payment_id", isAdmin, paymentController.confirmPayment)

module.exports = router
