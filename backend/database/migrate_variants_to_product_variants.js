const db = require("../config/db.config")
const ProductVariant = require("../models/product_variant.model")

async function migrateVariantsToProductVariants() {
  try {
    console.log("Bắt đầu chuyển dữ liệu từ variants sang product_variants...")

    // Lấy tất cả sản phẩm có variants
    const [products] = await db.query(
      `SELECT id, product_type, variants, slug FROM products WHERE variants IS NOT NULL`,
    )

    console.log(`Tìm thấy ${products.length} sản phẩm có variants`)

    // Bắt đầu transaction
    await db.query("START TRANSACTION")

    try {
      for (const product of products) {
        // Parse variants
        const variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants

        console.log(`Xử lý sản phẩm ID ${product.id}, loại: ${product.product_type}`)

        // Xử lý biến thể cho điện thoại
        if (product.product_type === "phone" && variants.colors && variants.storage) {
          for (const color of variants.colors) {
            for (const storage of variants.storage) {
              // Tìm thông tin tồn kho từ combinations nếu có
              let stock = 0
              const price = storage.price || null

              if (variants.combinations) {
                const combination = variants.combinations.find(
                  (c) => c.color === color.value && c.storage === storage.value,
                )
                if (combination) {
                  stock = combination.stock || 0
                }
              }

              // Tạo khóa biến thể
              const variantKey = `color:${color.value}|storage:${storage.value}`

              // Tạo tên hiển thị
              const variantName = `${color.label}, ${storage.label}`

              // Tạo hoặc cập nhật biến thể
              await ProductVariant.createOrUpdate(product.id, variantKey, {
                variant_name: variantName,
                price: price,
                stock: stock,
                image: color.image || null,
                sku: `${product.slug}-${color.value}-${storage.value}`,
              })

              console.log(`  - Đã tạo/cập nhật biến thể: ${variantName}, tồn kho: ${stock}`)
            }
          }
        }

        // Xử lý biến thể cho laptop
        else if (product.product_type === "laptop" && variants.configs) {
          for (const config of variants.configs) {
            // Tạo khóa biến thể
            const variantKey = `config:${config.value}`

            // Tạo hoặc cập nhật biến thể
            await ProductVariant.createOrUpdate(product.id, variantKey, {
              variant_name: config.label,
              price: config.price || null,
              stock: config.stock || 0,
              sku: `${product.slug}-${config.value}`,
            })

            console.log(`  - Đã tạo/cập nhật biến thể: ${config.label}, tồn kho: ${config.stock || 0}`)
          }
        }
      }

      // Commit transaction
      await db.query("COMMIT")

      console.log("Chuyển dữ liệu thành công!")
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Lỗi khi chuyển dữ liệu:", error)
  } finally {
    process.exit()
  }
}

migrateVariantsToProductVariants()
