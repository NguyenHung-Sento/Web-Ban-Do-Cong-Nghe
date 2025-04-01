const db = require("../config/db.config")

async function seed() {
  try {
    console.log("Bắt đầu quá trình tạo dữ liệu mẫu...")
    

    // Tạo người dùng admin
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("admin123", salt)

    console.log("Tạo người dùng admin...")
    await db.query(
      `
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin User', 'admin@gmail.com', ?, 'admin')
    `,
      [hashedPassword],
    )

    // Tạo danh mục
    console.log("Tạo danh mục...")
    await db.query(`
      INSERT INTO categories (name, slug, image) VALUES
      ('Điện thoại', 'dien-thoai', 'category-smartphones.jpg'),
      ('Máy tính bảng', 'may-tinh-bang', 'category-tablets.jpg'),
      ('Laptop', 'laptop', 'category-laptops.jpg'),
      ('Phụ kiện', 'phu-kien', 'category-accessories.jpg'),
      ('Đồng hồ thông minh', 'dong-ho-thong-minh', 'category-smartwatches.jpg')
    `)

    // Tạo sản phẩm
    console.log("Tạo sản phẩm...")
    await db.query(`
      INSERT INTO products (name, slug, description, price, sale_price, stock, category_id, brand, image, specifications, featured, status) VALUES
      ('iPhone 13 Pro', 'iphone-13-pro', 'iPhone mới nhất với hệ thống camera chuyên nghiệp', 29990000, 28990000, 50, 1, 'Apple', 'iphone-13-pro.jpg', '{"display":"6.1-inch","processor":"A15 Bionic","camera":"12MP"}', 1, 'active'),
      ('Samsung Galaxy S21', 'samsung-galaxy-s21', 'Điện thoại flagship của Samsung', 19990000, 18990000, 30, 1, 'Samsung', 'samsung-s21.jpg', '{"display":"6.2-inch","processor":"Exynos 2100","camera":"64MP"}', 1, 'active'),
      ('iPad Pro', 'ipad-pro', 'Máy tính bảng mạnh mẽ cho người dùng chuyên nghiệp', 22990000, NULL, 20, 2, 'Apple', 'ipad-pro.jpg', '{"display":"11-inch","processor":"M1","storage":"128GB"}', 0, 'active'),
      ('MacBook Air', 'macbook-air', 'Laptop mỏng nhẹ', 28990000, 26990000, 15, 3, 'Apple', 'macbook-air.jpg', '{"display":"13.3-inch","processor":"M1","storage":"256GB"}', 1, 'active'),
      ('AirPods Pro', 'airpods-pro', 'Tai nghe không dây với khả năng chống ồn', 5990000, 4990000, 100, 4, 'Apple', 'airpods-pro.jpg', '{"type":"In-ear","battery":"4.5 hours","features":"ANC"}', 0, 'active'),
      ('Apple Watch Series 7', 'apple-watch-series-7', 'Apple Watch mới nhất với màn hình lớn hơn', 10990000, 9990000, 25, 5, 'Apple', 'apple-watch-7.jpg', '{"display":"41mm/45mm","battery":"18 hours","features":"ECG, Blood Oxygen"}', 1, 'active'),
      ('Samsung Galaxy Watch 4', 'samsung-galaxy-watch-4', 'Đồng hồ thông minh với tính năng theo dõi sức khỏe nâng cao', 6990000, 5990000, 20, 5, 'Samsung', 'galaxy-watch-4.jpg', '{"display":"40mm/44mm","battery":"40 hours","features":"Body Composition"}', 0, 'active'),
      ('Google Pixel 6', 'google-pixel-6', 'Điện thoại Google với camera tuyệt vời', 15990000, 14990000, 15, 1, 'Google', 'pixel-6.jpg', '{"display":"6.4-inch","processor":"Google Tensor","camera":"50MP"}', 1, 'active'),
      ('Samsung Galaxy Tab S7', 'samsung-galaxy-tab-s7', 'Máy tính bảng Android cao cấp', 16990000, 15990000, 10, 2, 'Samsung', 'galaxy-tab-s7.jpg', '{"display":"11-inch","processor":"Snapdragon 865+","storage":"128GB"}', 0, 'active'),
      ('Dell XPS 13', 'dell-xps-13', 'Laptop cao cấp với màn hình InfinityEdge', 32990000, 30990000, 8, 3, 'Dell', 'dell-xps-13.jpg', '{"display":"13.4-inch","processor":"Intel i7","storage":"512GB"}', 0, 'active')
    `)

    console.log("Tạo dữ liệu mẫu thành công!")
  } catch (error) {
    console.error("Lỗi khi tạo dữ liệu mẫu:", error)
  } finally {
    process.exit()
  }
}

seed()

