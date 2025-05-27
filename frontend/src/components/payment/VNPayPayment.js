"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiRefreshCw, FiCheck, FiExternalLink } from "react-icons/fi"
import PaymentService from "../../services/payment.service"
import Spinner from "../ui/Spinner"
import { toast } from "react-toastify"

const VNPayPayment = ({ orderId, amount, onPaymentProcessed, ...props }) => {
  const navigate = useNavigate()
  const [payUrl, setPayUrl] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [paymentProcessed, setPaymentProcessed] = useState(false)
  const [paymentId, setPaymentId] = useState(null)

  useEffect(() => {
    const processPayment = async () => {
      if (props.paymentProcessingStarted || paymentProcessed) return

      try {
        setLoading(true)
        console.log("Processing VNPay payment for order:", orderId, "Amount:", amount)

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
          setPaymentId(response.data.payment_id)
          onPaymentProcessed(response.data.payment_id)
          setPaymentProcessed(true)
          toast.success("Đã tạo liên kết thanh toán VNPay!")
        } else {
          throw new Error("Invalid response format from payment service")
        }
      } catch (error) {
        console.error("VNPay payment error:", error)
        const errorMessage = error.response?.data?.message || "Không thể xử lý thanh toán. Vui lòng thử lại sau."
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    processPayment()
  }, [orderId, amount, onPaymentProcessed, props.paymentProcessingStarted, paymentProcessed])

  // Auto-check payment status every 5 seconds
  useEffect(() => {
    if (orderId && paymentStatus !== "paid") {
      const interval = setInterval(() => {
        checkPaymentStatus()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [orderId, paymentStatus])

  const checkPaymentStatus = async () => {
    try {
      setCheckingStatus(true)
      const response = await PaymentService.checkPaymentStatus(orderId)

      setPaymentStatus(response.data.payment_status)

      if (response.data.payment_status === "paid") {
        toast.success("Thanh toán VNPay thành công!")
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
      const errorMsg = "Không thể mở trang thanh toán. URL thanh toán không hợp lệ."
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    try {
      console.log("Opening VNPay payment URL:", payUrl)
      window.open(payUrl, "_blank")
      toast.info("Đã mở trang thanh toán VNPay. Vui lòng hoàn tất thanh toán.")
    } catch (error) {
      console.error("Error opening payment page:", error)
      const errorMsg = "Không thể mở trang thanh toán. Vui lòng kiểm tra cài đặt trình duyệt của bạn."
      setError(errorMsg)
      toast.error(errorMsg)
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
            Thanh toán VNPay của bạn đã được xử lý thành công. Đơn hàng của bạn sẽ được giao trong thời gian sớm nhất.
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
            <li>Hệ thống sẽ tự động cập nhật trạng thái thanh toán</li>
            <li>Hoặc nhấn nút "Kiểm tra trạng thái thanh toán" để cập nhật thủ công</li>
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

      <div className="text-center text-sm text-gray-500">
        Mã giao dịch: {transactionId}
        <br />
        <span className="text-xs">Hệ thống tự động kiểm tra trạng thái mỗi 5 giây</span>
      </div>
    </div>
  )
}

export default VNPayPayment
