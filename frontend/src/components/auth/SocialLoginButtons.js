"use client"
import { FaGoogle, FaFacebook } from "react-icons/fa"
import AuthService from "../../services/auth.service"

const SocialLoginButtons = ({ redirect }) => {
  const handleGoogleLogin = () => {
    // Store the redirect URL for after login
    if (redirect && redirect !== "/") {
      localStorage.setItem("redirectAfterLogin", redirect)
    }
    AuthService.initiateGoogleLogin()
  }

  const handleFacebookLogin = () => {
    // Store the redirect URL for after login
    if (redirect && redirect !== "/") {
      localStorage.setItem("redirectAfterLogin", redirect)
    }
    AuthService.initiateFacebookLogin()
  }

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <FaGoogle className="h-5 w-5 text-red-600 mr-2" />
          Google
        </button>
        <button
          type="button"
          onClick={handleFacebookLogin}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaFacebook className="h-5 w-5 text-blue-600 mr-2" />
          Facebook
        </button>
      </div>
    </div>
  )
}

export default SocialLoginButtons
