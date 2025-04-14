const Payment = require("../models/payment.model")
const Order = require("../models/order.model")
const MomoUtil = require("../utils/momo.util")
const VNPayUtil = require("../utils/vnpay.util")
const QRCode = require("qrcode")
const path = require("path")
const fs = require("fs")

// Thêm hàm này vào đầu file, sau các import
function getBankCode(bankName) {
  // Mapping tên ngân hàng sang mã ngân hàng theo chuẩn VietQR
  const bankCodes = {
    Vietcombank: "VCB",
    Agribank: "AGRIBANK",
    BIDV: "BIDV",
    VietinBank: "CTG",
    Techcombank: "TCB",
    "MB Bank": "MB",
    ACB: "ACB",
    VPBank: "VPB",
    TPBank: "TPB",
    Sacombank: "STB",
    HDBank: "HDB",
    OCB: "OCB",
    VIB: "VIB",
    // Thêm các ngân hàng khác nếu cần
  }

  // Tìm mã ngân hàng dựa trên tên
  for (const [name, code] of Object.entries(bankCodes)) {
    if (bankName.toLowerCase().includes(name.toLowerCase())) {
      return code
    }
  }

  // Mặc định trả về VCB nếu không tìm thấy
  return "VCB"
}

// Xử lý thanh toán
exports.processPayment = async (req, res, next) => {
  try {
    const { order_id, payment_method, payment_provider } = req.body

    // Kiểm tra đơn hàng
    const order = await Order.findById(order_id)
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đơn hàng",
      })
    }

    // Kiểm tra quyền truy cập
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền thực hiện thanh toán cho đơn hàng này",
      })
    }

    // Kiểm tra trạng thái thanh toán
    if (order.payment_status === "paid") {
      return res.status(400).json({
        status: "error",
        message: "Đơn hàng này đã được thanh toán",
      })
    }

    // Tạo mã giao dịch
    const transactionId = Payment.generateTransactionId()

    // Xử lý theo phương thức thanh toán
    let paymentData = {}
    let responseData = {}

    switch (payment_method) {
      case "bank_transfer":
        // Lấy thông tin tài khoản ngân hàng
        const bankAccounts = await Payment.getBankAccounts()

        // Tạo mã đơn hàng
        const orderCode = Payment.generateOrderCode(order.id)

        // Tạo nội dung chuyển khoản
        const transferContent = `CPS ${orderCode}`

        paymentData = {
          bank_accounts: bankAccounts,
          order_code: orderCode,
          transfer_content: transferContent,
        }

        responseData = {
          payment_method,
          bank_accounts: bankAccounts.map((bank) => ({
            id: bank.id,
            bank_name: bank.bank_name,
            account_number: bank.account_number,
            account_holder: bank.account_holder,
            bank_branch: bank.bank_branch,
            qr_code: bank.qr_code ? `${req.protocol}://${req.get("host")}/uploads/${bank.qr_code}` : null,
          })),
          order_code: orderCode,
          transfer_content: transferContent,
          amount: order.total_amount,
        }
        break

      case "credit_card":
        // Xử lý thanh toán thẻ tín dụng
        paymentData = {
          card_info: req.body.card_info,
        }

        responseData = {
          payment_method,
          payment_provider,
          transaction_id: transactionId,
          amount: order.total_amount,
        }
        break

      case "momo":
        try {
          // Tạo thanh toán Momo
          const orderInfo = `Thanh toan don hang #${order.id}`
          const momoResponse = await MomoUtil.createPayment(order.id, order.total_amount, orderInfo)

          paymentData = {
            momo_response: momoResponse,
            transaction_id: transactionId,
          }

          responseData = {
            payment_method,
            payment_provider: "momo",
            transaction_id: transactionId,
            pay_url: momoResponse.payUrl,
            amount: order.total_amount,
          }
        } catch (error) {
          console.error("Momo payment error:", error)
          return res.status(500).json({
            status: "error",
            message: "Không thể tạo thanh toán Momo: " + error.message,
          })
        }
        break

      case "vnpay":
        try {
          // Get IP address from request - exactly as in VNPay example
          const ipAddr =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress ||
            "127.0.0.1"

          console.log("Creating VNPay payment with IP:", ipAddr)

          // Create VNPay payment URL
          const orderInfo = `Thanh toan don hang #${order.id}`

          // Ensure amount is a number
          const orderAmount = Number.parseFloat(order.total_amount)
          console.log("Order amount before VNPay processing:", orderAmount)

          const vnpayResponse = VNPayUtil.createPayment(order.id, orderAmount, orderInfo, ipAddr)
          console.log("VNPay response:", vnpayResponse)

          paymentData = {
            vnpay_response: vnpayResponse,
            transaction_id: transactionId,
          }

          responseData = {
            payment_method,
            payment_provider: "vnpay",
            transaction_id: transactionId,
            pay_url: vnpayResponse.paymentUrl,
            amount: order.total_amount,
          }
        } catch (error) {
          console.error("VNPay payment error:", error)
          return res.status(500).json({
            status: "error",
            message: "Không thể tạo thanh toán VNPay: " + error.message,
          })
        }
        break

      case "cod":
        // Thanh toán khi nhận hàng
        paymentData = {
          cod_info: "Thanh toán khi nhận hàng",
        }

        responseData = {
          payment_method,
          amount: order.total_amount,
        }
        break

      default:
        return res.status(400).json({
          status: "error",
          message: "Phương thức thanh toán không hợp lệ",
        })
    }

    // Lưu thông tin thanh toán
    const paymentId = await Payment.create({
      order_id,
      payment_method,
      payment_provider,
      transaction_id: transactionId,
      amount: order.total_amount,
      status: "pending",
      payment_data: JSON.stringify(paymentData),
    })

    // Cập nhật thông tin thanh toán cho đơn hàng
    await Order.update(order_id, {
      payment_method,
      payment_details: JSON.stringify({
        payment_id: paymentId,
        transaction_id: transactionId,
        payment_method,
        payment_provider,
      }),
    })

    res.json({
      status: "success",
      message: "Đã xử lý yêu cầu thanh toán",
      data: {
        payment_id: paymentId,
        ...responseData,
      },
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    next(error)
  }
}

