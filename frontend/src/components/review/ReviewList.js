"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { FiStar, FiUser } from "react-icons/fi"
import ReviewService from "../../services/review.service"
import Spinner from "../ui/Spinner"
import Pagination from "../ui/Pagination"
import ReviewForm from "./ReviewForm"

const ReviewList = ({ productId }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ average_rating: 0, rating_distribution: [] })
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userReview, setUserReview] = useState(null)
  const [canReview, setCanReview] = useState(false)

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true)
      const response = await ReviewService.getProductReviews(productId, { page, limit: pagination.limit })
      setReviews(response.data.reviews)
      setStats(response.data.stats)
      setPagination(response.data.pagination)

      if (isLoggedIn) {
        setUserReview(response.data.user_review)
        setCanReview(response.data.can_review)
      }
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải đánh giá")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId, isLoggedIn])

  const handlePageChange = (page) => {
    fetchReviews(page)
  }

  const handleReviewSubmitted = () => {
    fetchReviews()
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

      {/* Form đánh giá của người dùng */}
      {isLoggedIn && (canReview || userReview) && (
        <ReviewForm
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
          userReview={userReview}
          canEdit={true}
        />
      )}

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
