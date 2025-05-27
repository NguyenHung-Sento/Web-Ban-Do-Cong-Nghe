const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const passport = require("./config/passport.config")

// Import routes
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const categoryRoutes = require("./routes/category.routes")
const productRoutes = require("./routes/product.routes")
const cartRoutes = require("./routes/cart.routes")
const orderRoutes = require("./routes/order.routes")
const paymentRoutes = require("./routes/payment.routes")
const reviewRoutes = require("./routes/review.routes")
const chatbotRoutes = require("./routes/chatbot.routes")
const addressRoutes = require("./routes/address.routes")
const bannerRoutes = require("./routes/banner.routes")

const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Increase payload size limit for CKEditor images
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(cookieParser())

// Initialize passport
app.use(passport.initialize())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/chatbot", chatbotRoutes)
app.use("/api/addresses", addressRoutes)
app.use("/api/banners", bannerRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    status: "error",
    message: "Đã xảy ra lỗi trên máy chủ",
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = app
