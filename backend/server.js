const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Chào mừng đến với API CellPhoneS Clone" })
})

// Routes
app.use("/api/products", require("./routes/product.routes"))
app.use("/api/categories", require("./routes/category.routes"))
app.use("/api/users", require("./routes/user.routes"))
app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/orders", require("./routes/order.routes"))
app.use("/api/cart", require("./routes/cart.routes"))
app.use("/api/reviews", require("./routes/review.routes"))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)

  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: err.message || "Lỗi máy chủ nội bộ",
  })
})

// Set port and start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`)
})

