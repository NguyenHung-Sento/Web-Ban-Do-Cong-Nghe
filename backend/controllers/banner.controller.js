const Banner = require("../models/banner.model")

// Get all banners (admin)
exports.getAllBanners = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const search = req.query.search || ""

    const result = await Banner.getAll(page, limit, search)

    res.status(200).json({
      status: "success",
      message: "Lấy danh sách banner thành công",
      data: result,
    })
  } catch (error) {
    console.error("Error getting banners:", error)
    res.status(500).json({
      status: "error",
      message: "Lỗi khi lấy danh sách banner",
    })
  }
}

// Get active banners (public)
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.getActive()

    res.status(200).json({
      status: "success",
      message: "Lấy danh sách banner thành công",
      data: banners,
    })
  } catch (error) {
    console.error("Error getting active banners:", error)
    res.status(500).json({
      status: "error",
      message: "Lỗi khi lấy danh sách banner",
    })
  }
}

// Get banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)

    if (!banner) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy banner",
      })
    }

    res.status(200).json({
      status: "success",
      message: "Lấy thông tin banner thành công",
      data: banner,
    })
  } catch (error) {
    console.error("Error getting banner:", error)
    res.status(500).json({
      status: "error",
      message: "Lỗi khi lấy thông tin banner",
    })
  }
}

// Create new banner
exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, description, image_url, link_url, button_text, position, is_active } = req.body

    // Convert is_active to proper boolean/integer for MySQL
    let activeValue = 1 // default to true
    if (is_active !== undefined) {
      if (typeof is_active === "boolean") {
        activeValue = is_active ? 1 : 0
      } else if (typeof is_active === "string") {
        activeValue = is_active.toLowerCase() === "true" ? 1 : 0
      } else {
        activeValue = is_active ? 1 : 0
      }
    }

    const newBanner = {
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : null,
      description: description ? description.trim() : null,
      image_url: image_url.trim(),
      link_url: link_url ? link_url.trim() : null,
      button_text: button_text ? button_text.trim() : null,
      position: position ? Number.parseInt(position) : 0,
      is_active: activeValue,
    }

    const banner = await Banner.create(newBanner)

    res.status(201).json({
      status: "success",
      message: "Tạo banner thành công",
      data: banner,
    })
  } catch (error) {
    console.error("Error creating banner:", error)
    res.status(500).json({
      status: "error",
      message: "Lỗi khi tạo banner",
      error: error.message,
    })
  }
}

// Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { title, subtitle, description, image_url, link_url, button_text, position, is_active } = req.body

    // Check if banner exists
    const existingBanner = await Banner.findById(req.params.id)
    if (!existingBanner) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy banner",
      })
    }

    // Convert is_active to proper boolean/integer for MySQL
    let activeValue = 1 // default to true
    if (is_active !== undefined) {
      if (typeof is_active === "boolean") {
        activeValue = is_active ? 1 : 0
      } else if (typeof is_active === "string") {
        activeValue = is_active.toLowerCase() === "true" ? 1 : 0
      } else {
        activeValue = is_active ? 1 : 0
      }
    }

    const updatedBanner = {
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : null,
      description: description ? description.trim() : null,
      image_url: image_url.trim(),
      link_url: link_url ? link_url.trim() : null,
      button_text: button_text ? button_text.trim() : null,
      position: position ? Number.parseInt(position) : 0,
      is_active: activeValue,
    }

    const banner = await Banner.updateById(req.params.id, updatedBanner)

    res.status(200).json({
      status: "success",
      message: "Cập nhật banner thành công",
      data: banner,
    })
  } catch (error) {
    console.error("Error updating banner:", error)
    if (error.kind === "not_found") {
      res.status(404).json({
        status: "error",
        message: "Không tìm thấy banner",
      })
    } else {
      res.status(500).json({
        status: "error",
        message: "Lỗi khi cập nhật banner",
        error: error.message,
      })
    }
  }
}

// Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    await Banner.remove(req.params.id)

    res.status(200).json({
      status: "success",
      message: "Xóa banner thành công",
    })
  } catch (error) {
    console.error("Error deleting banner:", error)
    if (error.kind === "not_found") {
      res.status(404).json({
        status: "error",
        message: "Không tìm thấy banner",
      })
    } else {
      res.status(500).json({
        status: "error",
        message: "Lỗi khi xóa banner",
      })
    }
  }
}

// Toggle banner status
exports.toggleBannerStatus = async (req, res) => {
  try {
    await Banner.toggleStatus(req.params.id)

    res.status(200).json({
      status: "success",
      message: "Cập nhật trạng thái banner thành công",
    })
  } catch (error) {
    console.error("Error toggling banner status:", error)
    if (error.kind === "not_found") {
      res.status(404).json({
        status: "error",
        message: "Không tìm thấy banner",
      })
    } else {
      res.status(500).json({
        status: "error",
        message: "Lỗi khi cập nhật trạng thái banner",
      })
    }
  }
}

// Update banner position
exports.updateBannerPosition = async (req, res) => {
  try {
    const { position } = req.body

    if (position === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Vị trí banner là bắt buộc",
      })
    }

    await Banner.updatePosition(req.params.id, position)

    res.status(200).json({
      status: "success",
      message: "Cập nhật vị trí banner thành công",
    })
  } catch (error) {
    console.error("Error updating banner position:", error)
    if (error.kind === "not_found") {
      res.status(404).json({
        status: "error",
        message: "Không tìm thấy banner",
      })
    } else {
      res.status(500).json({
        status: "error",
        message: "Lỗi khi cập nhật vị trí banner",
      })
    }
  }
}
