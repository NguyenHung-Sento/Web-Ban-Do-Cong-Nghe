"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import { login } from "../features/auth/authSlice"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import { FaGoogle, FaFacebook } from "react-icons/fa"
import AuthService from "../services/auth.service"

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [showPassword, setShowPassword] = useState(false)
  const [socialLoginLoading, setSocialLoginLoading] = useState(false)

  const { isLoggedIn, isLoading, error } = useSelector((state) => state.auth)

  // Get redirect path from URL query params
  const redirect = location.search ? location.search.split("=")[1] : "/"

  useEffect(() => {
    // If user is already logged in, redirect
    if (isLoggedIn) {
      try {
        // Properly decode the redirect URL
        const decodedRedirect = decodeURIComponent(redirect)
        navigate(decodedRedirect)
      } catch (error) {
        // If there's an error with the redirect URL, go to homepage
        console.error("Error with redirect URL:", error)
        navigate("/")
      }
    }

    // Check for error in URL params
    const params = new URLSearchParams(location.search)
    const errorParam = params.get("error")
    if (errorParam) {
      let errorMessage = "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại."

      switch (errorParam) {
        case "auth_failed":
          errorMessage = "Đăng nhập không thành công. Vui lòng thử lại."
          break
        case "social_login_failed":
          errorMessage = "Đăng nhập bằng mạng xã hội không thành công. Vui lòng thử lại."
          break
        default:
          errorMessage = "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại."
      }

      formik.setErrors({ general: errorMessage })
    }
  }, [isLoggedIn, navigate, redirect, location.search])

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
      password: Yup.string().required("Mật khẩu là bắt buộc"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setSubmitting(true)
        await dispatch(login(values)).unwrap()
        // Nếu đăng nhập thành công, navigate sẽ được xử lý trong useEffect
      } catch (error) {
        // Xử lý lỗi đăng nhập
        const errorMessage =
          error?.response?.data?.message || error?.message || "Đăng nhập không thành công. Vui lòng thử lại."
        setErrors({ general: errorMessage })
      } finally {
        setSubmitting(false)
      }
    },
  })

  const handleGoogleLogin = () => {
    setSocialLoginLoading(true)
    try {
      // Store the redirect URL for after login
      if (redirect && redirect !== "/") {
        localStorage.setItem("redirectAfterLogin", redirect)
      }
      AuthService.initiateGoogleLogin()
    } catch (error) {
      console.error("Google login error:", error)
      setSocialLoginLoading(false)
      formik.setErrors({ general: "Không thể kết nối với Google. Vui lòng thử lại sau." })
    }
  }

  const handleFacebookLogin = () => {
    setSocialLoginLoading(true)
    try {
      // Store the redirect URL for after login
      if (redirect && redirect !== "/") {
        localStorage.setItem("redirectAfterLogin", redirect)
      }
      AuthService.initiateFacebookLogin()
    } catch (error) {
      console.error("Facebook login error:", error)
      setSocialLoginLoading(false)
      formik.setErrors({ general: "Không thể kết nối với Facebook. Vui lòng thử lại sau." })
    }
  }

  useEffect(() => {
    // Clear errors when user starts typing
    if (formik.errors.general && (formik.values.email || formik.values.password)) {
      formik.setErrors({ ...formik.errors, general: undefined })
    }
  }, [formik.values.email, formik.values.password])

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>

          {(error || formik.errors.general) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error || formik.errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiMail className="text-gray-dark" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input pl-10 ${formik.touched.email && formik.errors.email ? "border-red-500" : ""}`}
                  placeholder="Nhập email của bạn"
                  {...formik.getFieldProps("email")}
                />
              </div>
              {formik.touched.email && formik.errors.email && <div className="form-error">{formik.errors.email}</div>}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiLock className="text-gray-dark" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`form-input pl-10 pr-10 ${
                    formik.touched.password && formik.errors.password ? "border-red-500" : ""
                  }`}
                  placeholder="Nhập mật khẩu của bạn"
                  {...formik.getFieldProps("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="text-gray-dark" /> : <FiEye className="text-gray-dark" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="form-error">{formik.errors.password}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? <Spinner size="sm" /> : "Đăng nhập"}
            </button>
          </form>

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
                disabled={socialLoginLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaGoogle className="h-5 w-5 text-red-600 mr-2" />
                Google
              </button>
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={socialLoginLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaFacebook className="h-5 w-5 text-blue-600 mr-2" />
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-dark">
              Chưa có tài khoản?{" "}
              <Link
                to={redirect ? `/register?redirect=${redirect}` : "/register"}
                className="text-primary hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default LoginPage
