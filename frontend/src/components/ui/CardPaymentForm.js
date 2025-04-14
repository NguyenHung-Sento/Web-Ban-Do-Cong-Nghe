"use client"

import { useState } from "react"
import { FiCreditCard, FiCalendar, FiLock } from "react-icons/fi"

const CardPaymentForm = ({ onSubmit, onCancel }) => {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    // Format card number with spaces
    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim()
        .slice(0, 19)

      setCardData({ ...cardData, [name]: formattedValue })
    }
    // Format expiry date MM/YY
    else if (name === "expiryDate") {
      const formattedValue = value
        .replace(/\//g, "")
        .replace(/(.{2})/, "$1/")
        .slice(0, 5)

      setCardData({ ...cardData, [name]: formattedValue })
    }
    // Limit CVV to 3-4 digits
    else if (name === "cvv") {
      const formattedValue = value.slice(0, 4)
      setCardData({ ...cardData, [name]: formattedValue })
    } else {
      setCardData({ ...cardData, [name]: value })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Vui lòng nhập đúng số thẻ"
    }

    if (!cardData.cardHolder) {
      newErrors.cardHolder = "Vui lòng nhập tên chủ thẻ"
    }

    if (!cardData.expiryDate || !cardData.expiryDate.includes("/")) {
      newErrors.expiryDate = "Vui lòng nhập đúng định dạng MM/YY"
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = "CVV không hợp lệ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      // In a real application, you would process the card payment here
      // This is just a simulation
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onSubmit()
    } catch (error) {
      console.error("Payment error:", error)
      setErrors({ form: "Có lỗi xảy ra khi xử lý thanh toán" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit}>
        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-200">{errors.form}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Số thẻ</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FiCreditCard />
            </div>
            <input
              type="text"
              name="cardNumber"
              placeholder="0000 0000 0000 0000"
              className={`form-input pl-10 ${errors.cardNumber ? "border-red-500" : ""}`}
              value={cardData.cardNumber}
              onChange={handleChange}
            />
          </div>
          {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tên chủ thẻ</label>
          <input
            type="text"
            name="cardHolder"
            placeholder="NGUYEN VAN A"
            className={`form-input ${errors.cardHolder ? "border-red-500" : ""}`}
            value={cardData.cardHolder}
            onChange={handleChange}
          />
          {errors.cardHolder && <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>}
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Ngày hết hạn</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiCalendar />
              </div>
              <input
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                className={`form-input pl-10 ${errors.expiryDate ? "border-red-500" : ""}`}
                value={cardData.expiryDate}
                onChange={handleChange}
              />
            </div>
            {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">CVV</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiLock />
              </div>
              <input
                type="text"
                name="cvv"
                placeholder="123"
                className={`form-input pl-10 ${errors.cvv ? "border-red-500" : ""}`}
                value={cardData.cvv}
                onChange={handleChange}
              />
            </div>
            {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
          </div>
        </div>

        <div className="flex space-x-3">
          <button type="button" onClick={onCancel} className="btn btn-outline flex-1">
            Hủy
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CardPaymentForm
