const db = require("../config/db.config")

async function createReviewsTable() {
  try {
    console.log("Checking if reviews table exists...")

    // Kiểm tra xem bảng reviews đã tồn tại chưa
    const [tables] = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'reviews'
    `)

    if (tables.length > 0) {
      console.log("Reviews table already exists.")
      return
    }

    console.log("Creating reviews table...")

    // Tạo bảng reviews
    await db.query(`
      CREATE TABLE reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY user_product (user_id, product_id)
      )
    `)

    console.log("Reviews table created successfully.")

    // Thêm cột rating và review_count vào bảng products nếu chưa có
    console.log("Checking if rating and review_count columns exist in products table...")

    const [productColumns] = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE() 
      AND table_name = 'products' 
      AND column_name IN ('rating', 'review_count')
    `)

    const hasRating = productColumns.some((col) => col.column_name === "rating")
    const hasReviewCount = productColumns.some((col) => col.column_name === "review_count")

    if (!hasRating) {
      console.log("Adding rating column to products table...")
      await db.query(`ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0`)
    }

    if (!hasReviewCount) {
      console.log("Adding review_count column to products table...")
      await db.query(`ALTER TABLE products ADD COLUMN review_count INT DEFAULT 0`)
    }

    console.log("Database setup for reviews completed successfully.")
  } catch (error) {
    console.error("Error creating reviews table:", error)
  } finally {
    process.exit()
  }
}

createReviewsTable()
