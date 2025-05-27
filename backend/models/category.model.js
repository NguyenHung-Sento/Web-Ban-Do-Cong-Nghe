const db = require("../config/db.config")

const Category = {
  findAll: async (limit = 10, offset = 0, filters = {}) => {
    let query = `
      SELECT c.*, 
             COUNT(p.id) as product_count,
             c.created_at,
             c.updated_at
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE 1=1
    `

    const queryParams = []

    if (filters.search) {
      query += ` AND c.name LIKE ?`
      queryParams.push(`%${filters.search}%`)
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC`

    if (limit && offset !== undefined) {
      query += ` LIMIT ? OFFSET ?`
      queryParams.push(limit, offset)
    }

    const [rows] = await db.query(query, queryParams)
    return rows
  },

  findById: async (id) => {
    const [rows] = await db.query(`SELECT * FROM categories WHERE id = ?`, [id])
    return rows[0]
  },

  findBySlug: async (slug) => {
    const [rows] = await db.query(`SELECT * FROM categories WHERE slug = ?`, [slug])
    return rows[0]
  },

  create: async (categoryData) => {
    const [result] = await db.query(`INSERT INTO categories SET ?`, [categoryData])
    return result.insertId
  },

  update: async (id, categoryData) => {
    const [result] = await db.query(`UPDATE categories SET ? WHERE id = ?`, [categoryData, id])
    return result.affectedRows > 0
  },

  delete: async (id) => {
    const [result] = await db.query(`DELETE FROM categories WHERE id = ?`, [id])
    return result.affectedRows > 0
  },

  countAll: async (filters = {}) => {
    let query = `SELECT COUNT(*) as total FROM categories WHERE 1=1`
    const queryParams = []

    if (filters.search) {
      query += ` AND name LIKE ?`
      queryParams.push(`%${filters.search}%`)
    }

    const [rows] = await db.query(query, queryParams)
    return rows[0].total
  },

  // Lấy danh mục có sản phẩm
  getWithProducts: async () => {
    const [rows] = await db.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      HAVING product_count > 0
      ORDER BY c.name ASC
    `)
    return rows
  },
}

module.exports = Category
