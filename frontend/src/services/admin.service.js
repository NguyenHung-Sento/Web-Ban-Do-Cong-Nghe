import api from "./api"

class AdminService {
  // Dashboard
  getDashboardStats() {
    return api.get("/admin/dashboard")
  }

  // Products
  getProducts(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search) queryParams.append("search", params.search)
    if (params.category_id) queryParams.append("category_id", params.category_id)
    if (params.status) queryParams.append("status", params.status)

    return api.get(`/products?${queryParams.toString()}`)
  }

  getProduct(id) {
    return api.get(`/products/${id}`)
  }

  createProduct(productData) {
    return api.post("/products", productData)
  }

  updateProduct(id, productData) {
    return api.put(`/products/${id}`, productData)
  }

  deleteProduct(id) {
    return api.delete(`/products/${id}`)
  }

  // Categories
  getCategories(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search) queryParams.append("search", params.search)

    return api.get(`/categories?${queryParams.toString()}`)
  }

  getCategory(id) {
    return api.get(`/categories/${id}`)
  }

  createCategory(categoryData) {
    return api.post("/categories", categoryData)
  }

  updateCategory(id, categoryData) {
    return api.put(`/categories/${id}`, categoryData)
  }

  deleteCategory(id) {
    return api.delete(`/categories/${id}`)
  }

  // Orders
  getOrders(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search) queryParams.append("search", params.search)
    if (params.status) queryParams.append("status", params.status)
    if (params.payment_status) queryParams.append("payment_status", params.payment_status)
    if (params.start_date) queryParams.append("start_date", params.start_date)
    if (params.end_date) queryParams.append("end_date", params.end_date)

    return api.get(`/orders?${queryParams.toString()}`)
  }

  getOrder(id) {
    return api.get(`/orders/${id}`)
  }

  updateOrderStatus(id, statusData) {
    return api.put(`/orders/${id}/status`, statusData)
  }

  updatePaymentStatus(id, statusData) {
    return api.put(`/orders/${id}/payment`, statusData)
  }

  // Users
  getUsers(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search) queryParams.append("search", params.search)
    if (params.role) queryParams.append("role", params.role)

    return api.get(`/users?${queryParams.toString()}`)
  }

  getUser(id) {
    return api.get(`/users/${id}`)
  }

  createUser(userData) {
    return api.post("/users", userData)
  }

  updateUser(id, userData) {
    return api.put(`/users/${id}`, userData)
  }

  deleteUser(id) {
    return api.delete(`/users/${id}`)
  }

// Banners
  getBanners(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search) queryParams.append("search", params.search)

    return api.get(`/banners?${queryParams.toString()}`)
  }

  // Get active banners (public)
  getActiveBanners() {
    return api.get("/banners/active")
  }

  // Get banner by ID
  getBanner(id) {
    return api.get(`/banners/${id}`)
  }

  // Create new banner
  createBanner(bannerData) {
    return api.post("/banners", bannerData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  // Update banner
  updateBanner(id, bannerData) {
    return api.put(`/banners/${id}`, bannerData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  // Delete banner
  deleteBanner(id) {
    return api.delete(`/banners/${id}`)
  }

  // Toggle banner status
  toggleBannerStatus(id) {
    return api.patch(`/banners/${id}/toggle`)
  }

  // Update banner position
  updateBannerPosition(id, position) {
    return api.patch(`/banners/${id}/position`, { position })
  }
}

export default new AdminService()
