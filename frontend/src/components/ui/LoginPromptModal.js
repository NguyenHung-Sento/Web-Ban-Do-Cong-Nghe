"use client"

import { useNavigate } from "react-router-dom"
import { FiX, FiLogIn } from "react-icons/fi"

const LoginPromptModal = ({ isOpen, onClose, redirectUrl }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleLogin = () => {
    // Close the modal
    onClose()

    // Properly encode the redirect URL to handle special characters
    const encodedRedirectUrl = encodeURIComponent(redirectUrl || window.location.pathname)

    // Redirect to login page with return URL
    navigate(`/login?redirect=${encodedRedirectUrl}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <FiX size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiLogIn className="text-primary text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Đăng nhập để tiếp tục</h3>
          <p className="text-gray-600 mt-2">Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button onClick={handleLogin} className="btn btn-primary flex-1 flex items-center justify-center">
            <FiLogIn className="mr-2" /> Đăng nhập
          </button>
          <button onClick={onClose} className="btn btn-outline flex-1">
            Để sau
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-primary hover:underline">
            Đăng ký ngay
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginPromptModal

