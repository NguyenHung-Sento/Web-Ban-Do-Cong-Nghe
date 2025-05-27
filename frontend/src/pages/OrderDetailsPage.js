"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import Layout from "../components/layout/Layout"
import Spinner from "../components/ui/Spinner"
import OrderService from "../services/order.service"
import ReviewService from "../services/review.service"
import ProductService from "../services/product.service"
import { FiCheckCircle, FiClock, FiStar } from "react-icons/fi"

const OrderDetailsPage = () => {
  const { id } = useParams()
  const { isLoggedIn } = useSelector((state) => state.auth)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewableProducts, setReviewableProducts] = useState([])

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const response = await OrderService.getOrderById(id)
        setOrder(response.data.order)

        // Check which products can be reviewed
        if (response.data.order.status === "delivered" || response.data.order.status === "completed") {
          const reviewableItems = []

          for (const item of response.data.order.items) {
            try {
              // Get product details to get the slug
              const reviewCheck = await ReviewService.checkCanReview(item.product_id)
              let productSlug = null
              try {
                // Fetch product details to get the slug
                const productResponse = await ProductService.getProductById(item.product_id)
                if (productResponse.data && productResponse.data.product) {
                  productSlug = productResponse.data.product.slug
                }
              } catch (err) {
                console.error("Error fetching product slug:", err)
              }

              reviewableItems.push({
                ...item,
                canReview: reviewCheck.data.can_review,
                hasReviewed: reviewCheck.data.has_reviewed,
                userReview: reviewCheck.data.user_review,
                product_slug: productSlug,
              })
            } catch (err) {
              console.error("Error checking review status:", err)
              reviewableItems.push({
                ...item,
                canReview: false,
                hasReviewed: false,
              })
            }
          }

          setReviewableProducts(reviewableItems)
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải thông tin đơn hàng")
        toast.error("Không thể tải thông tin đơn hàng")
      } finally {
        setLoading(false)
      }
    }

    if (isLoggedIn && id) {
      fetchOrderDetails()
    }
  }, [id, isLoggedIn])

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Chờ xử lý</span>
      case "processing":
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Đang xử lý</span>
      case "shipped":
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Đang giao hàng</span>
      case "delivered":
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Đã giao hàng</span>
      case "completed":
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Hoàn thành</span>
      case "cancelled":
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Đã hủy</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{status}</span>
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Chờ thanh toán</span>
      case "paid":
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Đã thanh toán</span>
      case "failed":
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Thanh toán thất bại</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{status}</span>
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-10">
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container-custom py-10">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-dark mb-6">{error || "Đơn hàng không tồn tại hoặc bạn không có quyền xem"}</p>
            <Link to="/orders" className="btn btn-primary">
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container-custom py-10">
        <div className="mb-6">
          <Link to="/orders" className="text-primary hover:underline flex items-center">
            &larr; Quay lại danh sách đơn hàng
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold mb-2">Đơn hàng #{order.id}</h1>
              <p className="text-gray-dark">Ngày đặt: {formatDate(order.created_at)}</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="mb-2">{getStatusBadge(order.status)}</div>
              <div>{getPaymentStatusBadge(order.payment_status)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Thông tin khách hàng</h2>
              <p className="mb-1">
                <span className="font-medium">Tên:</span> {order.user_name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {order.user_email}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">Địa chỉ giao hàng</h2>
              <p>{order.shipping_address}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Phương thức thanh toán</h2>
            <p>{order.payment_method}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Sản phẩm</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-dark">Sản phẩm</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-dark">Số lượng</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-dark">Giá</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-dark">Tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <img
                            src={item.product_image || "/placeholder.svg"}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-md mr-4"
                          />
                          <div>
                            <Link
                              to={`/product/${item.product_id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {item.product_name}
                            </Link>
                            {item.options && (
                              <div className="text-sm text-gray-dark mt-1">
                                {JSON.parse(item.options).color && <div>Màu: {JSON.parse(item.options).color}</div>}
                                {JSON.parse(item.options).storage && (
                                  <div>Dung lượng: {JSON.parse(item.options).storage}</div>
                                )}
                                {JSON.parse(item.options).config && (
                                  <div>Cấu hình: {JSON.parse(item.options).config}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">{item.quantity}</td>
                      <td className="px-4 py-4 text-right">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          item.price * item.quantity,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right font-medium">
                      Tổng cộng:
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        order.total_amount,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Review Section - Only show for delivered/completed orders */}
          {(order.status === "delivered" || order.status === "completed") && reviewableProducts.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h2>
              <p className="mb-4 text-gray-600">Hãy chia sẻ trải nghiệm của bạn về các sản phẩm đã mua:</p>

              <div className="space-y-6">
                {reviewableProducts.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <img
                        src={item.product_image || "/placeholder.svg"}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <h3 className="font-medium">{item.product_name}</h3>
                        {item.options && (
                          <div className="text-sm text-gray-dark mt-1">
                            {JSON.parse(item.options).color && (
                              <span className="mr-2">Màu: {JSON.parse(item.options).color}</span>
                            )}
                            {JSON.parse(item.options).storage && (
                              <span>Dung lượng: {JSON.parse(item.options).storage}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.hasReviewed ? (
                      <div className="bg-green-50 p-3 rounded-md flex items-center">
                        <FiCheckCircle className="text-green-500 mr-2" />
                        <span>Bạn đã đánh giá sản phẩm này</span>
                        <Link to={`/product/${item.product_slug}`} className="ml-auto text-primary hover:underline">
                          Xem đánh giá
                        </Link>
                      </div>
                    ) : item.canReview ? (
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="flex items-center mb-3 sm:mb-0">
                          <FiStar className="text-yellow-400 mr-2" />
                          <span>Bạn có thể đánh giá sản phẩm này</span>
                        </div>
                        <Link
                          to={
                            item.product_slug
                              ? `/product/${item.product_slug}?review=true`
                              : `/product/${item.product_id}`
                          }
                          className="btn btn-primary sm:ml-auto"
                        >
                          Viết đánh giá
                        </Link>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-md flex items-center">
                        <FiClock className="text-gray-500 mr-2" />
                        <span>Bạn đã đánh giá sản phẩm này hoặc chưa đủ điều kiện để đánh giá</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default OrderDetailsPage
