"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import AdminSidebar from "./AdminSidebar"
import AdminHeader from "./AdminHeader"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"


const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Default to open
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const sidebarRef = useRef(null)

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập và có quyền admin không
    if (!isLoggedIn) {
      navigate("/login?redirect=/admin")
      return
    }

    if (user && user.role !== "admin") {
      navigate("/")
    }

    // Load sidebar state from localStorage if available
    const savedSidebarState = localStorage.getItem("adminSidebarOpen")
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true")
    }
  }, [isLoggedIn, user, navigate])

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    // Save sidebar state to localStorage
    localStorage.setItem("adminSidebarOpen", newState.toString())
  }

  if (!isLoggedIn || (user && user.role !== "admin")) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} ref={sidebarRef} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <div className="container mx-auto px-4 py-2">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
