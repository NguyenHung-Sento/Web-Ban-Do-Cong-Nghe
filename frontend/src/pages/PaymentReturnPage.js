"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import { clearCart } from "../features/cart/cartSlice"
import { FiCheck, FiX, FiHome, FiPackage } from "react-icons/fi"

const PaymentReturnPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        setLoading(true)

        // Get query parameters
        const params = new URLSearchParams(location.search)
        const paymentType = location.pathname.includes("momo") ? "momo" : "vnpay"

        if (paymentType === "momo") {
          // Process Momo return
          const resultCode = params.get("resultCode")
          const orderId = params.get("orderId").split("_")[1] // Extract order ID from Momo order ID

          if (resultCode === "0") {
            setSuccess(true)
            setMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.")
            setOrderId(orderId)
            dispatch(clearCart())
          } else {
            setSuccess(false)
            setMessage("Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.")
          }
        } else if (paymentType === "vnpay") {
          // Process VNPay return
          const vnp_ResponseCode = params.get("vnp_ResponseCode")
          const vnp_TxnRef = params.get("vnp_TxnRef")
          const orderId = vnp_TxnRef.split("_")[0] // Extract order ID from VNPay transaction reference

          if (vnp_ResponseCode === "00") {
            setSuccess(true)
            setMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.")
            setOrderId(orderId)
            dispatch(clearCart())
          } else {
            setSuccess(false)
            setMessage("Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.")
          }
        }
      } catch (error) {
        console.error("Error processing payment return:", error)
        setSuccess(false)
        setMessage("Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng liên hệ với chúng tôi để được hỗ trợ.")
      } finally {
        setLoading(false)
      }
    }

    processPaymentReturn()
  }, [location, dispatch])

  const handleViewOrder = () => {
    navigate(`/orders`)
  }

  const handleGoHome = () => {
    navigate("/")
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-20">
          <div className="max-w-lg mx-auto text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Đang xử lý kết quả thanh toán...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container-custom py-20">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          {success ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="text-green-500 text-4xl" />
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">Thanh toán thành công!</h1>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiX className="text-red-500 text-4xl" />
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Thanh toán thất bại</h1>
            </>
          )}

          <p className="text-gray-600 mb-8">{message}</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {success && (
              <button onClick={handleViewOrder} className="btn btn-primary flex items-center justify-center">
                <FiPackage className="mr-2" />
                Xem đơn hàng
              </button>
            )}

            <button onClick={handleGoHome} className="btn btn-outline flex items-center justify-center">
              <FiHome className="mr-2" />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PaymentReturnPage
