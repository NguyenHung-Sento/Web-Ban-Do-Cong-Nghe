import api from "./api"

const CategoryService = {
  getAllCategories: async () => {
    const response = await api.get("/categories")
    return response.data
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`)
    return response.data
  },
}

export default CategoryService

