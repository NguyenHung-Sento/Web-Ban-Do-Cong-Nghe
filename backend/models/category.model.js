const db = require("../config/db.config")

const Category = {
  findAll: async () => {
    const [rows] = await db.query(`SELECT * FROM categories ORDER BY name ASC`)
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
}

module.exports = Category

