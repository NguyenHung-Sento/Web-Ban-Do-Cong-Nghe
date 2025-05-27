"use client"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { FiMenu, FiBell, FiUser, FiLogOut, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { logout } from "../../features/auth/authSlice"
import { useState } from "react"

const AdminHeader = ({ toggleSidebar }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [sidebarVisible, setSidebarVisible] = useState(true)

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleToggleSidebar = () => {
    toggleSidebar()
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button - hidden on medium screens and up */}
          <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden">
            <FiMenu size={24} />
          </button>

          {/* New sidebar toggle button - visible on all screen sizes */}
          <button
            onClick={handleToggleSidebar}
            className="hidden md:flex items-center justify-center text-gray-500 hover:text-primary focus:outline-none mr-3 transition-colors duration-200"
            aria-label={sidebarVisible ? "Đóng sidebar" : "Mở sidebar"}
            title={sidebarVisible ? "Đóng sidebar" : "Mở sidebar"}
          >
            {sidebarVisible ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
          </button>

          <h1 className="text-xl font-semibold text-gray-800 ml-2 md:ml-0">Quản trị DigitalW</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex text-gray-500 focus:outline-none">
              <FiBell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </div>

          <div className="relative group">
            <button className="flex items-center space-x-2 focus:outline-none">
              <span className="text-gray-700 font-medium hidden md:block">{user?.name || "Admin"}</span>
              <FiUser size={20} className="text-gray-500" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 invisible group-hover:visible transition-all duration-300 opacity-0 group-hover:opacity-100">
              <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Thông tin tài khoản
              </Link>
              <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Về trang chủ
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <FiLogOut size={16} className="mr-2" />
                  <span>Đăng xuất</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
