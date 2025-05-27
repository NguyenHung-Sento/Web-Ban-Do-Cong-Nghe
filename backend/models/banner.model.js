const db = require("../config/db.config");

class Banner {
  constructor(banner) {
    this.title = banner.title;
    this.subtitle = banner.subtitle;
    this.description = banner.description;
    this.image_url = banner.image_url;
    this.link_url = banner.link_url;
    this.button_text = banner.button_text;
    this.position = banner.position;
    this.is_active = banner.is_active;
  }

  // Create new banner
  static async create(newBanner) {
    try {
      const [res] = await db.query("INSERT INTO banners SET ?", newBanner);
      console.log("Created banner: ", { id: res.insertId, ...newBanner });
      return { id: res.insertId, ...newBanner };
    } catch (err) {
      console.log("Error creating banner: ", err);
      throw err;
    }
  }

  // Get all banners with pagination
  static async getAll(page = 1, limit = 10, search = "") {
    try {
      const offset = (page - 1) * limit;
      const query = `
        SELECT * FROM banners 
        WHERE title LIKE ? OR subtitle LIKE ? OR description LIKE ?
        ORDER BY position ASC, created_at DESC
        LIMIT ? OFFSET ?
      `;
      const searchTerm = `%${search}%`;

      const [res] = await db.query(query, [
        searchTerm,
        searchTerm,
        searchTerm,
        Number.parseInt(limit),
        Number.parseInt(offset),
      ]);

      const countQuery = `
        SELECT COUNT(*) as total FROM banners 
        WHERE title LIKE ? OR subtitle LIKE ? OR description LIKE ?
      `;
      const [countRes] = await db.query(countQuery, [
        searchTerm,
        searchTerm,
        searchTerm,
      ]);

      const total = countRes[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        banners: res,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number.parseInt(limit),
        },
      };
    } catch (err) {
      console.log("Error getting banners: ", err);
      throw err;
    }
  }

  // Get active banners for frontend
  static async getActive() {
    try {
      const [rows] = await db.query(
        "SELECT * FROM banners WHERE is_active = true ORDER BY position ASC, created_at DESC"
      );
      return rows;
    } catch (err) {
      console.log("Error getting active banners: ", err);
      throw err;
    }
  }

  // Get banner by ID
  static async findById(id) {
    try {
      const [rows] = await db.query("SELECT * FROM banners WHERE id = ?", [id]);
      return rows.length ? rows[0] : null;
    } catch (err) {
      console.log("Error finding banner: ", err);
      throw err;
    }
  }

  // Update banner
  static async updateById(id, banner) {
    try {
      const [res] = await db.query("UPDATE banners SET ? WHERE id = ?", [banner, id]);
      if (res.affectedRows === 0) {
        throw { kind: "not_found" };
      }
      console.log("Updated banner: ", { id, ...banner });
      return { id, ...banner };
    } catch (err) {
      console.log("Error updating banner: ", err);
      throw err;
    }
  }

  // Delete banner
  static async remove(id) {
    try {
      const [res] = await db.query("DELETE FROM banners WHERE id = ?", [id]);
      if (res.affectedRows === 0) {
        throw { kind: "not_found" };
      }
      console.log("Deleted banner with id: ", id);
      return res;
    } catch (err) {
      console.log("Error deleting banner: ", err);
      throw err;
    }
  }

  // Update banner position
  static async updatePosition(id, position) {
    try {
      const [res] = await db.query("UPDATE banners SET position = ? WHERE id = ?", [
        position,
        id,
      ]);
      if (res.affectedRows === 0) {
        throw { kind: "not_found" };
      }
      return res;
    } catch (err) {
      console.log("Error updating banner position: ", err);
      throw err;
    }
  }

  // Toggle banner status
  static async toggleStatus(id) {
    try {
      const [res] = await db.query(
        "UPDATE banners SET is_active = !is_active WHERE id = ?",
        [id]
      );
      if (res.affectedRows === 0) {
        throw { kind: "not_found" };
      }
      return res;
    } catch (err) {
      console.log("Error toggling banner status: ", err);
      throw err;
    }
  }
}

module.exports = Banner;
