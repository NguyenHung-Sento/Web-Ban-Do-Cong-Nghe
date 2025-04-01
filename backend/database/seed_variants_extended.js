const db = require("../config/db.config")

async function seedExtendedVariants() {
  try {
    console.log("Bắt đầu cập nhật dữ liệu mẫu nâng cao cho các tùy chọn sản phẩm...")

    // Thêm variants nâng cao cho iPhone 13 Pro
    const iPhoneVariants = {
      colors: [
        {
          label: "Xanh Sierra",
          value: "sierra-blue",
          code: "#a0c4e2",
          image: "https://res.cloudinary.com/demo/image/upload/v1631234567/cellphones_clone/iphone-13-pro-blue.jpg",
        },
        {
          label: "Bạc",
          value: "silver",
          code: "#f1f2ed",
          image: "https://res.cloudinary.com/demo/image/upload/v1631234567/cellphones_clone/iphone-13-pro-silver.jpg",
        },
        {
          label: "Vàng",
          value: "gold",
          code: "#fae7cf",
          image: "https://res.cloudinary.com/demo/image/upload/v1631234567/cellphones_clone/iphone-13-pro-gold.jpg",
        },
        {
          label: "Xám",
          value: "graphite",
          code: "#5f5e5a",
          image: "https://res.cloudinary.com/demo/image/upload/v1631234567/cellphones_clone/iphone-13-pro-graphite.jpg",
        },
      ],
      storage: [
        { label: "128GB", value: "128gb", price: 30990000 },
        { label: "256GB", value: "256gb", price: 32990000 },
        { label: "512GB", value: "512gb", price: 38990000 },
        { label: "1TB", value: "1tb", price: 43990000 },
      ],
      combinations: [
        { color: "sierra-blue", storage: "128gb", stock: 15 },
        { color: "sierra-blue", storage: "256gb", stock: 10 },
        { color: "sierra-blue", storage: "512gb", stock: 5 },
        { color: "sierra-blue", storage: "1tb", stock: 3 },
        { color: "silver", storage: "128gb", stock: 12 },
        { color: "silver", storage: "256gb", stock: 8 },
        { color: "silver", storage: "512gb", stock: 4 },
        { color: "silver", storage: "1tb", stock: 2 },
        { color: "gold", storage: "128gb", stock: 10 },
        { color: "gold", storage: "256gb", stock: 7 },
        { color: "gold", storage: "512gb", stock: 3 },
        { color: "gold", storage: "1tb", stock: 1 },
        { color: "graphite", storage: "128gb", stock: 20 },
        { color: "graphite", storage: "256gb", stock: 15 },
        { color: "graphite", storage: "512gb", stock: 8 },
        { color: "graphite", storage: "1tb", stock: 5 },
      ],
    }

    await db.query(`UPDATE products SET variants = ? WHERE id = 1`, [JSON.stringify(iPhoneVariants)])

    // Thêm variants nâng cao cho Samsung Galaxy S21
    const samsungVariants = {
      colors: [
        {
          label: "Tím Phantom",
          value: "phantom-violet",
          code: "#c5b4e3",
          image: "https://res.cloudinary.com/demo/image/upload/v1631234567/cellphones_clone/samsung-s21-violet.jpg",
        },
        {
          label: "Xám Phantom",
          value: "phantom-gray",
          code: "#adb0b6",
          image: "https://res.cloudinary.com/demo/image/upload/v1631234567/cellphones_clone/samsung-s21-gray.jpg",
        },
        {
          label: "Trắng Phantom",
          value: "phantom-white",
          code: "#f8f9fa",
          image: "https://res.cloudinary.com/demo/image/upload/v1631234567/cellphones_clone/samsung-s21-white.jpg",
        },
        {
          label: "Hồng Phantom",
          value: "phantom-pink",
          code: "#ffc0cb",
          image: "https://res.cloudinary.com/demo/image/upload/v1631234567/cellphones_clone/samsung-s21-pink.jpg",
        },
      ],
      storage: [
        { label: "128GB", value: "128gb", price: 18990000 },
        { label: "256GB", value: "256gb", price: 20990000 },
      ],
      combinations: [
        { color: "phantom-violet", storage: "128gb", stock: 12 },
        { color: "phantom-violet", storage: "256gb", stock: 8 },
        { color: "phantom-gray", storage: "128gb", stock: 15 },
        { color: "phantom-gray", storage: "256gb", stock: 10 },
        { color: "phantom-white", storage: "128gb", stock: 10 },
        { color: "phantom-white", storage: "256gb", stock: 5 },
        { color: "phantom-pink", storage: "128gb", stock: 8 },
        { color: "phantom-pink", storage: "256gb", stock: 4 },
      ],
    }

    await db.query(`UPDATE products SET variants = ? WHERE id = 2`, [JSON.stringify(samsungVariants)])

    // Thêm variants nâng cao cho MacBook Air
    const macbookVariants = {
      configs: [
        {
          label: "Apple M1 / 8GB / 256GB",
          value: "m1-8gb-256gb",
          description: "CPU 8 nhân, GPU 7 nhân, Neural Engine 16 nhân",
          price: 28990000,
          stock: 10,
        },
        {
          label: "Apple M1 / 8GB / 512GB",
          value: "m1-8gb-512gb",
          description: "CPU 8 nhân, GPU 8 nhân, Neural Engine 16 nhân",
          price: 30990000,
          stock: 8,
        },
        {
          label: "Apple M1 / 16GB / 512GB",
          value: "m1-16gb-512gb",
          description: "CPU 8 nhân, GPU 8 nhân, Neural Engine 16 nhân, RAM 16GB",
          price: 34990000,
          stock: 5,
        },
      ],
    }

    await db.query(`UPDATE products SET variants = ? WHERE id = 4`, [JSON.stringify(macbookVariants)])

    console.log("Cập nhật dữ liệu mẫu nâng cao cho các tùy chọn sản phẩm thành công!")
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu mẫu:", error)
  } finally {
    process.exit()
  }
}

seedExtendedVariants()

