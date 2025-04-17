const db = require("../config/db.config")

async function createProductVariantsTable() {
  try {
    console.log("Bắt đầu tạo bảng product_variants...")

    // Kiểm tra xem bảng đã tồn tại chưa
    const [tables] = await db.query("SHOW TABLES LIKE 'product_variants'")
    if (tables.length > 0) {
      console.log("Bảng product_variants đã tồn tại, bỏ qua bước tạo bảng.")
      return
    }

    // Tạo bảng product_variants
    await db.query(`
      CREATE TABLE product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variant_key VARCHAR(255) NOT NULL COMMENT 'Khóa định danh biến thể, ví dụ: color:red|storage:128gb',
        variant_name VARCHAR(255) NOT NULL COMMENT 'Tên hiển thị của biến thể, ví dụ: Đỏ, 128GB',
        sku VARCHAR(100) COMMENT 'Mã SKU của biến thể',
        price DECIMAL(15, 2) COMMENT 'Giá của biến thể, NULL nếu dùng giá mặc định của sản phẩm',
        stock INT NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho của biến thể',
        image VARCHAR(255) COMMENT 'Hình ảnh của biến thể',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY (product_id, variant_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    console.log("Tạo bảng product_variants thành công!")
  } catch (error) {
    console.error("Lỗi khi tạo bảng product_variants:", error)
  } finally {
    process.exit()
  }
}

createProductVariantsTable()
