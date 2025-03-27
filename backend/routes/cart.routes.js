const express = require("express")
const router = express.Router()
const cartController = require("../controllers/cart.controller")
const { authenticate } = require("../middleware/auth.middleware")
const { validate, cartItemRules } = require("../middleware/validator.middleware")

// All routes are protected
router.use(authenticate)

router.get("/", cartController.getCart)
router.post("/items", cartItemRules, validate, cartController.addItem)
router.put("/items/:itemId", cartItemRules, validate, cartController.updateItem)
router.delete("/items/:itemId", cartController.removeItem)
router.delete("/", cartController.clearCart)

module.exports = router

