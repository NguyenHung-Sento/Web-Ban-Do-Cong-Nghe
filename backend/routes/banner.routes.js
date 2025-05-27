const express = require("express")
const router = express.Router()
const bannerController = require("../controllers/banner.controller")
const { authenticate, isAdmin } = require("../middleware/auth.middleware")
const { validate, bannerRules } = require("../middleware/validator.middleware")

// Public routes
router.get("/active", bannerController.getActiveBanners)

// Admin routes (require authentication)
router.get("/", authenticate, isAdmin, bannerController.getAllBanners)
router.get("/:id", authenticate, isAdmin, bannerController.getBannerById)
router.post("/", authenticate, isAdmin, bannerRules, validate, bannerController.createBanner)
router.put("/:id", authenticate, isAdmin, bannerRules, validate, bannerController.updateBanner)
router.delete("/:id", authenticate, isAdmin, bannerController.deleteBanner)
router.patch("/:id/toggle", authenticate, isAdmin, bannerController.toggleBannerStatus)
router.patch("/:id/position", authenticate, isAdmin, bannerController.updateBannerPosition)

module.exports = router
