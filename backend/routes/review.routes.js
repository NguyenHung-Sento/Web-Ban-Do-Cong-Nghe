const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/review.controller")
const { authenticate } = require("../middleware/auth.middleware")
const { validate } = require("../middleware/validator.middleware")
const { body } = require("express-validator")

// Get reviews for a product (public)
router.get("/products/:productId", reviewController.getProductReviews)

// Check if user can review a product (authenticated)
router.get("/check/:productId", authenticate, reviewController.checkCanReview)

// Protected routes
router.post(
  "/products/:productId",
  authenticate,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Đánh giá phải từ 1 đến 5 sao"),
    body("comment").notEmpty().withMessage("Nội dung đánh giá là bắt buộc"),
  ],
  validate,
  reviewController.createReview,
)

router.put(
  "/:reviewId",
  authenticate,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Đánh giá phải từ 1 đến 5 sao"),
    body("comment").notEmpty().withMessage("Nội dung đánh giá là bắt buộc"),
  ],
  validate,
  reviewController.updateReview,
)

router.delete("/:reviewId", authenticate, reviewController.deleteReview)

// Admin reply routes
router.post(
  "/:reviewId/reply",
  authenticate,
  [body("comment").notEmpty().withMessage("Nội dung trả lời là bắt buộc")],
  validate,
  reviewController.replyToReview,
)

router.delete("/reply/:replyId", authenticate, reviewController.deleteReply)

module.exports = router
