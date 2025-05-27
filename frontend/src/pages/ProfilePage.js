"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import { getProfile, updateProfile, changePassword } from "../features/auth/authSlice"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
// Thêm import cho AddressManager
import AddressManager from "../components/address/AddressManager"

const ProfilePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("profile")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { user, isLoggedIn, isLoading } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login?redirect=profile")
    } else {
      dispatch(getProfile())
    }
  }, [dispatch, isLoggedIn, navigate])

  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Họ tên là bắt buộc"),
      phone: Yup.string()
        .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
        .required("Số điện thoại là bắt buộc"),
    }),
    onSubmit: (values) => {
      dispatch(updateProfile(values))
    },
  })

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Mật khẩu hiện tại là bắt buộc"),
      newPassword: Yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").required("Mật khẩu mới là bắt buộc"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Mật khẩu không khớp")
        .required("Xác nhận mật khẩu là bắt buộc"),
    }),
    onSubmit: (values) => {
      dispatch(
        changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      )
      passwordFormik.resetForm()
    },
  })

  if (!isLoggedIn) {
    return null
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="mb-6">Tài khoản của tôi</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-medium">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold">{user?.name}</h3>
                    <p className="text-gray-dark text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <ul>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeTab === "profile" ? "bg-primary text-white" : "hover:bg-gray-light"
                      }`}
                      onClick={() => setActiveTab("profile")}
                    >
                      Thông tin cá nhân
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeTab === "password" ? "bg-primary text-white" : "hover:bg-gray-light"
                      }`}
                      onClick={() => setActiveTab("password")}
                    >
                      Đổi mật khẩu
                    </button>
                  </li>
                  {/* Thêm tab mới cho địa chỉ trong sidebar */}
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeTab === "addresses" ? "bg-primary text-white" : "hover:bg-gray-light"
                      }`}
                      onClick={() => setActiveTab("addresses")}
                    >
                      Địa chỉ của tôi
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              {isLoading ? (
                <div className="py-10">
                  <Spinner size="lg" />
                </div>
              ) : (
                <>
                  {activeTab === "profile" && (
                    <>
                      <h2 className="text-xl font-bold mb-6">Thông tin cá nhân</h2>

                      <form onSubmit={profileFormik.handleSubmit}>
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
                              className={`form-input pl-10 ${
                                profileFormik.touched.name && profileFormik.errors.name ? "border-red-500" : ""
                              }`}
                              {...profileFormik.getFieldProps("name")}
                            />
                          </div>
                          {profileFormik.touched.name && profileFormik.errors.name && (
                            <div className="form-error">{profileFormik.errors.name}</div>
                          )}
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
                              className="form-input pl-10 bg-gray-100"
                              value={user?.email || ""}
                              disabled
                            />
                          </div>
                          <p className="text-sm text-gray-dark mt-1">Email không thể thay đổi</p>
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
                              className={`form-input pl-10 ${
                                profileFormik.touched.phone && profileFormik.errors.phone ? "border-red-500" : ""
                              }`}
                              {...profileFormik.getFieldProps("phone")}
                            />
                          </div>
                          {profileFormik.touched.phone && profileFormik.errors.phone && (
                            <div className="form-error">{profileFormik.errors.phone}</div>
                          )}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                          {isLoading ? <Spinner size="sm" /> : "Cập nhật thông tin"}
                        </button>
                      </form>
                    </>
                  )}

                  {activeTab === "password" && (
                    <>
                      <h2 className="text-xl font-bold mb-6">Đổi mật khẩu</h2>

                      <form onSubmit={passwordFormik.handleSubmit}>
                        <div className="mb-4">
                          <label htmlFor="currentPassword" className="form-label">
                            Mật khẩu hiện tại
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <FiLock className="text-gray-dark" />
                            </div>
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              id="currentPassword"
                              name="currentPassword"
                              className={`form-input pl-10 pr-10 ${
                                passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                                  ? "border-red-500"
                                  : ""
                              }`}
                              {...passwordFormik.getFieldProps("currentPassword")}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <FiEyeOff className="text-gray-dark" />
                              ) : (
                                <FiEye className="text-gray-dark" />
                              )}
                            </button>
                          </div>
                          {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                            <div className="form-error">{passwordFormik.errors.currentPassword}</div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label htmlFor="newPassword" className="form-label">
                            Mật khẩu mới
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <FiLock className="text-gray-dark" />
                            </div>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              id="newPassword"
                              name="newPassword"
                              className={`form-input pl-10 pr-10 ${
                                passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                                  ? "border-red-500"
                                  : ""
                              }`}
                              {...passwordFormik.getFieldProps("newPassword")}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <FiEyeOff className="text-gray-dark" />
                              ) : (
                                <FiEye className="text-gray-dark" />
                              )}
                            </button>
                          </div>
                          {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                            <div className="form-error">{passwordFormik.errors.newPassword}</div>
                          )}
                        </div>

                        <div className="mb-6">
                          <label htmlFor="confirmPassword" className="form-label">
                            Xác nhận mật khẩu mới
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
                                passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword
                                  ? "border-red-500"
                                  : ""
                              }`}
                              {...passwordFormik.getFieldProps("confirmPassword")}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <FiEyeOff className="text-gray-dark" />
                              ) : (
                                <FiEye className="text-gray-dark" />
                              )}
                            </button>
                          </div>
                          {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                            <div className="form-error">{passwordFormik.errors.confirmPassword}</div>
                          )}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                          {isLoading ? <Spinner size="sm" /> : "Đổi mật khẩu"}
                        </button>
                      </form>
                    </>
                  )}
                  {/* Thêm nội dung tab địa chỉ trong main content */}
                  {activeTab === "addresses" && (
                    <>
                      <AddressManager />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePage
