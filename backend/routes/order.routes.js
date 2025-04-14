const express = require("express")
const router = express.Router()
const orderController = require("../controllers/order.controller")
const { authenticate, isAdmin } = require("../middleware/auth.middleware")
const { validate, orderRules } = require("../middleware/validator.middleware")

// All routes are protected
router.use(authenticate)

// Routes for both admin and regular users
router.get("/", orderController.getAllOrders)
router.get("/:id", orderController.getOrderById)
router.post("/", orderRules, validate, orderController.createOrder)
router.delete("/:id", orderController.deleteOrder) // Add this new route

// Admin-only routes
router.put("/:id/status", isAdmin, orderController.updateOrderStatus)
router.put("/:id/payment", isAdmin, orderController.updatePaymentStatus)

module.exports = router
