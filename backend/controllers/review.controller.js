const Review = require("../models/review.model")
const Product = require("../models/product.model")
const db = require("../config/db.config")

// Thêm hàm cập nhật số lượng đánh giá và điểm đánh giá trung bình của sản phẩm
const updateProductReviewStats = async (productId) => {
  try {
    // Chỉ đếm các đánh giá gốc (không phải reply) và không phải là reply của admin
    const total = await Review.countByProductId(productId)
    const averageRating = await Review.getAverageRating(productId)

    // Cập nhật cả số lượng đánh giá và điểm đánh giá trung bình
    await db.query(`UPDATE products SET review_count = ?, rating = ? WHERE id = ?`, [total, averageRating, productId])
  } catch (error) {
    console.error("Error updating product review stats:", error)
  }
}

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
    const { rating, comment, productVariantDetails } = req.body

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
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
      product_variant_details: productVariantDetails || null,
    })

    const review = await Review.findById(reviewId)

    // Cập nhật số lượng đánh giá và điểm đánh giá trung bình của sản phẩm
    await updateProductReviewStats(productId)

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

    // Cập nhật số lượng đánh giá và điểm đánh giá trung bình của sản phẩm
    await updateProductReviewStats(review.product_id)

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
    const purchaseDetails = await Review.checkUserPurchased(req.user.id, productId)
    const hasPurchased = !!purchaseDetails

    // Lấy đánh giá của người dùng nếu có
    let userReview = null
    if (hasReviewed) {
      userReview = await Review.getUserReview(req.user.id, productId)
    }

    res.json({
      status: "success",
      data: {
        can_review: hasPurchased,
        has_reviewed: hasReviewed,
        has_purchased: hasPurchased,
        user_review: userReview,
        purchase_details: purchaseDetails,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Thêm API để admin trả lời đánh giá
exports.replyToReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params
    const { comment } = req.body

    // Kiểm tra xem người dùng có phải admin không
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Chỉ admin mới có quyền trả lời đánh giá",
      })
    }

    // Kiểm tra xem đánh giá có tồn tại không
    const parentReview = await Review.findById(reviewId)
    if (!parentReview) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy đánh giá",
      })
    }

    // Kiểm tra xem đánh giá này đã có reply chưa
    const existingReply = await Review.findReplyByParentId(reviewId)
    if (existingReply) {
      // Cập nhật reply hiện có
      await Review.updateReply(existingReply.id, { comment })

      const updatedReply = await Review.findById(existingReply.id)

      return res.json({
        status: "success",
        message: "Cập nhật trả lời thành công",
        data: {
          review: updatedReply,
        },
      })
    }

    // Tạo reply mới - sử dụng rating = 5 để tránh vi phạm ràng buộc CHECK
    const replyData = {
      parent_id: reviewId,
      product_id: parentReview.product_id,
      user_id: req.user.id,
      comment,
      is_admin_reply: true,
      rating: 5, // Đặt rating = 5 để tránh vi phạm ràng buộc CHECK
    }

    const replyId = await Review.createReply(replyData)
    const reply = await Review.findById(replyId)

    res.status(201).json({
      status: "success",
      message: "Trả lời đánh giá thành công",
      data: {
        review: reply,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Thêm API để xóa trả lời đánh giá
exports.deleteReply = async (req, res, next) => {
  try {
    const { replyId } = req.params

    // Kiểm tra xem người dùng có phải admin không
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Chỉ admin mới có quyền xóa trả lời đánh giá",
      })
    }

    // Kiểm tra xem reply có tồn tại không
    const reply = await Review.findById(replyId)
    if (!reply || !reply.parent_id) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy trả lời đánh giá",
      })
    }

    const success = await Review.delete(replyId)

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy trả lời đánh giá",
      })
    }

    res.json({
      status: "success",
      message: "Xóa trả lời đánh giá thành công",
    })
  } catch (error) {
    next(error)
  }
}
