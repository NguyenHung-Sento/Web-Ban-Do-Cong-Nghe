const Review = require("../models/review.model")
const Product = require("../models/product.model")
const db = require("../config/db.config")

// Lấy đánh giá cho một sản phẩm
exports.getProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.productId
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    const reviews = await Review.findByProductId(productId, limit, offset)
    const total = await Review.countByProductId(productId)
    const averageRating = await Review.getAverageRating(productId)
    const ratingDistribution = await Review.getRatingDistribution(productId)

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    let userReview = null
    let canReview = false

    if (req.user) {
      userReview = await Review.getUserReview(req.user.id, productId)

      // Kiểm tra xem người dùng đã mua sản phẩm và thanh toán chưa
      if (!userReview) {
        canReview = await Review.checkUserPurchased(req.user.id, productId)
      }
    }

    res.json({
      status: "success",
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats: {
          average_rating: Number.parseFloat(averageRating).toFixed(1),
          rating_distribution: ratingDistribution,
        },
        user_review: userReview,
        can_review: canReview,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Tạo đánh giá mới
exports.createReview = async (req, res, next) => {
  try {
    const productId = req.params.productId
    const { rating, comment } = req.body

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const hasReviewed = await Review.checkUserReviewed(req.user.id, productId)
    if (hasReviewed) {
      return res.status(400).json({
        status: "error",
        message: "Bạn đã đánh giá sản phẩm này rồi",
      })
    }

    // Kiểm tra xem người dùng đã mua sản phẩm và thanh toán chưa
    const hasPurchased = await Review.checkUserPurchased(req.user.id, productId)
    if (!hasPurchased) {
      return res.status(403).json({
        status: "error",
        message: "Bạn cần mua sản phẩm và hoàn tất thanh toán trước khi đánh giá",
      })
    }

    const reviewId = await Review.create({
      product_id: productId,
      user_id: req.user.id,
      rating,
      comment,
    })

    const review = await Review.findById(reviewId)

    res.status(201).json({
      status: "success",
      message: "Đánh giá thành công",
      data: {
        review,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Cập nhật đánh giá
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body

    // Kiểm tra xem đánh giá có tồn tại và thuộc về người dùng không
    const review = await Review.findById(req.params.reviewId)

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đánh giá",
      })
    }

    if (review.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền cập nhật đánh giá này",
      })
    }

    const success = await Review.update(req.params.reviewId, {
      rating,
      comment,
    })

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đánh giá hoặc không có thay đổi",
      })
    }

    const updatedReview = await Review.findById(req.params.reviewId)

    res.json({
      status: "success",
      message: "Cập nhật đánh giá thành công",
      data: {
        review: updatedReview,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Xóa đánh giá
exports.deleteReview = async (req, res, next) => {
  try {
    // Kiểm tra xem đánh giá có tồn tại và thuộc về người dùng không
    const review = await Review.findById(req.params.reviewId)

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đánh giá",
      })
    }

    if (review.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền xóa đánh giá này",
      })
    }

    const success = await Review.delete(req.params.reviewId)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đánh giá",
      })
    }

    res.json({
      status: "success",
      message: "Xóa đánh giá thành công",
    })
  } catch (error) {
    next(error)
  }
}

// Kiểm tra xem người dùng có thể đánh giá sản phẩm không
exports.checkCanReview = async (req, res, next) => {
  try {
    const productId = req.params.productId

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      })
    }

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const hasReviewed = await Review.checkUserReviewed(req.user.id, productId)

    // Kiểm tra xem người dùng đã mua sản phẩm và thanh toán chưa
    const hasPurchased = await Review.checkUserPurchased(req.user.id, productId)

    // Lấy đánh giá của người dùng nếu có
    let userReview = null
    if (hasReviewed) {
      userReview = await Review.getUserReview(req.user.id, productId)
    }

    res.json({
      status: "success",
      data: {
        can_review: !hasReviewed && hasPurchased,
        has_reviewed: hasReviewed,
        has_purchased: hasPurchased,
        user_review: userReview,
      },
    })
  } catch (error) {
    next(error)
  }
}
