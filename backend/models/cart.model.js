const db = require("../config/db.config")
const Product = require("./product.model")

const Cart = {
  findByUserId: async (userId) => {
    // Kiểm tra xem giỏ hàng đã tồn tại chưa
    const [cartRows] = await db.query(`SELECT * FROM carts WHERE user_id = ?`, [userId])

    if (cartRows.length === 0) {
      // Nếu chưa có giỏ hàng, tạo mới
      return {
        id: null,
        user_id: userId,
        items: [],
        total_items: 0,
        total_amount: 0,
      }
    }

    const cartId = cartRows[0].id

    // Lấy các sản phẩm trong giỏ hàng
    const [itemRows] = await db.query(
      `SELECT ci.*, p.name, p.slug, p.price, p.sale_price, p.stock,
        CASE 
          WHEN ci.variant_image IS NOT NULL THEN ci.variant_image
          ELSE p.image
        END as image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId],
    )

    // Tính tổng số lượng và tổng tiền
    let totalItems = 0
    let totalAmount = 0

    // Xử lý options cho mỗi item
    const processedItems = itemRows.map((item) => {
      // Parse options nếu có
      if (item.options && typeof item.options === "string") {
        try {
          item.options = JSON.parse(item.options)
        } catch (e) {
          console.error("Error parsing options:", e)
          item.options = {}
        }
      }

      totalItems += item.quantity

      // Sử dụng giá từ sản phẩm
      const itemPrice = item.sale_price || item.price
      totalAmount += itemPrice * item.quantity

      return item
    })

    return {
      id: cartId,
      user_id: userId,
      items: processedItems,
      total_items: totalItems,
      total_amount: totalAmount,
    }
  },

  findById: async (cartId) => {
    const [rows] = await db.query(`SELECT * FROM carts WHERE id = ?`, [cartId])
    return rows[0]
  },

  findItemById: async (itemId) => {
    const [rows] = await db.query(`SELECT * FROM cart_items WHERE id = ?`, [itemId])
    return rows[0]
  },

  findCartItemById: async (itemId) => {
    const [rows] = await db.query(
      `SELECT ci.*, c.user_id 
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ?`,
      [itemId],
    )
    return rows[0]
  },

  addItem: async (userId, productId, quantity, options = null, variantImage = null) => {
    // Get cart or create if not exists
    const [cartRows] = await db.query(`SELECT * FROM carts WHERE user_id = ?`, [userId])

    let cartId

    if (cartRows.length === 0) {
      // Create new cart
      const [result] = await db.query(`INSERT INTO carts (user_id) VALUES (?)`, [userId])
      cartId = result.insertId
    } else {
      cartId = cartRows[0].id
    }

    // Check if product already in cart with the same options
    let query = `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`
    const queryParams = [cartId, productId]

    if (options) {
      query += ` AND options = ?`
      queryParams.push(typeof options === "string" ? options : JSON.stringify(options))
    } else {
      query += ` AND (options IS NULL OR options = '{}' OR options = '')`
    }

    const [existingItems] = await db.query(query, queryParams)

    if (existingItems.length > 0) {
      // Update quantity
      await db.query(`UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`, [quantity, existingItems[0].id])
    } else {
      // Add new item - Kiểm tra cấu trúc bảng cart_items
      // Thêm cả variant_image nếu có
      let insertQuery, insertParams

      if (options && variantImage) {
        insertQuery = `INSERT INTO cart_items (cart_id, product_id, quantity, options, variant_image) VALUES (?, ?, ?, ?, ?)`
        insertParams = [
          cartId,
          productId,
          quantity,
          typeof options === "string" ? options : JSON.stringify(options),
          variantImage,
        ]
      } else if (options) {
        insertQuery = `INSERT INTO cart_items (cart_id, product_id, quantity, options) VALUES (?, ?, ?, ?)`
        insertParams = [cartId, productId, quantity, typeof options === "string" ? options : JSON.stringify(options)]
      } else if (variantImage) {
        insertQuery = `INSERT INTO cart_items (cart_id, product_id, quantity, variant_image) VALUES (?, ?, ?, ?)`
        insertParams = [cartId, productId, quantity, variantImage]
      } else {
        insertQuery = `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`
        insertParams = [cartId, productId, quantity]
      }

      await db.query(insertQuery, insertParams)
    }

    return await Cart.findByUserId(userId)
  },

  updateItem: async (itemId, userId, updateData) => {
    // Kiểm tra quyền truy cập
    const [cartItem] = await db.query(
      `SELECT ci.* FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [itemId, userId],
    )

    if (cartItem.length === 0) {
      return false
    }

    // Cập nhật item
    const [result] = await db.query(`UPDATE cart_items SET ? WHERE id = ?`, [updateData, itemId])
    return result.affectedRows > 0
  },

  removeItem: async (itemId, userId) => {
    // Kiểm tra quyền truy cập
    const [cartItem] = await db.query(
      `SELECT ci.* FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [itemId, userId],
    )

    if (cartItem.length === 0) {
      return false
    }

    // Xóa item
    const [result] = await db.query(`DELETE FROM cart_items WHERE id = ?`, [itemId])
    return result.affectedRows > 0
  },

  clearCart: async (userId) => {
    // Lấy cart_id
    const [cartRows] = await db.query(`SELECT id FROM carts WHERE user_id = ?`, [userId])

    if (cartRows.length > 0) {
      const cartId = cartRows[0].id

      // Xóa tất cả items
      await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId])
    }

    return {
      id: cartRows.length > 0 ? cartRows[0].id : null,
      user_id: userId,
      items: [],
      total_items: 0,
      total_amount: 0,
    }
  },
}

module.exports = Cart
