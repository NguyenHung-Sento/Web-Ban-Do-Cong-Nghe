"use client"

import { useState } from "react"
import { FiArrowLeft, FiCheck } from "react-icons/fi"
import { QRCodeCanvas } from "qrcode.react"

const QRCodeDisplay = ({ title, value, instructions, accountInfo, onBack, onComplete, color = "#D70018" }) => {
  const [isComplete, setIsComplete] = useState(false)

  // Simulate a payment completion callback - in real world this would be replaced by
  // a webhook or polling mechanism to check payment status
  const handleCompletePayment = () => {
    setIsComplete(true)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      {!isComplete ? (
        <>
          <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>

          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white border-2 border-gray-200 rounded-md">
              <QRCodeCanvas value={value} size={200} fgColor={color} />
            </div>
          </div>

          {accountInfo && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Thông tin chuyển khoản:</h4>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                {Object.entries(accountInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {instructions && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Hướng dẫn:</h4>
              <ol className="list-decimal pl-5 space-y-1">
                {instructions.map((instruction, index) => (
                  <li key={index} className="text-gray-700">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex space-x-3">
            <button onClick={onBack} className="btn btn-outline flex-1 flex items-center justify-center">
              <FiArrowLeft className="mr-2" /> Quay lại
            </button>
            {/* This button is for demo purposes only - in a real app this would be handled by webhook */}
            <button onClick={handleCompletePayment} className="btn btn-primary flex-1">
              Đã thanh toán
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-500 text-2xl" />
          </div>
          <h3 className="text-xl font-bold mb-2">Thanh toán thành công!</h3>
          <p className="text-gray-600 mb-6">Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.</p>
          <div className="flex space-x-3">
            <button onClick={onComplete} className="btn btn-primary flex-1">
              Xem đơn hàng
            </button>
            <button onClick={() => (window.location.href = "/")} className="btn btn-outline flex-1">
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRCodeDisplay
