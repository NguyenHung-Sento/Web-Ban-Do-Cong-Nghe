const express = require("express")
const router = express.Router()
const chatbotController = require("../controllers/chatbot.controller")
const { verifyToken } = require("../middleware/auth.middleware")

// Public route - anyone can use the chatbot
router.post("/send", chatbotController.sendMessage)

module.exports = router
