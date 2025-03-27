const express = require("express")
const router = express.Router()
const productController = require("../controllers/product.controller")
const { authenticate, isAdmin } = require("../middleware/auth.middleware")
const upload = require("../middleware/upload.middleware")
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

// Protected routes (admin only)
router.post("/", authenticate, isAdmin, upload.single("image"), productRules, validate, productController.createProduct)
router.put(
  "/:id",
  authenticate,
  isAdmin,
  upload.single("image"),
  productRules,
  validate,
  productController.updateProduct,
)
router.delete("/:id", authenticate, isAdmin, productController.deleteProduct)

// Multiple image upload for product gallery
router.post("/:id/gallery", authenticate, isAdmin, upload.array("images", 5), productController.uploadGallery)

module.exports = router

