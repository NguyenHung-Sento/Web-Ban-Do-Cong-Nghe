"use client"

import { useState } from "react"
import AdminService from "../../services/admin.service"
import { toast } from "react-toastify"

const UserForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await AdminService.createUser(formData)
      toast.success("Thêm người dùng thành công")
      onSave()
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Không thể thêm người dùng")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Thêm người dùng mới</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Vai trò */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {isLoading ? "Đang lưu..." : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserForm
