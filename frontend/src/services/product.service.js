import api from "./api"

const ProductService = {
  getAllProducts: async (params) => {

    // Create a new URLSearchParams object to build the query string
    const queryParams = new URLSearchParams()

    // Add all non-null and non-undefined params to the query string
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          queryParams.append(key, value)
        }
      })
    }

    const response = await api.get(`/products?${queryParams.toString()}`)
    return response.data
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`)
    return response.data
  },

  searchProducts: async (keyword, params = {}) => {

    try {
      const response = await api.get("/products/search", {
        params: {
          q: keyword,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error("Error in searchProducts:", error)
      throw error
    }
  },

  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get("/products/featured", { params: { limit } })
    return response.data
  },

  getNewArrivals: async (limit = 8) => {
    const response = await api.get("/products/new-arrivals", { params: { limit } })
    return response.data
  },

  getBestSellers: async (limit = 8) => {
    const response = await api.get("/products/best-sellers", { params: { limit } })
    return response.data
  },

  getRelatedProducts: async (productId, limit = 4) => {
    const response = await api.get(`/products/${productId}/related`, { params: { limit } })
    return response.data
  },
}

export default ProductService

