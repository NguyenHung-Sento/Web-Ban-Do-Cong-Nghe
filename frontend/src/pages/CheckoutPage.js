"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import { fetchCart, clearCart } from "../features/cart/cartSlice"
import OrderService from "../services/order.service"
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiTruck,
  FiSmartphone,
  FiGlobe,
  FiCreditCard,
  FiArrowLeft,
} from "react-icons/fi"
import BankTransferPayment from "../components/payment/BankTransferPayment"
import CreditCardPayment from "../components/payment/CreditCardPayment"
import MomoPayment from "../components/payment/MomoPayment"
import VNPayPayment from "../components/payment/VNPayPayment"
import CodPayment from "../components/payment/CodPayment"
import PaymentService from "../services/payment.service"

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [paymentId, setPaymentId] = useState(null)
  const [paymentProcessingStarted, setPaymentProcessingStarted] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showCreditCardForm, setShowCreditCardForm] = useState(false)
  const [creditCardPaymentSuccess, setCreditCardPaymentSuccess] = useState(false)

  const { items, totalItems, totalAmount, isLoading } = useSelector((state) => state.cart)
  const { isLoggedIn, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login?redirect=checkout")
      return
    }

    dispatch(fetchCart())
  }, [dispatch, isLoggedIn, navigate])

  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      navigate("/cart")
    }
  }, [items, isLoading, navigate])

  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      payment_method: "cod",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Họ tên là bắt buộc"),
      phone: Yup.string()
        .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
        .required("Số điện thoại là bắt buộc"),
      address: Yup.string().required("Địa chỉ là bắt buộc"),
      payment_method: Yup.string().required("Phương thức thanh toán là bắt buộc"),
    }),
    onSubmit: async (values) => {
      // Prevent multiple submissions
      if (isSubmitting) return

      // Nếu là thẻ tín dụng và chưa thanh toán thành công, không cho phép tiếp tục
      if (values.payment_method === "credit_card" && !creditCardPaymentSuccess) {
        setError("Vui lòng hoàn tất thanh toán thẻ trước khi tiếp tục")
        return
      }

      try {
        setIsSubmitting(true)
        setError(null)

        const orderItems = items.map((item) => {
          // Sử dụng giá biến thể nếu có
          const itemPrice =
            item.options && item.options.variantPrice ? item.options.variantPrice : item.sale_price || item.price

          return {
            product_id: item.product_id,
            quantity: item.quantity,
            price: itemPrice,
            options: item.options ? JSON.stringify(item.options) : null,
          }
        })

        const orderData = {
          shipping_address: `${values.name}, ${values.phone}, ${values.address}`,
          payment_method: values.payment_method,
          items: orderItems,
        }

        const response = await OrderService.createOrder(orderData)

        // Lưu ID đơn hàng và chuyển sang bước thanh toán
        setOrderId(response.data.id)
        setPaymentMethod(values.payment_method)

        // Nếu là VNPay, xử lý thanh toán và chuyển hướng ngay
        if (values.payment_method === "vnpay") {
          const paymentResponse = await PaymentService.processPayment({
            order_id: response.data.id,
            payment_method: "vnpay",
          })

          if (paymentResponse.data && paymentResponse.data.pay_url) {
            // Chuyển hướng người dùng đến trang thanh toán VNPay
            window.location.href = paymentResponse.data.pay_url
            return
          }
        } else {
          // Với các phương thức khác, hiển thị form thanh toán
          setShowPaymentForm(true)
        }
      } catch (error) {
        setError(error.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.")
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const handlePaymentMethodChange = (method) => {
    formik.setFieldValue("payment_method", method)

    // Hiển thị form thẻ tín dụng ngay khi chọn
    if (method === "credit_card") {
      setShowCreditCardForm(true)
      setCreditCardPaymentSuccess(false) // Reset trạng thái thanh toán thẻ
    } else {
      setShowCreditCardForm(false)
      setCreditCardPaymentSuccess(false)
    }
  }

  const handlePaymentProcessed = (paymentId) => {
    if (!paymentId) return
    setPaymentId(paymentId)
    setPaymentProcessingStarted(true)
  }

  const handleCreditCardPaymentSuccess = () => {
    setCreditCardPaymentSuccess(true)
  }

  const handleCompleteOrder = () => {
    // Xóa giỏ hàng và chuyển đến trang đơn hàng
    dispatch(clearCart())
    navigate("/orders")
  }

  const handleGoBack = async () => {
    if (orderId) {
      try {
        // Delete the order from database
        await OrderService.deleteOrder(orderId)
        setOrderId(null)
        setShowPaymentForm(false)
        setPaymentProcessingStarted(false)
      } catch (error) {
        console.error("Error deleting order:", error)
        setError("Không thể hủy đơn hàng. Vui lòng thử lại.")
      }
    } else {
      setShowPaymentForm(false)
    }
  }

  // Hàm định dạng tên tùy chọn
  const formatOptionName = (optionKey, optionValue) => {
    const optionNames = {
      color: "Màu sắc",
      storage: "Dung lượng",
      config: "Cấu hình",
    }

    return `${optionNames[optionKey] || optionKey}: ${optionValue}`
  }

  // Render payment form based on selected method
  const renderPaymentForm = () => {
    if (!showPaymentForm) return null

    switch (paymentMethod) {
      case "bank_transfer":
        return (
          <BankTransferPayment
            orderId={orderId}
            amount={totalAmount}
            onPaymentProcessed={handlePaymentProcessed}
            paymentProcessingStarted={paymentProcessingStarted}
          />
        )
      case "credit_card":
        return (
          <CreditCardPayment
            orderId={orderId}
            amount={totalAmount}
            onPaymentProcessed={handlePaymentProcessed}
            paymentProcessingStarted={paymentProcessingStarted}
          />
        )
      case "momo":
        return (
          <MomoPayment
            orderId={orderId}
            amount={totalAmount}
            onPaymentProcessed={handlePaymentProcessed}
            paymentProcessingStarted={paymentProcessingStarted}
          />
        )
      case "vnpay":
        return (
          <VNPayPayment
            orderId={orderId}
            amount={totalAmount}
            onPaymentProcessed={handlePaymentProcessed}
            paymentProcessingStarted={paymentProcessingStarted}
          />
        )
      case "cod":
        return (
          <CodPayment
            orderId={orderId}
            amount={totalAmount}
            onPaymentProcessed={handlePaymentProcessed}
            paymentProcessingStarted={paymentProcessingStarted}
          />
        )
      default:
        return null
    }
  }

  // Kiểm tra xem nút "Hoàn tất đơn hàng" có được kích hoạt không
  const isCompleteOrderButtonEnabled = () => {
    // Nếu là COD, luôn cho phép hoàn tất
    if (paymentMethod === "cod") return true

    // Với các phương thức khác, chỉ cho phép khi đã thanh toán thành công
    return paymentProcessingStarted
  }

  if (!isLoggedIn || (items.length === 0 && !isLoading)) {
    return null
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="mb-6">Thanh toán</h1>

        {isLoading ? (
          <div className="py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Checkout Form */}
            <div className="lg:w-2/3">
              {!showPaymentForm ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold mb-6">Thông tin giao hàng</h2>

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                  )}

                  <form onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="name" className="form-label">
                        Họ tên
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FiUser className="text-gray-dark" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className={`form-input pl-10 ${
                            formik.touched.name && formik.errors.name ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập họ tên người nhận"
                          {...formik.getFieldProps("name")}
                        />
                      </div>
                      {formik.touched.name && formik.errors.name && (
                        <div className="form-error">{formik.errors.name}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="phone" className="form-label">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FiPhone className="text-gray-dark" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className={`form-input pl-10 ${
                            formik.touched.phone && formik.errors.phone ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập số điện thoại người nhận"
                          {...formik.getFieldProps("phone")}
                        />
                      </div>
                      {formik.touched.phone && formik.errors.phone && (
                        <div className="form-error">{formik.errors.phone}</div>
                      )}
                    </div>

                    <div className="mb-6">
                      <label htmlFor="address" className="form-label">
                        Địa chỉ
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FiMapPin className="text-gray-dark" />
                        </div>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          className={`form-input pl-10 ${
                            formik.touched.address && formik.errors.address ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập địa chỉ giao hàng đầy đủ"
                          {...formik.getFieldProps("address")}
                        />
                      </div>
                      {formik.touched.address && formik.errors.address && (
                        <div className="form-error">{formik.errors.address}</div>
                      )}
                    </div>

                    <h2 className="text-xl font-bold mb-6">Phương thức thanh toán</h2>

                    <div className="space-y-4 mb-6">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formik.values.payment_method === "cod"
                            ? "border-primary bg-primary bg-opacity-5"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => handlePaymentMethodChange("cod")}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="cod"
                            name="payment_method"
                            value="cod"
                            checked={formik.values.payment_method === "cod"}
                            onChange={() => handlePaymentMethodChange("cod")}
                            className="mr-2"
                          />
                          <label htmlFor="cod" className="flex items-center cursor-pointer">
                            <FiTruck className="mr-2 text-xl" />
                            <div>
                              <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                              <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formik.values.payment_method === "bank_transfer"
                            ? "border-primary bg-primary bg-opacity-5"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => handlePaymentMethodChange("bank_transfer")}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="bank_transfer"
                            name="payment_method"
                            value="bank_transfer"
                            checked={formik.values.payment_method === "bank_transfer"}
                            onChange={() => handlePaymentMethodChange("bank_transfer")}
                            className="mr-2"
                          />
                          <label htmlFor="bank_transfer" className="flex items-center cursor-pointer">
                            <FiDollarSign className="mr-2 text-xl" />
                            <div>
                              <div className="font-medium">Chuyển khoản ngân hàng</div>
                              <div className="text-sm text-gray-500">Thanh toán bằng chuyển khoản qua ngân hàng</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formik.values.payment_method === "credit_card"
                            ? "border-primary bg-primary bg-opacity-5"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => handlePaymentMethodChange("credit_card")}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="credit_card"
                            name="payment_method"
                            value="credit_card"
                            checked={formik.values.payment_method === "credit_card"}
                            onChange={() => handlePaymentMethodChange("credit_card")}
                            className="mr-2"
                          />
                          <label htmlFor="credit_card" className="flex items-center cursor-pointer">
                            <FiCreditCard className="mr-2 text-xl" />
                            <div>
                              <div className="font-medium">Thẻ tín dụng/ghi nợ</div>
                              <div className="text-sm text-gray-500">Thanh toán bằng thẻ Visa, MasterCard, JCB</div>
                            </div>
                          </label>
                        </div>

                        {/* Hiển thị form thẻ tín dụng ngay khi chọn */}
                        {showCreditCardForm && formik.values.payment_method === "credit_card" && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <CreditCardPayment
                              amount={totalAmount}
                              onPaymentProcessed={(paymentId) => {
                                setPaymentId(paymentId)
                                setPaymentProcessingStarted(true)
                                handleCreditCardPaymentSuccess()
                              }}
                              paymentProcessingStarted={paymentProcessingStarted}
                              inlineForm={true}
                            />
                          </div>
                        )}
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formik.values.payment_method === "momo"
                            ? "border-primary bg-primary bg-opacity-5"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => handlePaymentMethodChange("momo")}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="momo"
                            name="payment_method"
                            value="momo"
                            checked={formik.values.payment_method === "momo"}
                            onChange={() => handlePaymentMethodChange("momo")}
                            className="mr-2"
                          />
                          <label htmlFor="momo" className="flex items-center cursor-pointer">
                            <FiSmartphone className="mr-2 text-xl" />
                            <div>
                              <div className="font-medium">Ví MoMo</div>
                              <div className="text-sm text-gray-500">Thanh toán bằng ví điện tử MoMo</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formik.values.payment_method === "vnpay"
                            ? "border-primary bg-primary bg-opacity-5"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => handlePaymentMethodChange("vnpay")}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="vnpay"
                            name="payment_method"
                            value="vnpay"
                            checked={formik.values.payment_method === "vnpay"}
                            onChange={() => handlePaymentMethodChange("vnpay")}
                            className="mr-2"
                          />
                          <label htmlFor="vnpay" className="flex items-center cursor-pointer">
                            <FiGlobe className="mr-2 text-xl" />
                            <div>
                              <div className="font-medium">VNPay</div>
                              <div className="text-sm text-gray-500">
                                Thanh toán qua cổng thanh toán VNPay (ATM, Visa, MasterCard, JCB, QR Code)
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Nút xác nhận đơn hàng - vô hiệu hóa khi chọn thẻ tín dụng nhưng chưa thanh toán thành công */}
                    <button
                      type="submit"
                      className={`btn w-full ${
                        formik.values.payment_method === "credit_card" && !creditCardPaymentSuccess
                          ? "btn-disabled bg-gray-300 cursor-not-allowed"
                          : "btn-primary"
                      }`}
                      disabled={
                        isSubmitting ||
                        formik.isSubmitting ||
                        (formik.values.payment_method === "credit_card" && !creditCardPaymentSuccess)
                      }
                    >
                      {isSubmitting ? (
                        <Spinner size="sm" />
                      ) : formik.values.payment_method === "credit_card" ? (
                        "Xác nhận đơn hàng"
                      ) : (
                        "Tiếp tục thanh toán"
                      )}
                    </button>

                    {formik.values.payment_method === "credit_card" && !creditCardPaymentSuccess && (
                      <p className="text-sm text-red-500 mt-2">Vui lòng hoàn tất thanh toán thẻ trước khi tiếp tục</p>
                    )}
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  {/* Back button */}
                  <button
                    onClick={handleGoBack}
                    className="flex items-center text-primary hover:text-primary-dark mb-4"
                  >
                    <FiArrowLeft className="mr-2" /> Quay lại
                  </button>

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                  )}

                  {/* Payment form */}
                  {renderPaymentForm()}

                  <div className="mt-6">
                    <button
                      onClick={handleCompleteOrder}
                      className={`btn w-full ${
                        isCompleteOrderButtonEnabled() ? "btn-primary" : "btn-disabled bg-gray-300 cursor-not-allowed"
                      }`}
                      disabled={!isCompleteOrderButtonEnabled()}
                    >
                      Hoàn tất đơn hàng
                    </button>

                    {!isCompleteOrderButtonEnabled() && (
                      <p className="text-sm text-red-500 mt-2">Vui lòng hoàn tất thanh toán trước khi tiếp tục</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6">Đơn hàng của bạn</h2>

                <div className="mb-6">
                  <div className="max-h-80 overflow-y-auto mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex py-4 border-b border-gray-medium">
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium">{item.name}</h3>

                          {/* Hiển thị các tùy chọn sản phẩm nếu có */}
                          {item.options && (
                            <div className="text-sm text-gray-dark mt-1">
                              {Object.entries(item.options)
                                .filter(([key]) => key !== "variantPrice") // Không hiển thị giá biến thể
                                .map(([key, value]) => (
                                  <div key={key}>{formatOptionName(key, value)}</div>
                                ))}
                            </div>
                          )}

                          <div className="flex justify-between mt-1">
                            <span className="text-gray-dark">
                              {item.quantity} x{" "}
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                item.options && item.options.variantPrice
                                  ? item.options.variantPrice
                                  : item.sale_price || item.price,
                              )}
                            </span>
                            <span className="font-medium">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                (item.options && item.options.variantPrice
                                  ? item.options.variantPrice
                                  : item.sale_price || item.price) * item.quantity,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-dark">Tổng sản phẩm:</span>
                      <span>{totalItems}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-dark">Tạm tính:</span>
                      <span>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-dark">Phí vận chuyển:</span>
                      <span>Miễn phí</span>
                    </div>

                    <div className="border-t border-gray-medium pt-2 flex justify-between font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary text-xl">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CheckoutPage