// Xử lý callback từ Momo
exports.momoCallback = async (req, res, next) => {
  try {
    const momoResponse = req.body

    // Verify signature
    const isValidSignature = MomoUtil.verifySignature(momoResponse)
    if (!isValidSignature) {
      console.error("Invalid Momo signature:", momoResponse)
      return res.status(400).json({ message: "Invalid signature" })
    }

    // Check result code
    if (momoResponse.resultCode !== 0) {
      console.error("Momo payment failed:", momoResponse)
      return res.status(400).json({ message: "Payment failed" })
    }

    // Extract order ID from extraData
    const extraData = JSON.parse(Buffer.from(momoResponse.extraData, "base64").toString())
    const orderId = extraData.orderId

    // Update order payment status
    await Order.updatePaymentStatus(orderId, "paid")

    // Find payment by order ID and update status
    const payments = await Payment.findByOrderId(orderId)
    if (payments && payments.length > 0) {
      await Payment.updateStatus(payments[0].id, "completed")

      // Update payment data
      await Payment.update(payments[0].id, {
        payment_data: JSON.stringify({
          ...JSON.parse(payments[0].payment_data),
          momo_callback: momoResponse,
        }),
      })
    }

    // Return success response for IPN
    res.json({ message: "Payment processed successfully" })
  } catch (error) {
    console.error("Momo callback error:", error)
    next(error)
  }
}

// Sửa hàm vnpayCallback để đảm bảo cập nhật trạng thái thanh toán đúng cách
exports.vnpayCallback = async (req, res, next) => {
  try {
    const vnpParams = req.query

    console.log("VNPay callback received:", vnpParams)

    // Verify signature
    const isValidSignature = VNPayUtil.verifyReturnUrl(vnpParams)
    if (!isValidSignature) {
      console.error("Invalid VNPay signature:", vnpParams)
      return res.status(400).json({ message: "Invalid signature" })
    }

    // Check response code
    if (vnpParams.vnp_ResponseCode !== "00") {
      console.error("VNPay payment failed:", vnpParams)
      return res.status(400).json({ message: "Payment failed" })
    }

    // Extract order ID from transaction reference
    const txnRef = vnpParams.vnp_TxnRef
    const orderId = Number.parseInt(txnRef.split("_")[0])

    console.log("Updating payment status for order:", orderId)

    // Update order payment status
    await Order.updatePaymentStatus(orderId, "paid")

    // Find payment by order ID and update status
    const payments = await Payment.findByOrderId(orderId)
    if (payments && payments.length > 0) {
      console.log("Updating payment status for payment:", payments[0].id)
      await Payment.updateStatus(payments[0].id, "completed")

      // Update payment data
      await Payment.update(payments[0].id, {
        payment_data: JSON.stringify({
          ...JSON.parse(payments[0].payment_data),
          vnpay_callback: vnpParams,
        }),
      })
    } else {
      console.error("No payment found for order:", orderId)
    }

    // Redirect to payment return page
    res.redirect(`/payment/return?order_id=${orderId}&status=success`)
  } catch (error) {
    console.error("VNPay callback error:", error)
    next(error)
  }
}

