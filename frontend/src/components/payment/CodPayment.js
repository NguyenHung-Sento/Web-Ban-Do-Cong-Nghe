"use client"

import { useState, useEffect } from "react"
import { FiTruck, FiCheck } from "react-icons/fi"
import PaymentService from "../../services/payment.service"
import Spinner from "../ui/Spinner"

const CodPayment = ({ orderId, amount, onPaymentProcessed, ...props }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const processPayment = async () => {
      // If payment processing has already started, don't process again
      if (props.paymentProcessingStarted) return

      try {
        setLoading(true)
        const response = await PaymentService.processPayment({
          order_id: orderId,
          payment_method: "cod",
        })

        setSuccess(true)
        onPaymentProcessed(response.data.payment_id)
      } catch (error) {
        setError(error.response?.data?.message || "Không thể xử lý thanh toán")
      } finally {
        setLoading(false)
      }
    }

    processPayment()
  }, [orderId, onPaymentProcessed, props.paymentProcessingStarted])

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {success ? <FiCheck className="text-green-500 text-2xl" /> : <FiTruck className="text-green-500 text-2xl" />}
        </div>
        <h3 className="text-xl font-bold mb-2">Thanh toán khi nhận hàng (COD)</h3>
        <p className="text-gray-600">Đơn hàng của bạn đã được xác nhận. Bạn sẽ thanh toán khi nhận được hàng.</p>
      </div>

      <div className="bg-gray-50 rounded-md p-4 mb-6">
        <h4 className="font-medium mb-2">Thông tin thanh toán:</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-medium">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phương thức:</span>
            <span className="font-medium">Thanh toán khi nhận hàng</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h4 className="font-medium text-yellow-700 mb-2">Lưu ý:</h4>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Vui lòng chuẩn bị đúng số tiền khi nhận hàng</li>
          <li>Kiểm tra kỹ sản phẩm trước khi thanh toán</li>
          <li>Giữ lại hóa đơn và biên nhận để đổi/trả hàng khi cần thiết</li>
        </ul>
      </div>
    </div>
  )
}

export default CodPayment
