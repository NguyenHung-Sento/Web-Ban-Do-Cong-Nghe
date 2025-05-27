"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setCredentials } from "../features/auth/authSlice"
import AuthService from "../services/auth.service"
import Spinner from "../components/ui/Spinner"
import { toast } from "react-toastify"

const SocialAuthCallbackPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleSocialLogin = async () => {
      try {
        console.log("Social auth callback started")
        console.log("Current URL:", window.location.href)
        console.log("Location search:", location.search)

        // Parse query parameters
        const params = new URLSearchParams(location.search)
        const token = params.get("token")
        const refreshToken = params.get("refreshToken")
        const userId = params.get("userId")
        const error = params.get("error")

        console.log("Parsed params:", {
          token: token ? "exists" : "missing",
          refreshToken: refreshToken ? "exists" : "missing",
          userId,
          error,
        })

        if (error) {
          console.error("Social login error from URL:", error)
          setError("Đăng nhập bằng mạng xã hội thất bại. Vui lòng thử lại.")
          setTimeout(() => navigate("/login?error=social_login_failed"), 2000)
          return
        }

        if (!token || !userId) {
          console.error("Missing required parameters:", { token: !!token, userId: !!userId })
          setError("Thông tin xác thực không hợp lệ. Vui lòng thử lại.")
          setTimeout(() => navigate("/login?error=invalid_response"), 2000)
          return
        }

        try {
          console.log("Setting tokens in localStorage...")

          // Store tokens in localStorage
          localStorage.setItem("token", token)
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken)
          }

          console.log("Tokens stored, getting user profile...")

          // Get user profile with the new token
          const response = await AuthService.getProfile()
          console.log("Profile response:", response)

          if (response && response.status === "success" && response.data && response.data.user) {
            const user = response.data.user
            console.log("User profile retrieved successfully:", user.email)

            // Store user in localStorage
            localStorage.setItem("user", JSON.stringify(user))

            // Update Redux state
            dispatch(setCredentials({ user, token }))

            // Get redirect URL
            const redirectTo = localStorage.getItem("redirectAfterLogin") || "/"
            localStorage.removeItem("redirectAfterLogin")

            console.log("Redirecting to:", redirectTo)
            toast.success("Đăng nhập thành công!")
            navigate(redirectTo)
          } else {
            console.error("Invalid profile response:", response)
            throw new Error("Failed to get user profile - invalid response format")
          }
        } catch (apiError) {
          console.error("Error processing social login:", apiError)
          console.error("API Error details:", {
            message: apiError.message,
            response: apiError.response?.data,
            status: apiError.response?.status,
          })

          // Clear any stored tokens on error
          localStorage.removeItem("token")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")

          setError("Lỗi xử lý đăng nhập. Vui lòng thử lại sau.")
          setTimeout(() => navigate("/login?error=processing_failed"), 2000)
        }
      } catch (error) {
        console.error("Error in social auth callback:", error)
        setError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
        setTimeout(() => navigate("/login"), 2000)
      }
    }

    handleSocialLogin()
  }, [location, navigate, dispatch])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md text-center">
          {error}
        </div>
      ) : (
        <>
          <Spinner />
          <p className="mt-4 text-gray-600">Đang xử lý đăng nhập...</p>
        </>
      )}
    </div>
  )
}

export default SocialAuthCallbackPage
