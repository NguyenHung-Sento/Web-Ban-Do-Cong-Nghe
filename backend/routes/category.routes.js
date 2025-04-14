const express = require("express")
const router = express.Router()
const categoryController = require("../controllers/category.controller")
const { authenticate, isAdmin } = require("../middleware/auth.middleware")
const { validate, categoryRules } = require("../middleware/validator.middleware")

// Public routes
router.get("/", categoryController.getAllCategories)
router.get("/:id", categoryController.getCategoryById)
router.get("/slug/:slug", categoryController.getCategoryBySlug)

// Protected routes (admin only)
router.post("/", authenticate, isAdmin, categoryRules, validate, categoryController.createCategory)
router.put("/:id", authenticate, isAdmin, categoryRules, validate, categoryController.updateCategory)
router.delete("/:id", authenticate, isAdmin, categoryController.deleteCategory)

module.exports = router

