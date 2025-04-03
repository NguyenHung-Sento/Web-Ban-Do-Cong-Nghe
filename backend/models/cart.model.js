const db = require("../config/db.config")

const Cart = {
  findByUserId: async (userId) => {
    // Get cart
    const [cartRows] = await db.query(`SELECT * FROM carts WHERE user_id = ?`, [userId])

    if (cartRows.length === 0) {
      return { id: null, items: [], total: 0 }
    }

    const cartId = cartRows[0].id

    // Get cart items with product details
    const [itemRows] = await db.query(
      `SELECT ci.*, p.name, p.price, p.sale_price, p.image, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId],
    )

    return {
      id: cartId,
      items: itemRows,
      total: itemRows.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }
  },

  addItem: async (userId, productId, quantity, options = null) => {
    console.log("Cart model - Adding item:", { userId, productId, quantity, options }) // Add logging

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
      query += ` AND (options IS NULL OR options = '{}' OR options = '')`
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

    // Get updated cart
    return await Cart.findByUserId(userId)
  },

  updateItem: async (userId, itemId, quantity) => {
    // Check if cart exists
    const [cartRows] = await db.query(`SELECT * FROM carts WHERE user_id = ?`, [userId])

    if (cartRows.length === 0) {
      throw new Error("Cart not found")
    }

    const cartId = cartRows[0].id

    // Check if item exists and belongs to user's cart
    const [itemRows] = await db.query(`SELECT * FROM cart_items WHERE id = ? AND cart_id = ?`, [itemId, cartId])

    if (itemRows.length === 0) {
      throw new Error("Item not found in cart")
    }

    // Update quantity
    await db.query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [quantity, itemId])

    // Return updated cart
    return await Cart.findByUserId(userId)
  },

  removeItem: async (userId, itemId) => {
    // Check if cart exists
    const [cartRows] = await db.query(`SELECT * FROM carts WHERE user_id = ?`, [userId])

    if (cartRows.length === 0) {
      throw new Error("Cart not found")
    }

    const cartId = cartRows[0].id

    // Check if item exists and belongs to user's cart
    const [itemRows] = await db.query(`SELECT * FROM cart_items WHERE id = ? AND cart_id = ?`, [itemId, cartId])

    if (itemRows.length === 0) {
      throw new Error("Item not found in cart")
    }

    // Remove item
    await db.query(`DELETE FROM cart_items WHERE id = ?`, [itemId])

    // Return updated cart
    return await Cart.findByUserId(userId)
  },

  clearCart: async (userId) => {
    // Check if cart exists
    const [cartRows] = await db.query(`SELECT * FROM carts WHERE user_id = ?`, [userId])

    if (cartRows.length === 0) {
      return { id: null, items: [], total: 0 }
    }

    const cartId = cartRows[0].id

    // Remove all items
    await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId])

    // Return empty cart
    return { id: cartId, items: [], total: 0 }
  },
}

module.exports = Cart

