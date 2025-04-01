const db = require("../config/db.config")

const Cart = {
  findByUserId: async (userId) => {
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

    // Get cart items
    const [itemRows] = await db.query(
      `SELECT ci.*, p.name, p.price, p.sale_price, p.image, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId],
    )

    return {
      id: cartId,
      user_id: userId,
      items: itemRows,
    }
  },

  addItem: async (userId, productId, quantity, options = null) => {
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
      queryParams.push(JSON.stringify(options))
    } else {
      query += ` AND (options IS NULL OR options = '{}')`
    }

    const [existingItems] = await db.query(query, queryParams)

    if (existingItems.length > 0) {
      // Update quantity
      await db.query(`UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`, [quantity, existingItems[0].id])
    } else {
      // Add new item
      const insertQuery = options
        ? `INSERT INTO cart_items (cart_id, product_id, quantity, options) VALUES (?, ?, ?, ?)`
        : `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`

      const insertParams = options
        ? [cartId, productId, quantity, JSON.stringify(options)]
        : [cartId, productId, quantity]

      await db.query(insertQuery, insertParams)
    }

    return await Cart.findByUserId(userId)
  },
  
  updateItem: async (userId, itemId, quantity) => {
    // Get cart
    const [cartRows] = await db.query(`SELECT * FROM carts WHERE user_id = ?`, [userId])

    if (cartRows.length === 0) {
      throw new Error("Cart not found")
    }

    const cartId = cartRows[0].id

    // Update item quantity
    await db.query(`UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?`, [quantity, itemId, cartId])

    return await Cart.findByUserId(userId)
  },

  removeItem: async (userId, itemId) => {
    // Get cart
    const [cartRows] = await db.query(`SELECT * FROM carts WHERE user_id = ?`, [userId])

    if (cartRows.length === 0) {
      throw new Error("Cart not found")
    }

    const cartId = cartRows[0].id

    // Remove item
    await db.query(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`, [itemId, cartId])

    return await Cart.findByUserId(userId)
  },

  clearCart: async (userId) => {
    // Get cart
    const [cartRows] = await db.query(`SELECT * FROM carts WHERE user_id = ?`, [userId])

    if (cartRows.length === 0) {
      return
    }

    const cartId = cartRows[0].id

    // Remove all items
    await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId])

    return {
      id: cartId,
      user_id: userId,
      items: [],
    }
  },
}

module.exports = Cart

