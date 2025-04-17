const db = require("../config/db.config")

async function addVariantImageColumn() {
  try {
    console.log("Kiểm tra xem cột variant_image đã tồn tại trong bảng cart_items chưa...")

    // Kiểm tra xem cột đã tồn tại chưa
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'cart_items' 
      AND COLUMN_NAME = 'variant_image'
    `)

    if (columns.length === 0) {
      console.log("Cột variant_image chưa tồn tại. Đang thêm cột...")

      // Thêm cột variant_image vào bảng cart_items
      await db.query(`
        ALTER TABLE cart_items
        ADD COLUMN variant_image VARCHAR(255) NULL
      `)

      console.log("Đã thêm cột variant_image vào bảng cart_items thành công!")
    } else {
      console.log("Cột variant_image đã tồn tại trong bảng cart_items.")
    }

    process.exit(0)
  } catch (error) {
    console.error("Lỗi khi thêm cột variant_image:", error)
    process.exit(1)
  }
}

addVariantImageColumn()
