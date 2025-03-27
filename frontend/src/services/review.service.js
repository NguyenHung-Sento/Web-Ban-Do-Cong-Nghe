import api from "./api"

const ReviewService = {
  getProductReviews: async (productId, params) => {
    const response = await api.get(`/reviews/products/${productId}`, { params })
    return response.data
  },

  createReview: async (productId, reviewData) => {
    const response = await api.post(`/reviews/products/${productId}`, reviewData)
    return response.data
  },

  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData)
    return response.data
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`)
    return response.data
  },
}

export default ReviewService

