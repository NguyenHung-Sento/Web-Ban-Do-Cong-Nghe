import api from "./api"

const ReviewService = {
  // Lấy đánh giá cho một sản phẩm
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/reviews/products/${productId}`, { params })
    return response.data
  },

  // Kiểm tra xem người dùng có thể đánh giá sản phẩm không
  checkCanReview: async (productId) => {
    const response = await api.get(`/reviews/check/${productId}`)
    return response.data
  },

  // Tạo đánh giá mới
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/reviews/products/${productId}`, reviewData)
    return response.data
  },

  // Cập nhật đánh giá
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData)
    return response.data
  },

  // Xóa đánh giá
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`)
    return response.data
  },

  // Admin trả lời đánh giá
  replyToReview: async (reviewId, replyData) => {
    const response = await api.post(`/reviews/${reviewId}/reply`, replyData)
    return response.data
  },

  // Admin xóa trả lời đánh giá
  deleteReply: async (replyId) => {
    const response = await api.delete(`/reviews/reply/${replyId}`)
    return response.data
  },
}

export default ReviewService
