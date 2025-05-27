"use client"

import { forwardRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { FiHome, FiBox, FiTag, FiShoppingBag, FiUsers, FiX, FiImage } from "react-icons/fi"

const AdminSidebar = forwardRef(({ isOpen, toggleSidebar }, ref) => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const menuItems = [
    { path: "/admin", icon: <FiHome size={20} />, label: "Tổng quan" },
    { path: "/admin/products", icon: <FiBox size={20} />, label: "Sản phẩm" },
    { path: "/admin/categories", icon: <FiTag size={20} />, label: "Danh mục" },
    { path: "/admin/banners", icon: <FiImage size={20} />, label: "Banner" },
    { path: "/admin/orders", icon: <FiShoppingBag size={20} />, label: "Đơn hàng" },
    { path: "/admin/users", icon: <FiUsers size={20} />, label: "Người dùng" },
  ]

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div
        ref={ref}
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-primary text-white lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in lg:w-0 lg:overflow-hidden"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold hover:text-blue-200 transition-colors duration-200">
              DigitalW Admin
            </Link>
          </div>
          <button
            onClick={toggleSidebar}
            className="text-white focus:outline-none lg:hidden hover:text-blue-200 transition-colors duration-200"
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="mt-5 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mt-2 text-white transition-colors duration-200 rounded-lg ${
                isActive(item.path)
                  ? "bg-white bg-opacity-20 border-l-4 border-white shadow-lg"
                  : "hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <span className={isActive(item.path) ? "text-white font-semibold" : ""}>{item.icon}</span>
              <span className={`mx-4 ${isActive(item.path) ? "font-semibold" : "font-medium"}`}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
})

export default AdminSidebar
