import api from "./api"

class BannerService {
  // Get all banners (admin)
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

export default new BannerService()
