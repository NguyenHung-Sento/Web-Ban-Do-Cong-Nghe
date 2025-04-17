"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { FiStar, FiEdit, FiTrash2 } from "react-icons/fi"
import ReviewService from "../../services/review.service"
import Spinner from "../ui/Spinner"

const ReviewForm = ({ productId, onReviewSubmitted, userReview, canEdit = false }) => {
  const { isLoggedIn } = useSelector((state) => state.auth)
  const [rating, setRating] = useState(userReview ? userReview.rating : 5)
  const [comment, setComment] = useState(userReview ? userReview.comment : "")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(!userReview)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRatingChange = (newRating) => {
    setRating(newRating)
  }

  const handleCommentChange = (e) => {
    setComment(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm")
      return
    }

    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5")
      return
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá")
      return
    }

    try {
      setIsSubmitting(true)

      if (userReview) {
        // Cập nhật đánh giá
        await ReviewService.updateReview(userReview.id, { rating, comment })
        toast.success("Cập nhật đánh giá thành công")
      } else {
        // Tạo đánh giá mới
        await ReviewService.createReview(productId, { rating, comment })
        toast.success("Đánh giá sản phẩm thành công")
      }

      setIsEditing(false)
      if (onReviewSubmitted) onReviewSubmitted()
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
      return
    }

    try {
      setIsDeleting(true)
      await ReviewService.deleteReview(userReview.id)
      toast.success("Xóa đánh giá thành công")
      if (onReviewSubmitted) onReviewSubmitted()
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa đánh giá")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (userReview) {
      setRating(userReview.rating)
      setComment(userReview.comment)
      setIsEditing(false)
    } else {
      setRating(5)
      setComment("")
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-center">
        <p>Vui lòng đăng nhập để đánh giá sản phẩm</p>
      </div>
    )
  }

  if (userReview && !isEditing) {
    return (
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`${star <= userReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  size={20}
                />
              ))}
            </div>
            <span className="ml-2 font-medium">Đánh giá của bạn</span>
          </div>
          {canEdit && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 flex items-center"
                disabled={isDeleting}
              >
                <FiEdit className="mr-1" /> Sửa
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <FiTrash2 className="mr-1" /> Xóa
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <p className="text-gray-700">{userReview.comment}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 mb-6">
      <h3 className="text-lg font-medium mb-4">{userReview ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Số sao:</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <FiStar
                  className={`${star <= (hoveredRating || rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  size={24}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="comment" className="block mb-2">
            Nội dung đánh giá:
          </label>
          <textarea
            id="comment"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={comment}
            onChange={handleCommentChange}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          ></textarea>
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : userReview ? "Cập nhật" : "Gửi đánh giá"}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleCancel}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
