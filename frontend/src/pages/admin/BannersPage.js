"use client"

import { useState, useEffect } from "react"
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSearch } from "react-icons/fi"
import { toast } from "react-toastify"
import AdminLayout from "../../components/admin/AdminLayout"
import DataTable from "../../components/admin/DataTable"
import BannerForm from "../../components/admin/BannerForm"
import BannerService from "../../services/banner.service"

const BannersPage = () => {
  const [banners, setBanners] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchBanners()
  }, [pagination.currentPage, search])

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const response = await BannerService.getBanners({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search,
      })

      if (response.data.status === "success") {
        setBanners(response.data.data.banners)
        setPagination(response.data.data.pagination)
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast.error("Không thể tải danh sách banner")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  const handleAddBanner = () => {
    setEditingBanner(null)
    setShowForm(true)
  }

  const handleEditBanner = (banner) => {
    setEditingBanner(banner)
    setShowForm(true)
  }

  const handleDeleteBanner = async (banner) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa banner "${banner.title}"?`)) {
      try {
        await BannerService.deleteBanner(banner.id)
        toast.success("Xóa banner thành công")
        fetchBanners()
      } catch (error) {
        console.error("Error deleting banner:", error)
        toast.error("Không thể xóa banner")
      }
    }
  }

  const handleToggleStatus = async (banner) => {
    try {
      await BannerService.toggleBannerStatus(banner.id)
      toast.success(`${banner.is_active ? "Ẩn" : "Hiển thị"} banner thành công`)
      fetchBanners()
    } catch (error) {
      console.error("Error toggling banner status:", error)
      toast.error("Không thể cập nhật trạng thái banner")
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true)

      if (editingBanner) {
        await BannerService.updateBanner(editingBanner.id, formData)
        toast.success("Cập nhật banner thành công")
      } else {
        await BannerService.createBanner(formData)
        toast.success("Thêm banner thành công")
      }

      setShowForm(false)
      setEditingBanner(null)
      fetchBanners()
    } catch (error) {
      console.error("Error submitting banner:", error)
      toast.error(editingBanner ? "Không thể cập nhật banner" : "Không thể thêm banner")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingBanner(null)
  }

  const columns = [
    {
      header: "Hình ảnh",
      accessor: "image_url",
      render: (item) => (
        <img src={item.image_url || "/placeholder.svg"} alt={item.title} className="w-20 h-12 object-cover rounded" />
      ),
    },
    { header: "Tiêu đề", accessor: "title" },
    { header: "Phụ đề", accessor: "subtitle" },
    {
      header: "Vị trí",
      accessor: "position",
      render: (item) => <span className="px-2 py-1 bg-gray-100 rounded text-sm">{item.position}</span>,
    },
    {
      header: "Trạng thái",
      accessor: "is_active",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {item.is_active ? "Hiển thị" : "Ẩn"}
        </span>
      ),
    },
    {
      header: "Ngày tạo",
      accessor: "created_at",
      render: (item) => new Date(item.created_at).toLocaleDateString("vi-VN"),
    },
  ]

  const actions = [
    {
      label: "Chỉnh sửa",
      icon: <FiEdit size={16} />,
      onClick: handleEditBanner,
      className: "text-blue-600 hover:text-blue-800",
    },
    {
      label: (banner) => (banner.is_active ? "Ẩn" : "Hiển thị"),
      icon: (banner) => (banner.is_active ? <FiEyeOff size={16} /> : <FiEye size={16} />),
      onClick: handleToggleStatus,
      className: (banner) =>
        banner.is_active ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800",
    },
    {
      label: "Xóa",
      icon: <FiTrash2 size={16} />,
      onClick: handleDeleteBanner,
      className: "text-red-600 hover:text-red-800",
    },
  ]

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Quản lý Banner</h1>
            <p className="text-gray-600">Quản lý banner hiển thị trên trang chủ</p>
          </div>
          <button
            onClick={handleAddBanner}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
          >
            <FiPlus size={20} />
            <span>Thêm banner</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm banner..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Banner Table */}
      <DataTable
        columns={columns}
        data={banners}
        actions={actions}
        onEdit={handleEditBanner}
        onDelete={handleDeleteBanner}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        searchable={false}
      />

      {/* Banner Form Modal */}
      {showForm && (
        <BannerForm
          banner={editingBanner}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isSubmitting}
        />
      )}
    </AdminLayout>
  )
}

export default BannersPage
