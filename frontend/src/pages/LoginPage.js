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

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [showPassword, setShowPassword] = useState(false)

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
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
      password: Yup.string().required("Mật khẩu là bắt buộc"),
    }),
    onSubmit: (values) => {
      dispatch(login(values))
    },
  })

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

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
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : "Đăng nhập"}
            </button>
          </form>

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

