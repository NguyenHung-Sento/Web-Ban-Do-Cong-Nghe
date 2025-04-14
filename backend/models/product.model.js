const db = require("../config/db.config")

const Product = {
  findAll: async (limit = 10, offset = 0, filters = {}) => {
    let query = `
      SELECT p.*, c.name as category_name, 
  (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
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
      queryParams.push(Number(filters.price_min))
    }

    if (filters.price_max) {
      query += ` AND p.price <= ?`
      queryParams.push(Number(filters.price_max))
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
    queryParams.push(Number(limit), Number(offset))

    const [rows] = await db.query(query, queryParams)
    return rows
  },

  // Thêm vào các phương thức hiện có trong model

  // Cập nhật phương thức findById để trả về thêm thông tin product_type và variants
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name,
     (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = ?`,
      [id],
    )
    return rows[0]
  },

  // Cập nhật phương thức findBySlug tương tự
  findBySlug: async (slug) => {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name,
     (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.slug = ?`,
      [slug],
    )
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
    const [result] = await db.query(`INSERT INTO products SET ?`, [productData])
    return result.insertId
  },

  update: async (id, productData) => {
    const [result] = await db.query(`UPDATE products SET ? WHERE id = ?`, [productData, id])
    return result.affectedRows > 0
  },

  delete: async (id) => {
    const [result] = await db.query(`DELETE FROM products WHERE id = ?`, [id])
    return result.affectedRows > 0
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
      queryParams.push(Number(filters.price_min))
    }

    if (filters.price_max) {
      query += ` AND p.price <= ?`
      queryParams.push(Number(filters.price_max))
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
}

module.exports = Product
