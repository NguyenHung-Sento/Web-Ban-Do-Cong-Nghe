"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import { register } from "../features/auth/authSlice"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff } from "react-icons/fi"

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { isLoggedIn, isLoading, error } = useSelector((state) => state.auth)

  // Get redirect path from URL query params
  const redirect = location.search ? location.search.split("=")[1] : "/"

  useEffect(() => {
    // If user is already logged in, redirect
    if (isLoggedIn) {
      navigate(redirect)
    }
  }, [isLoggedIn, navigate, redirect])

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
      const { confirmPassword, ...userData } = values
      dispatch(register(userData))
    },
  })

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
                  className={`form-input pl-10 ${formik.touched.name && formik.errors.name ? "border-red-500" : ""}`}
                  placeholder="Nhập họ tên của bạn"
                  {...formik.getFieldProps("name")}
                />
              </div>
              {formik.touched.name && formik.errors.name && <div className="form-error">{formik.errors.name}</div>}
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
                  className={`form-input pl-10 ${formik.touched.email && formik.errors.email ? "border-red-500" : ""}`}
                  placeholder="Nhập email của bạn"
                  {...formik.getFieldProps("email")}
                />
              </div>
              {formik.touched.email && formik.errors.email && <div className="form-error">{formik.errors.email}</div>}
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
                  className={`form-input pl-10 pr-10 ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  placeholder="Xác nhận mật khẩu của bạn"
                  {...formik.getFieldProps("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff className="text-gray-dark" /> : <FiEye className="text-gray-dark" />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="form-error">{formik.errors.confirmPassword}</div>
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
                  className={`form-input pl-10 ${formik.touched.phone && formik.errors.phone ? "border-red-500" : ""}`}
                  placeholder="Nhập số điện thoại của bạn"
                  {...formik.getFieldProps("phone")}
                />
              </div>
              {formik.touched.phone && formik.errors.phone && <div className="form-error">{formik.errors.phone}</div>}
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
                  placeholder="Nhập địa chỉ của bạn"
                  {...formik.getFieldProps("address")}
                />
              </div>
              {formik.touched.address && formik.errors.address && (
                <div className="form-error">{formik.errors.address}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : "Đăng ký"}
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
    </Layout>
  )
}

export default RegisterPage

