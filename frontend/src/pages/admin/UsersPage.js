"use client"

import { useState, useEffect } from "react"
import { FiPlus, FiFilter } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import DataTable from "../../components/admin/DataTable"
import AdminService from "../../services/admin.service"
import { toast } from "react-toastify"
import UserForm from "../../components/admin/UserForm"

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const [isEditingUser, setIsEdtingUser] = useState(null)


  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      }
      if (searchTerm) params.search = searchTerm
      if (roleFilter) params.role = roleFilter

      const response = await AdminService.getUsers(params)
      if (response && response.data && response.data.data) {
        setUsers(response.data.data.users || [])
        setTotalItems(response.data.data.total || response.data.data.pagination?.total || 0)
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Không thể tải danh sách người dùng")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1)
      fetchUsers()
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, roleFilter])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleAddUser = () => {
    setIsEdtingUser(null)
    setShowForm(true)
  }

  const handleEditUser = (user) => {
    setIsEdtingUser(user)
    setShowForm(true)
  }

  const handleFormSave = () => {
    setIsEdtingUser(null)
    setShowForm(false)
    fetchUsers()
  }

  const handleFormCancel = () => {
    setIsEdtingUser(null)
    setShowForm(false)
  }

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}"?`)) {
      try {
        await AdminService.deleteUser(user.id)
        toast.success("Xóa người dùng thành công")
        fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
        toast.error("Không thể xóa người dùng")
      }
    }
  }

  const userColumns = [
    {
      header: "Người dùng",
      accessor: "name",
      render: (item) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
            {item.avatar ? (
              <img
                src={item.avatar || "/placeholder.svg"}
                alt={item.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-500 font-medium">{item.name ? item.name.charAt(0).toUpperCase() : "U"}</span>
            )}
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Vai trò",
      accessor: "role",
      render: (item) => {
        const roleMap = {
          admin: { label: "Quản trị viên", class: "bg-purple-100 text-purple-800" },
          user: { label: "Người dùng", class: "bg-blue-100 text-blue-800" },
        }

        const role = roleMap[item.role] || { label: item.role, class: "bg-gray-100 text-gray-800" }

        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.class}`}>{role.label}</span>
      },
    },
    {
      header: "Số điện thoại",
      accessor: "phone",
      render: (item) => item.phone || "Chưa cập nhật",
    },
    {
      header: "Ngày đăng ký",
      accessor: "created_at",
      render: (item) => new Date(item.created_at).toLocaleDateString("vi-VN"),
    },
  ]

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Quản lý người dùng</h1>
        <button
          onClick={handleAddUser}
          className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" />
          Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0 w-full md:w-auto">
            <div className="flex items-center mr-4 mb-4 md:mb-0 w-full md:w-auto">
              <FiFilter className="mr-2 text-gray-500" />
              <span className="text-gray-700 mr-2">Vai trò:</span>
              <select
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="user">Người dùng</option>
              </select>
            </div>
            <div className="flex items-center w-full md:w-auto">
              <span className="text-gray-700 mr-2">Tìm kiếm:</span>
              <input
                type="text"
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                placeholder="Tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-gray-700 mr-2">Tổng số:</span>
            <span className="font-semibold">{users.length} người dùng</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DataTable
        columns={userColumns}
        data={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        totalItems={totalItems}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
      />
      )}
      {showForm && <UserForm user={isEditingUser} onSave={handleFormSave} onCancel={handleFormCancel}/>}
    </AdminLayout>
  )
}

export default UsersPage