// Xác nhận thanh toán (cho admin)
exports.confirmPayment = async (req, res, next) => {
  try {
    const { payment_id } = req.params

    // Kiểm tra quyền admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền xác nhận thanh toán",
      })
    }

    // Lấy thông tin thanh toán
    const payment = await Payment.findById(payment_id)
    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy thông tin thanh toán",
      })
    }

    // Cập nhật trạng thái thanh toán
    await Payment.updateStatus(payment_id, "completed")

    // Cập nhật trạng thái thanh toán đơn hàng
    await Order.updatePaymentStatus(payment.order_id, "paid")

    res.json({
      status: "success",
      message: "Xác nhận thanh toán thành công",
    })
  } catch (error) {
    next(error)
  }
}

// Thêm hàm kiểm tra trạng thái thanh toán chi tiết hơn
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { order_id } = req.params

    // Kiểm tra đơn hàng
    const order = await Order.findById(order_id)
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đơn hàng",
      })
    }

    // Kiểm tra quyền truy cập
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền kiểm tra thanh toán cho đơn hàng này",
      })
    }

    // Lấy thông tin thanh toán
    const payments = await Payment.findByOrderId(order_id)

    // Log để debug
    console.log("Payment status check for order:", order_id, "Status:", order.payment_status)
    if (payments && payments.length > 0) {
      console.log("Payment details:", {
        payment_id: payments[0].id,
        status: payments[0].status,
        method: payments[0].payment_method,
      })
    }

    res.json({
      status: "success",
      data: {
        order_id,
        payment_status: order.payment_status,
        payments: payments.map((p) => ({
          id: p.id,
          status: p.status,
          payment_method: p.payment_method,
          amount: p.amount,
          created_at: p.created_at,
        })),
      },
    })
  } catch (error) {
    console.error("Payment status check error:", error)
    next(error)
  }
}

// Tạo QR code cho chuyển khoản ngân hàng
exports.generateBankQR = async (req, res, next) => {
  try {
    const { bank_id, order_id } = req.body

    // Kiểm tra đơn hàng
    const order = await Order.findById(order_id)
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đơn hàng",
      })
    }

    // Kiểm tra quyền truy cập
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền tạo QR cho đơn hàng này",
      })
    }

    // Lấy thông tin ngân hàng
    const bank = await Payment.getBankAccountById(bank_id)
    if (!bank) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy thông tin ngân hàng",
      })
    }

    // Tạo mã đơn hàng
    const orderCode = Payment.generateOrderCode(order.id)

    // Tạo nội dung chuyển khoản
    const transferContent = `CPS ${orderCode}`

    // Tạo nội dung QR code theo chuẩn VietQR
    // Format: https://www.vietqr.io/portal/help/api
    const bankCode = getBankCode(bank.bank_name) // Hàm này cần được thêm vào
    const amount = Math.floor(order.total_amount)
    const qrContent = `https://img.vietqr.io/image/${bankCode}-${bank.account_number}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bank.account_holder)}`


    res.json({
      status: "success",
      data: {
        bank_name: bank.bank_name,
        account_number: bank.account_number,
        account_holder: bank.account_holder,
        bank_branch: bank.bank_branch,
        amount: order.total_amount,
        transfer_content: transferContent,
        qr_code: qrContent, // Trả về URL trực tiếp
      },
    })
  } catch (error) {
    next(error)
  }
}
