"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AdminLayout from "../../components/admin/AdminLayout"
import AdminService from "../../services/admin.service"
import { toast } from "react-toastify"

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetail()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true)
      const response = await AdminService.getOrder(id)
      if (response?.data?.data?.order) {
        setOrder(response.data.data.order)
      }
    } catch (error) {
      console.error("Error fetching order detail:", error)
      toast.error("Không thể tải chi tiết đơn hàng")
      navigate("/admin/orders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      await AdminService.updateOrderStatus(id, { status: newStatus })
      toast.success("Cập nhật trạng thái đơn hàng thành công")
      fetchOrderDetail()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Không thể cập nhật trạng thái đơn hàng")
    }
  }

  const handleUpdatePaymentStatus = async (newStatus) => {
    try {
      await AdminService.updatePaymentStatus(id, { payment_status: newStatus })
      toast.success("Cập nhật trạng thái thanh toán thành công")
      fetchOrderDetail()
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Không thể cập nhật trạng thái thanh toán")
    }
  }

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }
    return statusMap[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status, type = "order") => {
    if (type === "payment") {
      const paymentStatusMap = {
        pending: "Chờ thanh toán",
        paid: "Đã thanh toán",
        failed: "Thanh toán thất bại",
      }
      return paymentStatusMap[status] || status
    }

    const orderStatusMap = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    }
    return orderStatusMap[status] || status
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không tìm thấy đơn hàng</h2>
          <button
            onClick={() => navigate("/admin/orders")}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Quay lại danh sách
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate("/admin/orders")} className="mr-4 text-gray-600 hover:text-gray-800">
              ← Quay lại
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Chi tiết đơn hàng #{order.id}</h1>
          </div>
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment_status)}`}>
              {getStatusLabel(order.payment_status, "payment")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin đơn hàng */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sản phẩm */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center border-b pb-4 last:border-b-0">
                  <img
                    src={item.product_image || "/placeholder.svg?height=60&width=60"}
                    alt={item.product_name}
                    className="w-15 h-15 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product_name}</h3>
                    {item.variant_name && <p className="text-sm text-gray-500">{item.variant_name}</p>}
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity} ×{" "}
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        item.price * item.quantity,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-primary">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Địa chỉ giao hàng</h2>
            <div className="text-gray-700">
              <p className="font-medium">{order.customer_name}</p>
              <p>{order.customer_phone}</p>
              <p>{order.customer_email}</p>
              <p className="mt-2">{order.shipping_address}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thông tin đơn hàng */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày đặt:</span>
                <span>{new Date(order.created_at).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thanh toán:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                  {getStatusLabel(order.payment_status, "payment")}
                </span>
              </div>
            </div>
          </div>

          {/* Cập nhật trạng thái */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Cập nhật trạng thái</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái đơn hàng</label>
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipped">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái thanh toán</label>
                <select
                  value={order.payment_status}
                  onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Chờ thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Thanh toán thất bại</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default OrderDetailPage
