"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import { register, resetRegistrationData } from "../features/auth/authSlice"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import Captcha from "../components/ui/Captcha"
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff } from "react-icons/fi"

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [addressError, setAddressError] = useState("")

  const { isLoggedIn, isLoading, error, registrationData } = useSelector((state) => state.auth)

  // Get redirect path from URL query params
  const redirect = location.search ? location.search.split("=")[1] : "/"

  useEffect(() => {
    // Reset registration data when component mounts
    dispatch(resetRegistrationData())

    // If user is already logged in, redirect
    if (isLoggedIn) {
      navigate(redirect)
    }

    // If registration was successful and requires verification, redirect to verification page
    if (registrationData && registrationData.requireVerification) {
      navigate(`/verify-email?email=${encodeURIComponent(registrationData.email)}`)
    }
  }, [isLoggedIn, navigate, redirect, registrationData, dispatch])

  // Real-time validation functions
  const validateName = (value) => {
    if (!value) {
      setNameError("Họ tên là bắt buộc")
      return false
    }
    if (/\d/.test(value)) {
      setNameError("Họ tên không được chứa số")
      return false
    }
    setNameError("")
    return true
  }

  const validateEmail = (value) => {
    if (!value) {
      setEmailError("Email là bắt buộc")
      return false
    }
    // Validate email format with domain after @ symbol
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Email không hợp lệ, phải có định dạng example@domain.com")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePhone = (value) => {
    if (!value) {
      setPhoneError("Số điện thoại là bắt buộc")
      return false
    }
    if (!/^[0-9]{10,11}$/.test(value)) {
      setPhoneError("Số điện thoại phải có 10-11 chữ số")
      return false
    }
    setPhoneError("")
    return true
  }

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError("Mật khẩu là bắt buộc")
      return false
    }
    if (value.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự")
      return false
    }
    setPasswordError("")
    return true
  }

  const validateConfirmPassword = (value, password) => {
    if (!value) {
      setConfirmPasswordError("Xác nhận mật khẩu là bắt buộc")
      return false
    }
    if (value !== password) {
      setConfirmPasswordError("Mật khẩu không khớp")
      return false
    }
    setConfirmPasswordError("")
    return true
  }

  const validateAddress = (value) => {
    if (!value) {
      setAddressError("Địa chỉ là bắt buộc")
      return false
    }
    setAddressError("")
    return true
  }

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Họ tên là bắt buộc"),
      email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
      password: Yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").required("Mật khẩu là bắt buộc"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp")
        .required("Xác nhận mật khẩu là bắt buộc"),
      phone: Yup.string()
        .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
        .required("Số điện thoại là bắt buộc"),
      address: Yup.string().required("Địa chỉ là bắt buộc"),
    }),
    onSubmit: (values) => {
      // Validate all fields before submitting
      const isNameValid = validateName(values.name)
      const isEmailValid = validateEmail(values.email)
      const isPasswordValid = validatePassword(values.password)
      const isConfirmPasswordValid = validateConfirmPassword(values.confirmPassword, values.password)
      const isPhoneValid = validatePhone(values.phone)
      const isAddressValid = validateAddress(values.address)

      if (!isCaptchaValid) {
        alert("Vui lòng xác nhận CAPTCHA")
        return
      }

      if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && isPhoneValid && isAddressValid) {
        setIsSubmitting(true)
        const { confirmPassword, ...userData } = values
        dispatch(register(userData))
          .unwrap()
          .catch(() => {
            setIsSubmitting(false)
          })
      }
    },
  })

  const handleCaptchaChange = (isValid) => {
    setIsCaptchaValid(isValid)
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h1>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

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
                  className={`form-input pl-10 ${nameError ? "border-red-500" : ""}`}
                  placeholder="Nhập họ tên của bạn"
                  value={formik.values.name}
                  onChange={(e) => {
                    // Only allow letters and spaces
                    const value = e.target.value.replace(/[0-9]/g, "")
                    formik.setFieldValue("name", value)
                    validateName(value)
                  }}
                  onBlur={() => validateName(formik.values.name)}
                />
              </div>
              {nameError && <div className="form-error">{nameError}</div>}
            </div>

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
                  className={`form-input pl-10 ${emailError ? "border-red-500" : ""}`}
                  placeholder="Nhập email của bạn"
                  value={formik.values.email}
                  onChange={(e) => {
                    const value = e.target.value
                    formik.setFieldValue("email", value)
                    validateEmail(value)
                  }}
                  onBlur={() => validateEmail(formik.values.email)}
                />
              </div>
              {emailError && <div className="form-error">{emailError}</div>}
            </div>

            <div className="mb-4">
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
                  className={`form-input pl-10 pr-10 ${passwordError ? "border-red-500" : ""}`}
                  placeholder="Nhập mật khẩu của bạn"
                  value={formik.values.password}
                  onChange={(e) => {
                    const value = e.target.value
                    formik.setFieldValue("password", value)
                    validatePassword(value)
                    // Also validate confirm password if it has a value
                    if (formik.values.confirmPassword) {
                      validateConfirmPassword(formik.values.confirmPassword, value)
                    }
                  }}
                  onBlur={() => validatePassword(formik.values.password)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="text-gray-dark" /> : <FiEye className="text-gray-dark" />}
                </button>
              </div>
              {passwordError && <div className="form-error">{passwordError}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiLock className="text-gray-dark" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-input pl-10 pr-10 ${confirmPasswordError ? "border-red-500" : ""}`}
                  placeholder="Xác nhận mật khẩu của bạn"
                  value={formik.values.confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value
                    formik.setFieldValue("confirmPassword", value)
                    validateConfirmPassword(value, formik.values.password)
                  }}
                  onBlur={() => validateConfirmPassword(formik.values.confirmPassword, formik.values.password)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff className="text-gray-dark" /> : <FiEye className="text-gray-dark" />}
                </button>
              </div>
              {confirmPasswordError && <div className="form-error">{confirmPasswordError}</div>}
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
                  className={`form-input pl-10 ${phoneError ? "border-red-500" : ""}`}
                  placeholder="Nhập số điện thoại của bạn"
                  value={formik.values.phone}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, "")
                    formik.setFieldValue("phone", value)
                    validatePhone(value)
                  }}
                  onBlur={() => validatePhone(formik.values.phone)}
                  maxLength={11}
                />
              </div>
              {phoneError && <div className="form-error">{phoneError}</div>}
            </div>

            <div className="mb-4">
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
                  className={`form-input pl-10 ${addressError ? "border-red-500" : ""}`}
                  placeholder="Nhập địa chỉ của bạn"
                  value={formik.values.address}
                  onChange={(e) => {
                    const value = e.target.value
                    formik.setFieldValue("address", value)
                    validateAddress(value)
                  }}
                  onBlur={() => validateAddress(formik.values.address)}
                />
              </div>
              {addressError && <div className="form-error">{addressError}</div>}
            </div>

            <div className="mb-6">
              <label className="form-label">Xác nhận CAPTCHA</label>
              <Captcha onChange={handleCaptchaChange} />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center"
              disabled={isLoading || !isCaptchaValid || isSubmitting}
            >
              {isLoading || isSubmitting ? <Spinner size="sm" /> : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-dark">
              Đã có tài khoản?{" "}
              <Link to={redirect ? `/login?redirect=${redirect}` : "/login"} className="text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Full-page loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-3 text-gray-800">Đang xử lý đăng ký...</p>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default RegisterPage

