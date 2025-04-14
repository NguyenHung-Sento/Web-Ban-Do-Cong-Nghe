"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiRefreshCw, FiCheck, FiExternalLink } from "react-icons/fi"
import PaymentService from "../../services/payment.service"
import Spinner from "../ui/Spinner"

const VNPayPayment = ({ orderId, amount, onPaymentProcessed, ...props }) => {
  const navigate = useNavigate()
  const [payUrl, setPayUrl] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [paymentProcessed, setPaymentProcessed] = useState(false)

  useEffect(() => {
    const processPayment = async () => {
      // If payment processing has already started, don't process again
      if (props.paymentProcessingStarted || paymentProcessed) return

      try {
        setLoading(true)
        console.log("Processing VNPay payment for order:", orderId, "Amount:", amount)

        // Validate amount before sending
        if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
          throw new Error("Invalid amount for payment")
        }

        const response = await PaymentService.processPayment({
          order_id: orderId,
          payment_method: "vnpay",
        })

        console.log("VNPay payment response:", response)

        if (response.data && response.data.pay_url) {
          setPayUrl(response.data.pay_url)
          setTransactionId(response.data.transaction_id || "")
          onPaymentProcessed(response.data.payment_id)
          setPaymentProcessed(true)
        } else {
          throw new Error("Invalid response format from payment service")
        }
      } catch (error) {
        console.error("VNPay payment error:", error)
        setError(error.response?.data?.message || "Không thể xử lý thanh toán. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    processPayment()
  }, [orderId, amount, onPaymentProcessed, props.paymentProcessingStarted, paymentProcessed])

  // Thêm hàm kiểm tra trạng thái thanh toán tự động
  useEffect(() => {
    // Kiểm tra trạng thái thanh toán khi component được tải
    if (orderId) {
      checkPaymentStatus()

      // Thiết lập kiểm tra trạng thái thanh toán mỗi 5 giây
      const intervalId = setInterval(() => {
        checkPaymentStatus()
      }, 5000)

      // Xóa interval khi component unmount
      return () => clearInterval(intervalId)
    }
  }, [orderId])

  // Sửa hàm checkPaymentStatus để cập nhật trạng thái và gọi onPaymentProcessed
  const checkPaymentStatus = async () => {
    try {
      setCheckingStatus(true)
      const response = await PaymentService.checkPaymentStatus(orderId)

      // Cập nhật trạng thái thanh toán
      setPaymentStatus(response.data.payment_status)

      // Nếu thanh toán đã hoàn tất, gọi onPaymentProcessed
      if (response.data.payment_status === "paid") {
        // Tìm payment_id từ danh sách payments
        if (response.data.payments && response.data.payments.length > 0) {
          onPaymentProcessed(response.data.payments[0].id)
        }
      }
    } catch (error) {
      console.error("Không thể kiểm tra trạng thái thanh toán:", error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleOpenPaymentPage = () => {
    if (!payUrl) {
      setError("Không thể mở trang thanh toán. URL thanh toán không hợp lệ.")
      return
    }

    try {
      console.log("Opening VNPay payment URL:", payUrl)
      window.open(payUrl, "_blank")
    } catch (error) {
      console.error("Error opening payment page:", error)
      setError("Không thể mở trang thanh toán. Vui lòng kiểm tra cài đặt trình duyệt của bạn.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
  }

  if (paymentStatus === "paid") {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-500 text-2xl" />
          </div>
          <h3 className="text-xl font-bold mb-2">Thanh toán thành công!</h3>
          <p className="text-gray-600 mb-4">
            Thanh toán của bạn đã được xử lý thành công. Đơn hàng của bạn sẽ được giao trong thời gian sớm nhất.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Thanh toán qua VNPay</h3>

      <div className="mb-6">
        <p className="text-gray-700 mb-2">Số tiền thanh toán:</p>
        <p className="text-2xl font-bold text-primary">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)}
        </p>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4 w-full">
          <p className="text-center mb-4">Nhấn vào nút bên dưới để mở trang thanh toán VNPay</p>
          <button
            onClick={handleOpenPaymentPage}
            className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiExternalLink className="mr-2" /> Mở trang thanh toán VNPay
          </button>
        </div>

        <div className="w-full bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h4 className="font-medium text-blue-700 mb-2">Hướng dẫn thanh toán:</h4>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>Nhấn vào nút "Mở trang thanh toán VNPay" ở trên</li>
            <li>Chọn phương thức thanh toán trên trang VNPay</li>
            <li>Hoàn thành thanh toán theo hướng dẫn</li>
            <li>Sau khi thanh toán xong, quay lại trang này</li>
            <li>Nhấn nút "Kiểm tra trạng thái thanh toán" để cập nhật trạng thái</li>
          </ol>
        </div>

        <button
          onClick={checkPaymentStatus}
          className="flex items-center justify-center w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={checkingStatus}
        >
          {checkingStatus ? (
            <Spinner size="sm" />
          ) : (
            <>
              <FiRefreshCw className="mr-2" /> Kiểm tra trạng thái thanh toán
            </>
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">Mã giao dịch: {transactionId}</div>
    </div>
  )
}

export default VNPayPayment
