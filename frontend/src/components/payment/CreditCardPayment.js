"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { FiCreditCard, FiCalendar, FiLock, FiUser, FiCheck } from "react-icons/fi"
import PaymentService from "../../services/payment.service"
import Spinner from "../ui/Spinner"

const CreditCardPayment = ({ orderId, amount, onPaymentProcessed, paymentProcessingStarted, inlineForm = false }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const formik = useFormik({
    initialValues: {
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
    },
    validationSchema: Yup.object({
      cardNumber: Yup.string()
        .required("Số thẻ là bắt buộc")
        .matches(/^[0-9]{16}$/, "Số thẻ phải có 16 chữ số"),
      cardHolder: Yup.string().required("Tên chủ thẻ là bắt buộc"),
      expiryDate: Yup.string()
        .required("Ngày hết hạn là bắt buộc")
        .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Định dạng MM/YY không hợp lệ"),
      cvv: Yup.string()
        .required("Mã CVV là bắt buộc")
        .matches(/^[0-9]{3,4}$/, "Mã CVV phải có 3 hoặc 4 chữ số"),
    }),
    validateOnMount: true, 
    onSubmit: async (values) => {
      // Prevent multiple submissions
      if (loading || paymentProcessingStarted) return

      try {
        setLoading(true)
        setError(null)

        // Xử lý thông tin thẻ
        const [month, year] = values.expiryDate.split("/")

        const cardInfo = {
          number: values.cardNumber,
          holder: values.cardHolder,
          expiry_month: month,
          expiry_year: `20${year}`,
          cvv: values.cvv,
        }

        // Nếu là inline form và chưa có orderId, chỉ lưu thông tin thẻ
        if (inlineForm && !orderId) {
          // Giả lập xử lý thành công
          setSuccess(true)
          if (onPaymentProcessed) {
            onPaymentProcessed("inline_card_payment")
          }
          return
        }

        const response = await PaymentService.processPayment({
          order_id: orderId,
          payment_method: "credit_card",
          payment_provider: "stripe", // Hoặc provider khác
          card_info: cardInfo,
        })

        setSuccess(true)
        onPaymentProcessed(response.data.payment_id)
      } catch (error) {
        setError(error.response?.data?.message || "Không thể xử lý thanh toán")
      } finally {
        setLoading(false)
      }
    },
  })

  const formatCardNumber = (value) => {
    // Chỉ giữ lại các ký tự số
    const v = value.replace(/\D/g, "")
    const matches = v.match(/\d{1,4}/g)

    if (!matches) return ""

    // Giới hạn tối đa 16 số
    const limitedMatches = matches
      .join("")
      .substring(0, 16)
      .match(/\d{1,4}/g)
    return limitedMatches ? limitedMatches.join(" ") : ""
  }

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value)
    formik.setFieldValue("cardNumber", formattedValue.replace(/\s/g, ""))
    // Cập nhật giá trị hiển thị trong input
    e.target.value = formattedValue
  }

  const handleExpiryDateChange = (e) => {
    let { value } = e.target
    value = value.replace(/\D/g, "")

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`
    }

    formik.setFieldValue("expiryDate", value)
  }

  if (success) {
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
    <div className={inlineForm ? "" : "bg-white rounded-lg shadow-md p-6"}>
      {!inlineForm && <h3 className="text-xl font-bold mb-4">Thanh toán bằng thẻ tín dụng/ghi nợ</h3>}

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {!inlineForm && (
        <div className="mb-6">
          <p className="text-gray-700 mb-2">Số tiền thanh toán:</p>
          <p className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)}
          </p>
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Số thẻ
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCreditCard className="text-gray-400" />
            </div>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              className={`pl-10 pr-10 py-2 w-full border ${
                formik.touched.cardNumber && formik.errors.cardNumber ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
              value={formatCardNumber(formik.values.cardNumber)}
              onChange={handleCardNumberChange}
              onBlur={formik.handleBlur}
              maxLength={19}
              inputMode="numeric"
              pattern="[0-9\s]*"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <img src="/images/payment-visa.png" alt="Visa" className="h-6" />
            </div>
          </div>
          {formik.touched.cardNumber && formik.errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.cardNumber}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
            Tên chủ thẻ
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="text-gray-400" />
            </div>
            <input
              type="text"
              id="cardHolder"
              name="cardHolder"
              placeholder="NGUYEN VAN A"
              className={`pl-10 py-2 w-full border ${
                formik.touched.cardHolder && formik.errors.cardHolder ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
              {...formik.getFieldProps("cardHolder")}
            />
          </div>
          {formik.touched.cardHolder && formik.errors.cardHolder && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.cardHolder}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              Ngày hết hạn
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                className={`pl-10 py-2 w-full border ${
                  formik.touched.expiryDate && formik.errors.expiryDate ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                value={formik.values.expiryDate}
                onChange={handleExpiryDateChange}
                onBlur={formik.handleBlur}
                maxLength={5}
              />
            </div>
            {formik.touched.expiryDate && formik.errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.expiryDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              Mã CVV
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="cvv"
                name="cvv"
                placeholder="123"
                className={`pl-10 py-2 w-full border ${
                  formik.touched.cvv && formik.errors.cvv ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                {...formik.getFieldProps("cvv")}
                maxLength={4}
              />
            </div>
            {formik.touched.cvv && formik.errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.cvv}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          disabled={loading || !formik.isValid || !formik.dirty}
        >
          {loading ? <Spinner size="sm" /> : "Thanh toán ngay"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center space-x-4">
        <img src="/images/payment-visa.png" alt="Visa" className="h-8" />
        <img src="/images/payment-mastercard.png" alt="Mastercard" className="h-8" />
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Thông tin thanh toán của bạn được bảo mật 100% với chuẩn SSL
      </div>
    </div>
  )
}

export default CreditCardPayment
