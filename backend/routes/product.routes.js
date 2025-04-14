const express = require("express")
const router = express.Router()
const productController = require("../controllers/product.controller")
const { authenticate, isAdmin } = require("../middleware/auth.middleware")
const { validate, productRules } = require("../middleware/validator.middleware")

// Public routes
router.get("/", productController.getAllProducts)
router.get("/search", productController.searchProducts)
router.get("/featured", productController.getFeaturedProducts)
router.get("/new-arrivals", productController.getNewArrivals)
router.get("/best-sellers", productController.getBestSellers)
router.get("/:id", productController.getProductById)
router.get("/:id/related", productController.getRelatedProducts)
router.get("/slug/:slug", productController.getProductBySlug)

// Thêm route mới để lấy sản phẩm theo loại
router.get("/type/:type", productController.getProductsByType)

// Protected routes (admin only)
router.post("/", authenticate, isAdmin, productRules, validate, productController.createProduct)
router.put("/:id", authenticate, isAdmin, productRules, validate, productController.updateProduct)
router.delete("/:id", authenticate, isAdmin, productController.deleteProduct)

// Gallery management - now accepts URLs directly
router.post("/:id/gallery", authenticate, isAdmin, productController.uploadGallery)

module.exports = router

