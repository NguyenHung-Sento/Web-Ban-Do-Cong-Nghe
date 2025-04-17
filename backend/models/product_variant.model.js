const db = require("../config/db.config")

const ProductVariant = {
  findByProductId: async (productId) => {
    const [rows] = await db.query(`SELECT * FROM product_variants WHERE product_id = ? ORDER BY variant_name`, [
      productId,
    ])
    return rows
  },

  findByKey: async (productId, variantKey) => {
    const [rows] = await db.query(`SELECT * FROM product_variants WHERE product_id = ? AND variant_key = ?`, [
      productId,
      variantKey,
    ])
    return rows[0]
  },

  create: async (variantData) => {
    const [result] = await db.query(`INSERT INTO product_variants SET ?`, [variantData])
    return result.insertId
  },

  update: async (id, variantData) => {
    const [result] = await db.query(`UPDATE product_variants SET ? WHERE id = ?`, [variantData, id])
    return result.affectedRows > 0
  },

  updateStock: async (id, quantity) => {
    const [result] = await db.query(`UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?`, [
      quantity,
      id,
      quantity,
    ])
    return result.affectedRows > 0
  },

  delete: async (id) => {
    const [result] = await db.query(`DELETE FROM product_variants WHERE id = ?`, [id])
    return result.affectedRows > 0
  },

  // Tạo hoặc cập nhật biến thể
  createOrUpdate: async (productId, variantKey, variantData) => {
    const [existingVariant] = await db.query(
      `SELECT id FROM product_variants WHERE product_id = ? AND variant_key = ?`,
      [productId, variantKey],
    )

    if (existingVariant.length > 0) {
      // Cập nhật biến thể hiện có
      const [result] = await db.query(`UPDATE product_variants SET ? WHERE id = ?`, [
        variantData,
        existingVariant[0].id,
      ])
      return { id: existingVariant[0].id, updated: result.affectedRows > 0 }
    } else {
      // Tạo biến thể mới
      const [result] = await db.query(`INSERT INTO product_variants SET ?`, [
        { product_id: productId, variant_key: variantKey, ...variantData },
      ])
      return { id: result.insertId, updated: false }
    }
  },

  // Kiểm tra tồn kho của biến thể
  checkStock: async (productId, variantKey, quantity) => {
    if (!variantKey) {
      // Nếu không có biến thể, kiểm tra tồn kho của sản phẩm chính
      const [rows] = await db.query(`SELECT stock FROM products WHERE id = ? AND stock >= ?`, [productId, quantity])
      return rows.length > 0
    }

    const [rows] = await db.query(
      `SELECT stock FROM product_variants WHERE product_id = ? AND variant_key = ? AND stock >= ?`,
      [productId, variantKey, quantity],
    )
    return rows.length > 0
  },

  // Giảm tồn kho của biến thể và cập nhật tổng tồn kho của sản phẩm
  reduceStock: async (productId, variantKey, quantity) => {
    await db.query("START TRANSACTION")

    try {
      if (!variantKey) {
        // Nếu không có biến thể, giảm tồn kho của sản phẩm chính
        const [result] = await db.query(`UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`, [
          quantity,
          productId,
          quantity,
        ])

        if (result.affectedRows === 0) {
          await db.query("ROLLBACK")
          return false
        }
      } else {
        // Giảm tồn kho của biến thể
        const [result] = await db.query(
          `UPDATE product_variants SET stock = stock - ? WHERE product_id = ? AND variant_key = ? AND stock >= ?`,
          [quantity, productId, variantKey, quantity],
        )

        if (result.affectedRows === 0) {
          await db.query("ROLLBACK")
          return false
        }

        // Cập nhật tổng tồn kho của sản phẩm chính
        await db.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [quantity, productId])
      }

      await db.query("COMMIT")
      return true
    } catch (error) {
      await db.query("ROLLBACK")
      throw error
    }
  },

  // Khôi phục tồn kho của biến thể và cập nhật tổng tồn kho của sản phẩm
  restoreStock: async (productId, variantKey, quantity) => {
    await db.query("START TRANSACTION")

    try {
      if (!variantKey) {
        // Nếu không có biến thể, khôi phục tồn kho của sản phẩm chính
        await db.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [quantity, productId])
      } else {
        // Khôi phục tồn kho của biến thể
        await db.query(`UPDATE product_variants SET stock = stock + ? WHERE product_id = ? AND variant_key = ?`, [
          quantity,
          productId,
          variantKey,
        ])

        // Cập nhật tổng tồn kho của sản phẩm chính
        await db.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [quantity, productId])
      }

      await db.query("COMMIT")
      return true
    } catch (error) {
      await db.query("ROLLBACK")
      throw error
    }
  },

  // Tạo khóa biến thể từ các tùy chọn
  generateVariantKey: (options) => {
    if (!options || Object.keys(options).length === 0) return null

    // Loại bỏ các tùy chọn không liên quan đến biến thể (như variantPrice)
    const variantOptions = { ...options }
    delete variantOptions.variantPrice

    if (Object.keys(variantOptions).length === 0) return null

    // Sắp xếp các khóa để đảm bảo tính nhất quán
    const sortedKeys = Object.keys(variantOptions).sort()

    // Tạo khóa biến thể theo định dạng key1:value1|key2:value2
    return sortedKeys.map((key) => `${key}:${variantOptions[key]}`).join("|")
  },

  // Tính tổng tồn kho của tất cả biến thể của một sản phẩm
  calculateTotalStock: async (productId) => {
    const [result] = await db.query(`SELECT SUM(stock) as total_stock FROM product_variants WHERE product_id = ?`, [
      productId,
    ])
    return result[0].total_stock || 0
  },

  // Cập nhật tổng tồn kho của sản phẩm dựa trên tổng tồn kho của các biến thể
  updateTotalStock: async (productId) => {
    const totalStock = await ProductVariant.calculateTotalStock(productId)
    await db.query(`UPDATE products SET stock = ? WHERE id = ?`, [totalStock, productId])
    return totalStock
  },

  // Kiểm tra xem sản phẩm có biến thể hay không
  hasVariants: async (productId) => {
    const [result] = await db.query(`SELECT COUNT(*) as count FROM product_variants WHERE product_id = ?`, [productId])
    return result[0].count > 0
  },
}

module.exports = ProductVariant
