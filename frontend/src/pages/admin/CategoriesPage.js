"use client"

import { useState, useEffect } from "react"
import { FiPlus } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import DataTable from "../../components/admin/DataTable"
import CategoryForm from "../../components/admin/CategoryForm"
import AdminService from "../../services/admin.service"
import { toast } from "react-toastify"

const CategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const [searchTerm, setSearchTerm] = useState("")

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await AdminService.getCategories({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      })

      if (response?.data?.data) {
        setCategories(response.data.data.categories || [])
        setTotalItems(response.data.data.total || response.data.data.pagination?.total || 0)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Không thể tải danh sách danh mục")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories()
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [currentPage, searchTerm])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      try {
        await AdminService.deleteCategory(category.id)
        toast.success("Xóa danh mục thành công")
        fetchCategories()
      } catch (error) {
        console.error("Error deleting category:", error)
        toast.error("Không thể xóa danh mục")
      }
    }
  }

  const handleFormSave = () => {
    setShowForm(false)
    setEditingCategory(null)
    fetchCategories()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const columns = [
    {
      header: "Hình ảnh",
      accessor: "image",
      render: (item) => (
        <img
          src={item.image || "/placeholder.svg?height=50&width=50"}
          alt={item.name}
          className="w-12 h-12 object-cover rounded"
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=50&width=50"
          }}
        />
      ),
    },
    { header: "Tên danh mục", accessor: "name" },
    {
      header: "Số sản phẩm",
      accessor: "product_count",
      render: (item) => (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          {item.product_count || 0}
        </span>
      ),
    },
    {
      header: "Ngày tạo",
      accessor: "created_at",
      render: (item) => new Date(item.created_at).toLocaleDateString("vi-VN"),
    },
    {
      header: "Cập nhật",
      accessor: "updated_at",
      render: (item) => new Date(item.updated_at).toLocaleDateString("vi-VN"),
    },
  ]

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Quản lý danh mục</h1>
            <p className="text-gray-600">Quản lý danh mục sản phẩm trong hệ thống</p>
          </div>
          <button
            onClick={handleAddCategory}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"
          >
            <FiPlus className="mr-2" />
            Thêm danh mục
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0 w-full md:w-auto">
            <span className="text-gray-700 mr-2">Tìm kiếm:</span>
            <input
              type="text"
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
              placeholder="Tên danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Tổng số:</span>
            <span className="font-semibold">{totalItems} danh mục</span>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        totalItems={totalItems}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
      />

      {showForm && <CategoryForm category={editingCategory} onSave={handleFormSave} onCancel={handleFormCancel} />}
    </AdminLayout>
  )
}

export default CategoriesPage
