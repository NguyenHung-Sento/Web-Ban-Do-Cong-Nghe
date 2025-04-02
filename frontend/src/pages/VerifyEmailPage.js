"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import AuthService from "../services/auth.service"
import { toast } from "react-toastify"
import { FiMail, FiCheck, FiArrowLeft } from "react-icons/fi"

const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Get email from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const emailParam = params.get("email")
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // If no email in URL, redirect to register page
      navigate("/register")
    }
  }, [location.search, navigate])

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  // Handle key down for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")

    // Check if pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setOtp(digits)

      // Focus the last input
      const lastInput = document.getElementById("otp-5")
      if (lastInput) lastInput.focus()
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã OTP 6 số")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await AuthService.verifyEmail(email, otpValue)

      if (response.status === "success") {
        setSuccess(true)
        toast.success("Xác thực email thành công! Tài khoản của bạn đã được tạo.")
      } else {
        setError(response.message || "Xác thực không thành công. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError(error.response?.data?.message || "Xác thực không thành công. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return

    setIsResending(true)
    setError(null)

    try {
      const response = await AuthService.resendOtp(email)
      if (response.status === "success") {
        toast.success("Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.")
        setCountdown(60) // Set 60 seconds countdown
      } else {
        setError(response.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.")
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      setError(error.response?.data?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.")
    } finally {
      setIsResending(false)
    }
  }

  // Handle cancel registration
  const handleCancelRegistration = async () => {
    if (!email) return

    setIsCancelling(true)

    try {
      await AuthService.cancelRegistration(email)
      toast.info("Đã hủy đăng ký. Vui lòng đăng ký lại.")
      navigate("/register")
    } catch (error) {
      console.error("Cancel registration error:", error)
      // Still navigate to register page even if there's an error
      navigate("/register")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          {success ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheck className="text-green-500 text-3xl" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4">Xác thực thành công!</h1>
              <p className="text-gray-dark mb-6">
                Tài khoản của bạn đã được tạo thành công. Vui lòng đăng nhập để tiếp tục.
              </p>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
                <Link to="/login" className="btn btn-primary">
                  Đăng nhập
                </Link>
                <Link to="/" className="btn btn-outline">
                  Về trang chủ
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <button
                  onClick={handleCancelRegistration}
                  disabled={isCancelling}
                  className="flex items-center text-primary hover:underline mr-auto"
                >
                  {isCancelling ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <FiArrowLeft className="mr-1" /> Quay lại
                    </>
                  )}
                </button>
                <div className="text-center flex-grow">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                      <FiMail className="text-primary text-3xl" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Xác thực email</h1>
                </div>
                <div className="invisible w-[70px]"></div> {/* Spacer for centering */}
              </div>

              <p className="text-gray-dark text-center mb-4">
                Chúng tôi đã gửi mã OTP đến email <span className="font-medium">{email}</span>. Vui lòng nhập mã để hoàn
                tất đăng ký.
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="form-label text-center block mb-3">Nhập mã OTP 6 số</label>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="form-input w-12 h-12 text-center text-xl font-bold"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full flex items-center justify-center mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="sm" /> : "Xác thực"}
                </button>

                <div className="text-center">
                  <p className="text-gray-dark mb-2">
                    Không nhận được mã?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending || countdown > 0}
                      className={`text-primary hover:underline ${
                        isResending || countdown > 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isResending ? (
                        <span className="flex items-center justify-center">
                          <Spinner size="sm" /> Đang gửi...
                        </span>
                      ) : countdown > 0 ? (
                        `Gửi lại sau ${countdown}s`
                      ) : (
                        "Gửi lại mã"
                      )}
                    </button>
                  </p>
                  <p className="text-sm text-gray-dark">Mã OTP có hiệu lực trong vòng 10 phút</p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default VerifyEmailPage

