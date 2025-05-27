const Product = require("../models/product.model")
const fs = require("fs")
const path = require("path")

// Helper function to validate and parse JSON
const validateAndParseJSON = (jsonString, fieldName) => {
  if (!jsonString || typeof jsonString !== "string" || !jsonString.trim()) {
    return null
  }

  try {
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed) // Re-stringify to ensure valid JSON
  } catch (e) {
    throw new Error(`${fieldName} phải là JSON hợp lệ`)
  }
}

// Helper function to truncate description if too long
const truncateDescription = (description, maxLength = 65535) => {
  if (!description || typeof description !== "string") {
    return description
  }

  if (description.length <= maxLength) {
    return description
  }

  // Try to truncate at a reasonable point (end of a tag or sentence)
  let truncated = description.substring(0, maxLength - 100) // Leave some buffer

  // Find the last complete HTML tag
  const lastTagEnd = truncated.lastIndexOf(">")
  const lastTagStart = truncated.lastIndexOf("<", lastTagEnd)

  if (lastTagStart > -1 && lastTagEnd > lastTagStart) {
    truncated = truncated.substring(0, lastTagEnd + 1)
  }

  return truncated + "..."
}

// Lấy tất cả sản phẩm với phân trang và lọc
exports.getAllProducts = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Extract filter parameters
    const filters = {
      category_id: req.query.category_id,
      brand: req.query.brand,
      price_min: req.query.price_min,
      price_max: req.query.price_max,
      featured: req.query.featured === "true",
      status: req.query.status,
      search: req.query.search,
      sort: req.query.sort,
    }

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key]
      }
    })

    const products = await Product.findAll(limit, offset, filters)
    const total = await Product.countAll(filters)

    // Parse JSON fields for each product
    products.forEach((product) => {
      if (product.specifications && typeof product.specifications === "string") {
        try {
          product.specifications = JSON.parse(product.specifications)
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }

      if (product.variants && typeof product.variants === "string") {
        try {
          product.variants = JSON.parse(product.variants)
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }

      if (product.images && typeof product.images === "string") {
        try {
          product.images = JSON.parse(product.images)
        } catch (e) {
          // If not JSON, split by comma
          product.images = product.images
            .split(",")
            .map((img) => img.trim())
            .filter((img) => img)
        }
      }
    })

    res.json({
      status: "success",
      data: {
        products,
        total, // Thêm total vào data level
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error in getAllProducts:", error)
    next(error)
  }
}

// Lấy một sản phẩm theo ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    // Parse JSON fields if they are strings
    if (product.specifications && typeof product.specifications === "string") {
      try {
        product.specifications = JSON.parse(product.specifications)
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    if (product.variants && typeof product.variants === "string") {
      try {
        product.variants = JSON.parse(product.variants)
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    if (product.images && typeof product.images === "string") {
      try {
        product.images = JSON.parse(product.images)
      } catch (e) {
        // If not JSON, split by comma
        product.images = product.images
          .split(",")
          .map((img) => img.trim())
          .filter((img) => img)
      }
    }

    res.json({
      status: "success",
      data: {
        product,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Lấy một sản phẩm theo slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findBySlug(req.params.slug)

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    res.json({
      status: "success",
      data: {
        product,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Tạo sản phẩm mới
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body }

    // Truncate description if too long
    if (productData.description) {
      productData.description = truncateDescription(productData.description)
    }

    // Validate and process JSON fields
    if (productData.specifications) {
      productData.specifications = validateAndParseJSON(productData.specifications, "Thông số kỹ thuật")
    }

    if (productData.variants) {
      productData.variants = validateAndParseJSON(productData.variants, "Biến thể")
    }

    if (productData.images) {
      // Handle images field
      if (typeof productData.images === "string") {
        if (productData.images.trim().startsWith("[")) {
          // It's JSON array
          productData.images = validateAndParseJSON(productData.images, "Gallery hình ảnh")
        } else {
          // It's comma-separated string
          const imageArray = productData.images
            .split(",")
            .map((img) => img.trim())
            .filter((img) => img)
          productData.images = JSON.stringify(imageArray)
        }
      }
    }

    const productId = await Product.create(productData)

    res.status(201).json({
      status: "success",
      message: "Tạo sản phẩm thành công",
      data: {
        id: productId,
      },
    })
  } catch (error) {
    console.error("Error in createProduct:", error)
    next(error)
  }
}

// Cập nhật sản phẩm
exports.updateProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body }

    // Lấy sản phẩm hiện tại
    const existingProduct = await Product.findById(req.params.id)

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    // Truncate description if too long
    if (productData.description) {
      productData.description = truncateDescription(productData.description)
    }

    // Validate and process JSON fields
    if (productData.specifications) {
      productData.specifications = validateAndParseJSON(productData.specifications, "Thông số kỹ thuật")
    }

    if (productData.variants) {
      productData.variants = validateAndParseJSON(productData.variants, "Biến thể")
    }

    if (productData.images) {
      // Handle images field
      if (typeof productData.images === "string") {
        if (productData.images.trim().startsWith("[")) {
          // It's JSON array
          productData.images = validateAndParseJSON(productData.images, "Gallery hình ảnh")
        } else {
          // It's comma-separated string
          const imageArray = productData.images
            .split(",")
            .map((img) => img.trim())
            .filter((img) => img)
          productData.images = JSON.stringify(imageArray)
        }
      }
    }

    const success = await Product.update(req.params.id, productData)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm hoặc không có thay đổi",
      })
    }

    res.json({
      status: "success",
      message: "Cập nhật sản phẩm thành công",
    })
  } catch (error) {
    console.error("Error in updateProduct:", error)
    next(error)
  }
}

// Xóa sản phẩm
exports.deleteProduct = async (req, res, next) => {
  try {
    // Lấy sản phẩm hiện tại
    const existingProduct = await Product.findById(req.params.id)

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    const success = await Product.delete(req.params.id)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    res.json({
      status: "success",
      message: "Xóa sản phẩm thành công",
    })
  } catch (error) {
    next(error)
  }
}

// Upload nhiều hình ảnh cho gallery sản phẩm
exports.uploadGallery = async (req, res, next) => {
  try {
    const { productId, imageUrls } = req.body

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Không có URL hình ảnh nào được cung cấp",
      })
    }

    // Lấy sản phẩm hiện tại
    const existingProduct = await Product.findById(productId)

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    // Lấy hình ảnh gallery hiện tại
    let images = []
    if (existingProduct.images) {
      try {
        images = JSON.parse(existingProduct.images)
      } catch (e) {
        images = []
      }
    }

    // Thêm hình ảnh mới vào gallery
    images = [...images, ...imageUrls]

    // Cập nhật sản phẩm với gallery mới
    const success = await Product.update(productId, {
      images: JSON.stringify(images),
    })

    if (!success) {
      return res.status(500).json({
        status: "error",
        message: "Không thể cập nhật gallery sản phẩm",
      })
    }

    res.json({
      status: "success",
      message: "Upload gallery thành công",
      data: {
        images: imageUrls,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Tìm kiếm sản phẩm
exports.searchProducts = async (req, res, next) => {
  try {
    const keyword = req.query.q

    if (!keyword) {
      return res.status(400).json({
        status: "error",
        message: "Từ khóa tìm kiếm là bắt buộc",
      })
    }

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const products = await Product.search(keyword, limit, offset)
    const total = await Product.countSearch(keyword)

    res.json({
      status: "success",
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// Lấy sản phẩm liên quan
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    const relatedProducts = await Product.getRelatedProducts(
      req.params.id,
      product.category_id,
      Number.parseInt(req.query.limit) || 4,
    )

    res.json({
      status: "success",
      data: {
        products: relatedProducts,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Lấy sản phẩm nổi bật
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const featuredProducts = await Product.getFeaturedProducts(Number.parseInt(req.query.limit) || 8)

    res.json({
      status: "success",
      data: {
        products: featuredProducts,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Lấy sản phẩm mới
exports.getNewArrivals = async (req, res, next) => {
  try {
    const newArrivals = await Product.getNewArrivals(Number.parseInt(req.query.limit) || 8)

    res.json({
      status: "success",
      data: {
        products: newArrivals,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Lấy sản phẩm bán chạy
exports.getBestSellers = async (req, res, next) => {
  try {
    const bestSellers = await Product.getBestSellers(Number.parseInt(req.query.limit) || 8)

    res.json({
      status: "success",
      data: {
        products: bestSellers,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Thêm phương thức để lấy sản phẩm theo loại
exports.getProductsByType = async (req, res, next) => {
  try {
    const type = req.params.type
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    if (!["phone", "laptop", "accessory"].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Loại sản phẩm không hợp lệ",
      })
    }

    const products = await Product.findByType(type, limit, offset)
    const total = await Product.countByType(type)

    res.json({
      status: "success",
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}
