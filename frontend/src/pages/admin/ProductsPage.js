"use client"

import { useState, useEffect } from "react"
import { FiPlus } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import DataTable from "../../components/admin/DataTable"
import ProductForm from "../../components/admin/ProductForm"
import AdminService from "../../services/admin.service"
import { toast } from "react-toastify"

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const itemsPerPage = 10

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      }

      if (searchTerm) params.search = searchTerm
      if (categoryFilter) params.category_id = categoryFilter
      if (statusFilter) params.status = statusFilter

      const response = await AdminService.getProducts(params)

      if (response?.data?.data) {
        setProducts(response.data.data.products || [])
        setTotalItems(response.data.data.total || response.data.data.pagination?.total || 0)
        setTotalPages(response.data.data.pagination?.pages || 0)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Không thể tải danh sách sản phẩm")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [currentPage])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when searching
      fetchProducts()
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, categoryFilter, statusFilter])

  const fetchCategories = async () => {
    try {
      const response = await AdminService.getCategories()
      if (response?.data?.data?.categories) {
        setCategories(response.data.data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      try {
        await AdminService.deleteProduct(product.id)
        toast.success("Xóa sản phẩm thành công")
        fetchProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
        toast.error("Không thể xóa sản phẩm")
      }
    }
  }

  const handleViewProduct = (product) => {
    // Navigate to product detail page or show modal
    window.open(`/product/${product.slug}`, "_blank")
  }

  const handleFormSave = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "N/A"
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
    { header: "Tên sản phẩm", accessor: "name" },
    {
      header: "Danh mục",
      accessor: "category_id",
      render: (item) => getCategoryName(item.category_id),
    },
    { header: "Thương hiệu", accessor: "brand" },
    {
      header: "Giá",
      accessor: "price",
      render: (item) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price),
    },
    {
      header: "Giá KM",
      accessor: "sale_price",
      render: (item) =>
        item.sale_price
          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.sale_price)
          : "-",
    },
    { header: "Tồn kho", accessor: "stock" },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (item) => {
        const statusClasses = {
          active: "bg-green-100 text-green-800",
          inactive: "bg-red-100 text-red-800",
        }
        const statusLabels = {
          active: "Đang bán",
          inactive: "Ngừng bán",
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[item.status] || "bg-gray-100"}`}>
            {statusLabels[item.status] || item.status}
          </span>
        )
      },
    },
    {
      header: "Nổi bật",
      accessor: "featured",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.featured ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {item.featured ? "Có" : "Không"}
        </span>
      ),
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
            <h1 className="text-2xl font-semibold text-gray-800">Quản lý sản phẩm</h1>
            <p className="text-gray-600">Quản lý danh sách sản phẩm trong hệ thống</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"
          >
            <FiPlus className="mr-2" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Tìm kiếm:</label>
            <input
              type="text"
              placeholder="Tên sản phẩm, thương hiệu..."
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Danh mục:</label>
            <select
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Trạng thái:</label>
            <select
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="text-gray-700">Tổng số: </span>
          <span className="font-semibold">{totalItems} sản phẩm</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        onView={handleViewProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        totalItems={totalItems}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
      />

      {showForm && <ProductForm product={editingProduct} onSave={handleFormSave} onCancel={handleFormCancel} />}
    </AdminLayout>
  )
}

export default ProductsPage
