const db = require("../config/db.config")
const ProductVariant = require("./product_variant.model")

const Product = {
  findAll: async (limit = 10, offset = 0, filters = {}) => {
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `

    const queryParams = []

    if (filters.category_id) {
      query += ` AND p.category_id = ?`
      queryParams.push(filters.category_id)
    }

    if (filters.brand) {
      query += ` AND p.brand = ?`
      queryParams.push(filters.brand)
    }

    if (filters.price_min) {
      query += ` AND p.price >= ?`
      queryParams.push(filters.price_min)
    }

    if (filters.price_max) {
      query += ` AND p.price <= ?`
      queryParams.push(filters.price_max)
    }

    if (filters.featured) {
      query += ` AND p.featured = 1`
    }

    if (filters.status) {
      query += ` AND p.status = ?`
      queryParams.push(filters.status)
    }

    if (filters.search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    // Thêm lọc theo tồn kho
    if (filters.in_stock) {
      query += ` AND p.stock > 0`
    }

    // Sort options
    if (filters.sort) {
      switch (filters.sort) {
        case "price_asc":
          query += ` ORDER BY p.price ASC`
          break
        case "price_desc":
          query += ` ORDER BY p.price DESC`
          break
        case "newest":
          query += ` ORDER BY p.created_at DESC`
          break
        case "name_asc":
          query += ` ORDER BY p.name ASC`
          break
        case "name_desc":
          query += ` ORDER BY p.name DESC`
          break
        default:
          query += ` ORDER BY p.created_at DESC`
      }
    } else {
      query += ` ORDER BY p.created_at DESC`
    }

    query += ` LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    const [rows] = await db.query(query, queryParams)
    return rows
  },

  // Cập nhật phương thức findById để trả về thêm thông tin product_type và variants
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id],
    )

    if (!rows[0]) return null

    // Lấy thông tin biến thể
    const variants = await ProductVariant.findByProductId(id)

    // Thêm thông tin biến thể vào sản phẩm
    if (variants && variants.length > 0) {
      rows[0].product_variants = variants
    }

    return rows[0]
  },

  // Cập nhật phương thức findBySlug tương tự
  findBySlug: async (slug) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [slug],
    )

    if (!rows[0]) return null

    // Lấy thông tin biến thể
    const variants = await ProductVariant.findByProductId(rows[0].id)

    // Thêm thông tin biến thể vào sản phẩm
    if (variants && variants.length > 0) {
      rows[0].product_variants = variants
    }

    return rows[0]
  },

  // Thêm phương thức để lấy sản phẩm theo loại
  findByType: async (type, limit = 10, offset = 0) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.product_type = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [type, limit, offset],
    )
    return rows
  },

  // Thêm phương thức để đếm số lượng sản phẩm theo loại
  countByType: async (type) => {
    const [rows] = await db.query(`SELECT COUNT(*) as total FROM products WHERE product_type = ?`, [type])
    return rows[0].total
  },

  create: async (productData) => {
    // Bắt đầu transaction
    await db.query("START TRANSACTION")

    try {
      // Tạo sản phẩm
      const [result] = await db.query(`INSERT INTO products SET ?`, [productData])
      const productId = result.insertId

      // Xử lý biến thể nếu có
      if (productData.variants) {
        const variants =
          typeof productData.variants === "string" ? JSON.parse(productData.variants) : productData.variants

        // Xử lý biến thể cho điện thoại
        if (productData.product_type === "phone" && variants.colors && variants.storage) {
          let totalStock = 0

          for (const color of variants.colors) {
            for (const storage of variants.storage) {
              // Tìm thông tin tồn kho từ combinations nếu có
              let stock = productData.stock || 0
              const price = storage.price || productData.price

              if (variants.combinations) {
                const combination = variants.combinations.find(
                  (c) => c.color === color.value && c.storage === storage.value,
                )
                if (combination) {
                  stock = combination.stock || stock
                }
              }

              // Cộng dồn vào tổng tồn kho
              totalStock += stock

              // Tạo khóa biến thể
              const variantKey = `color:${color.value}|storage:${storage.value}`

              // Tạo tên hiển thị
              const variantName = `${color.label}, ${storage.label}`

              // Tạo hoặc cập nhật biến thể
              await ProductVariant.createOrUpdate(productId, variantKey, {
                variant_name: variantName,
                price: price,
                stock: stock,
                image: color.image || null,
                sku: `${productData.slug}-${color.value}-${storage.value}`,
              })
            }
          }

          // Cập nhật tổng tồn kho của sản phẩm
          await db.query(`UPDATE products SET stock = ? WHERE id = ?`, [totalStock, productId])
        }

        // Xử lý biến thể cho laptop
        else if (productData.product_type === "laptop" && variants.configs) {
          let totalStock = 0

          for (const config of variants.configs) {
            // Lấy tồn kho của cấu hình
            const stock = config.stock || productData.stock || 0

            // Cộng dồn vào tổng tồn kho
            totalStock += stock

            // Tạo khóa biến thể
            const variantKey = `config:${config.value}`

            // Tạo hoặc cập nhật biến thể
            await ProductVariant.createOrUpdate(productId, variantKey, {
              variant_name: config.label,
              price: config.price || productData.price,
              stock: stock,
              sku: `${productData.slug}-${config.value}`,
            })
          }

          // Cập nhật tổng tồn kho của sản phẩm
          await db.query(`UPDATE products SET stock = ? WHERE id = ?`, [totalStock, productId])
        }
      }

      // Commit transaction
      await db.query("COMMIT")

      return productId
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await db.query("ROLLBACK")
      throw error
    }
  },

  update: async (id, productData) => {
    // Bắt đầu transaction
    await db.query("START TRANSACTION")

    try {
      // Cập nhật sản phẩm
      const [result] = await db.query(`UPDATE products SET ? WHERE id = ?`, [productData, id])

      // Xử lý biến thể nếu có
      if (productData.variants) {
        const variants =
          typeof productData.variants === "string" ? JSON.parse(productData.variants) : productData.variants

        // Xử lý biến thể cho điện thoại
        if (productData.product_type === "phone" && variants.colors && variants.storage) {
          let totalStock = 0

          for (const color of variants.colors) {
            for (const storage of variants.storage) {
              // Tìm thông tin tồn kho từ combinations nếu có
              let stock = productData.stock || 0
              const price = storage.price || productData.price

              if (variants.combinations) {
                const combination = variants.combinations.find(
                  (c) => c.color === color.value && c.storage === storage.value,
                )
                if (combination) {
                  stock = combination.stock || stock
                }
              }

              // Cộng dồn vào tổng tồn kho
              totalStock += stock

              // Tạo khóa biến thể
              const variantKey = `color:${color.value}|storage:${storage.value}`

              // Tạo tên hiển thị
              const variantName = `${color.label}, ${storage.label}`

              // Tạo hoặc cập nhật biến thể
              await ProductVariant.createOrUpdate(id, variantKey, {
                variant_name: variantName,
                price: price,
                stock: stock,
                image: color.image || null,
                sku: `${productData.slug || ""}-${color.value}-${storage.value}`,
              })
            }
          }

          // Cập nhật tổng tồn kho của sản phẩm
          await db.query(`UPDATE products SET stock = ? WHERE id = ?`, [totalStock, id])
        }

        // Xử lý biến thể cho laptop
        else if (productData.product_type === "laptop" && variants.configs) {
          let totalStock = 0

          for (const config of variants.configs) {
            // Lấy tồn kho của cấu hình
            const stock = config.stock || productData.stock || 0

            // Cộng dồn vào tổng tồn kho
            totalStock += stock

            // Tạo khóa biến thể
            const variantKey = `config:${config.value}`

            // Tạo hoặc cập nhật biến thể
            await ProductVariant.createOrUpdate(id, variantKey, {
              variant_name: config.label,
              price: config.price || productData.price,
              stock: stock,
              sku: `${productData.slug || ""}-${config.value}`,
            })
          }

          // Cập nhật tổng tồn kho của sản phẩm
          await db.query(`UPDATE products SET stock = ? WHERE id = ?`, [totalStock, id])
        }
      }

      // Commit transaction
      await db.query("COMMIT")

      return result.affectedRows > 0
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await db.query("ROLLBACK")
      throw error
    }
  },

  delete: async (id) => {
    // Bắt đầu transaction
    await db.query("START TRANSACTION")

    try {
      // Xóa tất cả biến thể của sản phẩm
      await db.query(`DELETE FROM product_variants WHERE product_id = ?`, [id])

      // Xóa sản phẩm
      const [result] = await db.query(`DELETE FROM products WHERE id = ?`, [id])

      // Commit transaction
      await db.query("COMMIT")

      return result.affectedRows > 0
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await db.query("ROLLBACK")
      throw error
    }
  },

  countAll: async (filters = {}) => {
    let query = `SELECT COUNT(*) as total FROM products p WHERE 1=1`
    const queryParams = []

    if (filters.category_id) {
      query += ` AND p.category_id = ?`
      queryParams.push(filters.category_id)
    }

    if (filters.brand) {
      query += ` AND p.brand = ?`
      queryParams.push(filters.brand)
    }

    if (filters.price_min) {
      query += ` AND p.price >= ?`
      queryParams.push(filters.price_min)
    }

    if (filters.price_max) {
      query += ` AND p.price <= ?`
      queryParams.push(filters.price_max)
    }

    if (filters.featured) {
      query += ` AND p.featured = 1`
    }

    if (filters.status) {
      query += ` AND p.status = ?`
      queryParams.push(filters.status)
    }

    if (filters.search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    // Thêm lọc theo tồn kho
    if (filters.in_stock) {
      query += ` AND p.stock > 0`
    }

    const [rows] = await db.query(query, queryParams)
    return rows[0].total
  },

  search: async (keyword, limit = 10, offset = 0) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.name LIKE ? OR p.description LIKE ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${keyword}%`, `%${keyword}%`, limit, offset],
    )
    return rows
  },

  countSearch: async (keyword) => {
    const [rows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM products 
       WHERE name LIKE ? OR description LIKE ?`,
      [`%${keyword}%`, `%${keyword}%`],
    )
    return rows[0].total
  },

  getRelatedProducts: async (productId, categoryId, limit = 4) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.id != ?
       ORDER BY RAND()
       LIMIT ?`,
      [categoryId, productId, limit],
    )
    return rows
  },

  getFeaturedProducts: async (limit = 8) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.featured = 1
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit],
    )
    return rows
  },

  getNewArrivals: async (limit = 8) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit],
    )
    return rows
  },

  getBestSellers: async (limit = 8) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name, COUNT(oi.id) as order_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN order_items oi ON p.id = oi.product_id
       GROUP BY p.id
       ORDER BY order_count DESC
       LIMIT ?`,
      [limit],
    )
    return rows
  },

  getProductsByIds: async (ids) => {
    if (!ids.length) return []

    const placeholders = ids.map(() => "?").join(",")
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id IN (${placeholders})`,
      ids,
    )
    return rows
  },

  // Kiểm tra tồn kho
  checkStock: async (productId, options, quantity) => {
    // Kiểm tra xem sản phẩm có biến thể hay không
    const hasVariants = await ProductVariant.hasVariants(productId)

    // Nếu có biến thể và có options, kiểm tra tồn kho của biến thể
    if (hasVariants && options && Object.keys(options).length > 0) {
      const variantKey = ProductVariant.generateVariantKey(options)
      if (variantKey) {
        return await ProductVariant.checkStock(productId, variantKey, quantity)
      }
    }

    // Nếu không có biến thể hoặc không có options, kiểm tra tồn kho của sản phẩm chính
    const [rows] = await db.query(`SELECT stock FROM products WHERE id = ? AND stock >= ?`, [productId, quantity])
    return rows.length > 0
  },

  // Giảm tồn kho
  reduceStock: async (productId, options, quantity) => {
    // Kiểm tra xem sản phẩm có biến thể hay không
    const hasVariants = await ProductVariant.hasVariants(productId)

    // Nếu có biến thể và có options, giảm tồn kho của biến thể và tổng tồn kho
    if (hasVariants && options && Object.keys(options).length > 0) {
      const variantKey = ProductVariant.generateVariantKey(options)
      if (variantKey) {
        return await ProductVariant.reduceStock(productId, variantKey, quantity)
      }
    }

    // Nếu không có biến thể hoặc không có options, giảm tồn kho của sản phẩm chính
    const [result] = await db.query(`UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`, [
      quantity,
      productId,
      quantity,
    ])
    return result.affectedRows > 0
  },

  // Khôi phục tồn kho
  restoreStock: async (productId, options, quantity) => {
    // Kiểm tra xem sản phẩm có biến thể hay không
    const hasVariants = await ProductVariant.hasVariants(productId)

    // Nếu có biến thể và có options, khôi phục tồn kho của biến thể và tổng tồn kho
    if (hasVariants && options && Object.keys(options).length > 0) {
      const variantKey = ProductVariant.generateVariantKey(options)
      if (variantKey) {
        return await ProductVariant.restoreStock(productId, variantKey, quantity)
      }
    }

    // Nếu không có biến thể hoặc không có options, khôi phục tồn kho của sản phẩm chính
    const [result] = await db.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [quantity, productId])
    return result.affectedRows > 0
  },

  // Lấy giá của biến thể
  getVariantPrice: async (productId, options) => {
    if (!options || Object.keys(options).length === 0) {
      // Nếu không có options, trả về giá của sản phẩm chính
      const [rows] = await db.query(`SELECT price, sale_price FROM products WHERE id = ?`, [productId])
      return rows.length > 0 ? rows[0].sale_price || rows[0].price : 0
    }

    const variantKey = ProductVariant.generateVariantKey(options)
    if (!variantKey) {
      // Nếu không tạo được variantKey, trả về giá của sản phẩm chính
      const [rows] = await db.query(`SELECT price, sale_price FROM products WHERE id = ?`, [productId])
      return rows.length > 0 ? rows[0].sale_price || rows[0].price : 0
    }

    // Lấy giá của biến thể
    const [rows] = await db.query(
      `SELECT pv.price, p.price as product_price, p.sale_price as product_sale_price
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.product_id = ? AND pv.variant_key = ?`,
      [productId, variantKey],
    )

    if (rows.length === 0) {
      // Nếu không tìm thấy biến thể, trả về giá của sản phẩm chính
      const [productRows] = await db.query(`SELECT price, sale_price FROM products WHERE id = ?`, [productId])
      return productRows.length > 0 ? productRows[0].sale_price || productRows[0].price : 0
    }

    // Nếu biến thể có giá riêng, trả về giá của biến thể
    // Nếu không, trả về giá của sản phẩm chính
    return rows[0].price || rows[0].product_sale_price || rows[0].product_price
  },

  // Lấy tồn kho của biến thể
  getVariantStock: async (productId, options) => {
    if (!options || Object.keys(options).length === 0) {
      // Nếu không có options, trả về tồn kho của sản phẩm chính
      const [rows] = await db.query(`SELECT stock FROM products WHERE id = ?`, [productId])
      return rows.length > 0 ? rows[0].stock : 0
    }

    const variantKey = ProductVariant.generateVariantKey(options)
    if (!variantKey) {
      // Nếu không tạo được variantKey, trả về tồn kho của sản phẩm chính
      const [rows] = await db.query(`SELECT stock FROM products WHERE id = ?`, [productId])
      return rows.length > 0 ? rows[0].stock : 0
    }

    // Lấy tồn kho của biến thể
    const [rows] = await db.query(`SELECT stock FROM product_variants WHERE product_id = ? AND variant_key = ?`, [
      productId,
      variantKey,
    ])

    return rows.length > 0 ? rows[0].stock : 0
  },

  // Cập nhật tổng tồn kho của sản phẩm
  updateTotalStock: async (productId) => {
    // Kiểm tra xem sản phẩm có biến thể hay không
    const hasVariants = await ProductVariant.hasVariants(productId)

    if (hasVariants) {
      // Nếu có biến thể, tính tổng tồn kho từ các biến thể
      return await ProductVariant.updateTotalStock(productId)
    }

    // Nếu không có biến thể, không cần cập nhật gì
    return true
  },

  // Thêm phương thức cập nhật rating trung bình
  updateAverageRating: async (productId) => {
    const [rows] = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
       FROM reviews
       WHERE product_id = ?`,
      [productId],
    )

    if (rows[0]) {
      const avgRating = rows[0].avg_rating || 0
      const reviewCount = rows[0].review_count || 0

      await db.query(
        `UPDATE products 
         SET rating = ?, review_count = ?
         WHERE id = ?`,
        [avgRating, reviewCount, productId],
      )
    }
  },
}

module.exports = Product
