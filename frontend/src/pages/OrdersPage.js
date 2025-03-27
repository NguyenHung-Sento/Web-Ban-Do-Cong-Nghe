"use client"

import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import OrderService from "../services/order.service"
import { FiPackage, FiShoppingBag, FiClock, FiCheck, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi"

const OrdersPage = () => {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)

  const { isLoggedIn } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login?redirect=orders")
      return
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await OrderService.getAllOrders()
        setOrders(response.data.orders)
        setIsLoading(false)
      } catch (error) {
        setError(error.response?.data?.message || "Không thể lấy danh sách đơn hàng")
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [isLoggedIn, navigate])

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-yellow-500" />
      case "processing":
        return <FiPackage className="text-blue-500" />
      case "shipped":
        return <FiShoppingBag className="text-purple-500" />
      case "delivered":
        return <FiCheck className="text-green-500" />
      case "cancelled":
        return <FiX className="text-red-500" />
      default:
        return <FiClock className="text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận"
      case "processing":
        return "Đang xử lý"
      case "shipped":
        return "Đang giao hàng"
      case "delivered":
        return "Đã giao hàng"
      case "cancelled":
        return "Đã hủy"
      default:
        return "Không xác định"
    }
  }

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ thanh toán"
      case "paid":
        return "Đã thanh toán"
      case "failed":
        return "Thanh toán thất bại"
      default:
        return "Không xác định"
    }
  }

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="mb-6">Đơn hàng của tôi</h1>

        {isLoading ? (
          <div className="py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <FiShoppingBag size={64} className="text-gray-dark" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Bạn chưa có đơn hàng nào</h2>
            <p className="text-gray-dark mb-6">Hãy mua sắm và đặt hàng để xem lịch sử đơn hàng của bạn.</p>
            <Link to="/products" className="btn btn-primary">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-light">
                  <tr>
                    <th className="py-4 px-6 text-left">Mã đơn hàng</th>
                    <th className="py-4 px-6 text-center">Ngày đặt</th>
                    <th className="py-4 px-6 text-center">Tổng tiền</th>
                    <th className="py-4 px-6 text-center">Trạng thái</th>
                    <th className="py-4 px-6 text-center">Thanh toán</th>
                    <th className="py-4 px-6 text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="border-b border-gray-medium">
                        <td className="py-4 px-6">
                          <span className="font-medium">#{order.id}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {new Date(order.created_at).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-4 px-6 text-center font-medium">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                            order.total_amount,
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                order.status,
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{getStatusText(order.status)}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusClass(
                              order.payment_status,
                            )}`}
                          >
                            {getPaymentStatusText(order.payment_status)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => toggleOrderDetails(order.id)}
                            className="text-primary hover:text-primary-dark"
                          >
                            {expandedOrder === order.id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                          </button>
                        </td>
                      </tr>

                      {expandedOrder === order.id && (
                        <tr>
                          <td colSpan="6" className="py-4 px-6 bg-gray-50">
                            <div className="mb-4">
                              <h3 className="font-bold mb-2">Thông tin giao hàng</h3>
                              <p>{order.shipping_address}</p>
                            </div>

                            <div className="mb-4">
                              <h3 className="font-bold mb-2">Phương thức thanh toán</h3>
                              <p>{order.payment_method}</p>
                            </div>

                            <div>
                              <h3 className="font-bold mb-2">Sản phẩm</h3>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="py-2 px-4 text-left">Sản phẩm</th>
                                      <th className="py-2 px-4 text-center">Giá</th>
                                      <th className="py-2 px-4 text-center">Số lượng</th>
                                      <th className="py-2 px-4 text-right">Tổng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items?.map((item) => (
                                      <tr key={item.id} className="border-b border-gray-200">
                                        <td className="py-2 px-4">
                                          <div className="flex items-center">
                                            {item.product_image && (
                                              <img
                                                src={item.product_image || "/placeholder.svg"}
                                                alt={item.product_name}
                                                className="w-10 h-10 object-contain mr-2"
                                              />
                                            )}
                                            <span>{item.product_name}</span>
                                          </div>
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                          {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                          }).format(item.price)}
                                        </td>
                                        <td className="py-2 px-4 text-center">{item.quantity}</td>
                                        <td className="py-2 px-4 text-right">
                                          {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                          }).format(item.price * item.quantity)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colSpan="3" className="py-2 px-4 text-right font-bold">
                                        Tổng cộng:
                                      </td>
                                      <td className="py-2 px-4 text-right font-bold text-primary">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                          order.total_amount,
                                        )}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default OrdersPage

