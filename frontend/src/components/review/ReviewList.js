"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { FiStar, FiUser, FiTrash2, FiMessageSquare, FiCheck } from "react-icons/fi"
import ReviewService from "../../services/review.service"
import Spinner from "../ui/Spinner"
import Pagination from "../ui/Pagination"
import ReviewForm from "./ReviewForm"
import { toast } from "react-toastify"

// Thêm hàm onReviewUpdated vào props và gọi khi có thay đổi
const ReviewList = ({ productId, onReviewUpdated }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ average_rating: 0, rating_distribution: [] })
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userReview, setUserReview] = useState(null)
  const [canReview, setCanReview] = useState(false)
  const [productVariantDetails, setProductVariantDetails] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const isAdmin = user && user.role === "admin"

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true)
      const response = await ReviewService.getProductReviews(productId, { page, limit: pagination.limit })
      setReviews(response.data.reviews)
      setStats(response.data.stats)
      setPagination(response.data.pagination)

      if (isLoggedIn) {
        const reviewCheck = await ReviewService.checkCanReview(productId)
        setUserReview(reviewCheck.data.user_review)
        setCanReview(reviewCheck.data.can_review)

        // Nếu người dùng có thể đánh giá, lấy thông tin chi tiết sản phẩm đã mua
        if (reviewCheck.data.can_review && reviewCheck.data.purchase_details) {
          const options = reviewCheck.data.purchase_details.options
            ? typeof reviewCheck.data.purchase_details.options === "string"
              ? JSON.parse(reviewCheck.data.purchase_details.options)
              : reviewCheck.data.purchase_details.options
            : null

          if (options) {
            const details = []
            if (options.color) details.push(`Màu: ${options.color}`)
            if (options.storage) details.push(`Dung lượng: ${options.storage}`)
            if (options.config) details.push(`Cấu hình: ${options.config}`)

            if (details.length > 0) {
              setProductVariantDetails(details.join(", "))
            }
          }
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải đánh giá")
    } finally {
      setLoading(false)
    }
  }

  // Add this function to explain review requirements
  const renderReviewRequirements = () => {
    if (isLoggedIn && !canReview && !userReview) {
      return (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="font-medium mb-2">Quy định đánh giá sản phẩm</h3>
          <p className="text-gray-600 mb-2">Để đánh giá sản phẩm, bạn cần:</p>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Đã mua sản phẩm này và thanh toán thành công</li>
            <li>Đơn hàng đã được giao thành công</li>
          </ul>
        </div>
      )
    }

    return null
  }

  useEffect(() => {
    fetchReviews()
  }, [productId, isLoggedIn])

  const handlePageChange = (page) => {
    fetchReviews(page)
  }

  const handleReviewSubmitted = () => {
    fetchReviews()
    // Gọi callback để cập nhật thông tin sản phẩm
    if (onReviewUpdated) {
      onReviewUpdated()
    }
  }

  // Xử lý trả lời đánh giá (chỉ dành cho admin)
  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời")
      return
    }

    try {
      setIsSubmittingReply(true)
      await ReviewService.replyToReview(reviewId, { comment: replyText })
      toast.success("Trả lời đánh giá thành công")
      setReplyingTo(null)
      setReplyText("")
      fetchReviews()
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi trả lời đánh giá")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Cập nhật các hàm xử lý khác để gọi onReviewUpdated
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa trả lời này không?")) {
      return
    }

    try {
      await ReviewService.deleteReply(replyId)
      toast.success("Xóa trả lời thành công")
      fetchReviews()
      if (onReviewUpdated) {
        onReviewUpdated()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa trả lời")
    }
  }

  // Tính phần trăm cho từng mức đánh giá
  const calculatePercentage = (count) => {
    if (!stats.rating_distribution || stats.rating_distribution.length === 0) return 0
    const total = stats.rating_distribution.reduce((sum, item) => sum + item.count, 0)
    return total > 0 ? Math.round((count / total) * 100) : 0
  }

  // Format thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
  }

  return (
    <div>
      {renderReviewRequirements()}
      {isLoggedIn && (
        <ReviewForm
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
          userReview={userReview}
          canEdit={true}
          canReview={canReview}
          productVariantDetails={productVariantDetails}
        />
      )}
      {/* Tổng quan đánh giá */}
      <div className="bg-white border border-gray-200 rounded-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Đánh giá từ khách hàng</h3>

        <div className="flex flex-col md:flex-row">
          {/* Điểm đánh giá trung bình */}
          <div className="md:w-1/3 text-center mb-6 md:mb-0">
            <div className="text-5xl font-bold text-primary mb-2">{stats.average_rating}</div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`${
                    star <= Math.round(stats.average_rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                  size={20}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500">{pagination.total} đánh giá</div>
          </div>

          {/* Phân bố đánh giá */}
          <div className="md:w-2/3">
            {[5, 4, 3, 2, 1].map((star) => {
              const ratingItem = stats.rating_distribution.find((item) => Number(item.rating) === star)
              const count = ratingItem ? ratingItem.count : 0
              const percentage = calculatePercentage(count)

              return (
                <div key={star} className="flex items-center mb-2">
                  <div className="flex items-center w-16">
                    <span className="mr-1">{star}</span>
                    <FiStar className="text-yellow-400 fill-current" size={14} />
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-500">
                    {count} ({percentage}%)
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Danh sách đánh giá */}
      <div className="bg-white border border-gray-200 rounded-md p-6">
        <h3 className="text-lg font-medium mb-4">Tất cả đánh giá ({pagination.total})</h3>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có đánh giá nào cho sản phẩm này</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <FiUser className="text-gray-500" size={20} />
                    </div>
                    <div>
                      <div className="font-medium">{review.user_name}</div>
                      <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`${star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        size={16}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>

                {/* Hiển thị thông tin chi tiết sản phẩm đã mua */}
                {review.product_variant_details && (
                  <div className="mt-2 text-sm text-gray-500 italic">
                    Phiên bản đã mua: {review.product_variant_details}
                  </div>
                )}

                {/* Nút trả lời dành cho admin */}
                {isAdmin && replyingTo !== review.id && !review.replies?.length && (
                  <div className="mt-2">
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="text-primary hover:text-primary-dark text-sm flex items-center"
                    >
                      <FiMessageSquare className="mr-1" /> Trả lời
                    </button>
                  </div>
                )}

                {/* Form trả lời */}
                {isAdmin && replyingTo === review.id && (
                  <div className="mt-3 pl-5 border-l-2 border-gray-200">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <textarea
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Nhập trả lời của bạn..."
                      ></textarea>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReplySubmit(review.id)}
                          className="btn btn-primary btn-sm"
                          disabled={isSubmittingReply}
                        >
                          {isSubmittingReply ? <Spinner size="sm" /> : "Gửi trả lời"}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyText("")
                          }}
                          className="btn btn-outline btn-sm"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hiển thị các trả lời */}
                {review.replies && review.replies.length > 0 && (
                  <div className="mt-3 pl-5 border-l-2 border-gray-200">
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-3 rounded-md mb-2">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-2">
                              <FiCheck size={16} />
                            </div>
                            <div>
                              <div className="font-medium flex items-center">
                                {reply.user_name}
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                  Admin
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">{formatDate(reply.created_at)}</div>
                            </div>
                          </div>

                          {/* Nút xóa trả lời dành cho admin */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteReply(reply.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                              title="Xóa trả lời"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700">{reply.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewList
