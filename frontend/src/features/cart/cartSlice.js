import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import CartService from "../../services/cart.service"
import { toast } from "react-toastify"

// Hàm helper để lưu giỏ hàng vào localStorage
const saveCartToLocalStorage = (cart) => {
  localStorage.setItem("guestCart", JSON.stringify(cart))
}

// Hàm helper để lấy giỏ hàng từ localStorage
const getCartFromLocalStorage = () => {
  const cart = localStorage.getItem("guestCart")
  return cart ? JSON.parse(cart) : { items: [], totalItems: 0, totalAmount: 0 }
}

// Helper function to normalize options for comparison
const normalizeOptions = (options) => {
  if (!options) return null

  // Create a copy without metadata properties
  const filteredOptions = { ...options }
  ;["variantPrice", "variantImage"].forEach((key) => {
    if (key in filteredOptions) delete filteredOptions[key]
  })

  // Sort keys for consistent comparison
  return JSON.stringify(
    Object.keys(filteredOptions)
      .sort()
      .reduce((obj, key) => {
        obj[key] = filteredOptions[key]
        return obj
      }, {}),
  )
}

// Async thunk actions
export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()

    // Nếu người dùng đã đăng nhập, lấy giỏ hàng từ server
    if (auth.isLoggedIn) {
      const response = await CartService.getCart()
      return response.data.cart
    } else {
      // Nếu chưa đăng nhập, lấy giỏ hàng từ localStorage
      return getCartFromLocalStorage()
    }
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lấy giỏ hàng"
    return rejectWithValue(message)
  }
})

// Cập nhật action addToCart để hỗ trợ các tùy chọn sản phẩm và hình ảnh biến thể
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity, options, variantImage, product }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()

      // Nếu người dùng đã đăng nhập, thêm vào giỏ hàng trên server
      if (auth.isLoggedIn) {
        // Thêm options và variantImage vào request body nếu có
        const requestData = {
          product_id: productId,
          quantity,
          ...(options && { options: JSON.stringify(options) }),
          ...(variantImage && { variant_image: variantImage }),
        }

        const response = await CartService.addItem(requestData)
        return response.data.cart
      } else {
        // Nếu chưa đăng nhập, thêm vào giỏ hàng trong localStorage
        const { cart } = getState()

        // Tạo một bản sao mới của cart để đảm bảo tính bất biến
        const currentCart = {
          ...cart,
          items: [...cart.items], // Tạo một bản sao mới của mảng items
        }

        // Tạo item mới sử dụng thông tin sản phẩm được truyền vào
        const newItem = {
          id: Date.now(), // Tạo ID tạm thời
          product_id: productId,
          name: product.name,
          price: product.price,
          sale_price: product.sale_price,
          image: variantImage || product.image,
          quantity,
          stock: product.stock,
          options,
        }

        // Normalize options for the new item
        const newItemNormalizedOptions = normalizeOptions(options)

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItemIndex = currentCart.items.findIndex((item) => {
          // Kiểm tra product_id
          if (item.product_id !== productId) return false

          // Nếu không có options, chỉ cần kiểm tra product_id
          if (!options && !item.options) return true

          // Nếu một trong hai không có options, không phải là cùng một sản phẩm
          if (!options || !item.options) return false

          // Normalize options for the existing item
          const itemNormalizedOptions = normalizeOptions(item.options)

          // Compare normalized options
          return newItemNormalizedOptions === itemNormalizedOptions
        })

        if (existingItemIndex !== -1) {
          console.log("Updating existing item")
          // Tạo một bản sao mới của item cần cập nhật
          const updatedItem = { ...currentCart.items[existingItemIndex] }
          updatedItem.quantity += quantity

          // Cập nhật item trong mảng
          currentCart.items = [
            ...currentCart.items.slice(0, existingItemIndex),
            updatedItem,
            ...currentCart.items.slice(existingItemIndex + 1),
          ]
        } else {
          console.log("Adding new item")
          // Nếu chưa có, thêm mới (sử dụng spread operator để tạo mảng mới)
          currentCart.items = [...currentCart.items, newItem]
        }

        // Tính lại tổng
        const { totalItems, totalAmount } = calculateCartTotals(currentCart.items)
        currentCart.totalItems = totalItems
        currentCart.totalAmount = totalAmount

        // Lưu vào localStorage
        saveCartToLocalStorage(currentCart)

        return currentCart
      }
    } catch (error) {
      console.error("Error adding to cart:", error)

      // Provide more specific error messages based on the error
      let errorMessage = "Không thể thêm vào giỏ hàng"

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage
        console.error("Server response:", error.response.data)
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
        console.error("No response received:", error.request)
      } else {
        errorMessage = `Lỗi: ${error.message}`
        console.error("Request error:", error.message)
      }

      toast.error(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()

      // Nếu người dùng đã đăng nhập, cập nhật giỏ hàng trên server
      if (auth.isLoggedIn) {
        const response = await CartService.updateItem(itemId, quantity)
        return response.data.cart
      } else {
        // Nếu chưa đăng nhập, cập nhật giỏ hàng trong localStorage
        const { cart } = getState()

        // Tạo một bản sao mới của cart để đảm bảo tính bất biến
        const currentCart = {
          ...cart,
          items: [...cart.items], // Tạo một bản sao mới của mảng items
        }

        // Tìm item cần cập nhật
        const itemIndex = currentCart.items.findIndex((item) => item.id === itemId)
        if (itemIndex !== -1) {
          // Tạo một bản sao mới của item cần cập nhật
          const updatedItem = { ...currentCart.items[itemIndex], quantity }

          // Cập nhật item trong mảng
          currentCart.items = [
            ...currentCart.items.slice(0, itemIndex),
            updatedItem,
            ...currentCart.items.slice(itemIndex + 1),
          ]

          // Tính lại tổng
          const { totalItems, totalAmount } = calculateCartTotals(currentCart.items)
          currentCart.totalItems = totalItems
          currentCart.totalAmount = totalAmount

          // Lưu vào localStorage
          saveCartToLocalStorage(currentCart)
        }

        return currentCart
      }
    } catch (error) {
      const message = error.response?.data?.message || "Không thể cập nhật giỏ hàng"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const removeFromCart = createAsyncThunk("cart/removeFromCart", async (itemId, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()

    // Nếu người dùng đã đăng nhập, xóa khỏi giỏ hàng trên server
    if (auth.isLoggedIn) {
      const response = await CartService.removeItem(itemId)
      toast.info("Đã xóa sản phẩm khỏi giỏ hàng")
      return response.data.cart
    } else {
      // Nếu chưa đăng nhập, xóa khỏi giỏ hàng trong localStorage
      const { cart } = getState()

      // Tạo một bản sao mới của cart để đảm bảo tính bất biến
      const currentCart = {
        ...cart,
        items: cart.items.filter((item) => item.id !== itemId), // Lọc bỏ item cần xóa
      }

      // Tính lại tổng
      const { totalItems, totalAmount } = calculateCartTotals(currentCart.items)
      currentCart.totalItems = totalItems
      currentCart.totalAmount = totalAmount

      // Lưu vào localStorage
      saveCartToLocalStorage(currentCart)

      toast.info("Đã xóa sản phẩm khỏi giỏ hàng")
      return currentCart
    }
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa khỏi giỏ hàng"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const clearCart = createAsyncThunk("cart/clearCart", async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()

    // Nếu người dùng đã đăng nhập, xóa giỏ hàng trên server
    if (auth.isLoggedIn) {
      const response = await CartService.clearCart()
      toast.info("Đã xóa toàn bộ giỏ hàng")
      return response.data.cart
    } else {
      // Nếu chưa đăng nhập, xóa giỏ hàng trong localStorage
      const emptyCart = { items: [], totalItems: 0, totalAmount: 0 }
      saveCartToLocalStorage(emptyCart)

      toast.info("Đã xóa toàn bộ giỏ hàng")
      return emptyCart
    }
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa giỏ hàng"
    toast.error(message)
    return rejectWithValue(message)
  }
})

// Hàm tính toán tổng tiền dựa trên giá biến thể
const calculateCartTotals = (items) => {
  let totalItems = 0
  let totalAmount = 0

  items.forEach((item) => {
    totalItems += item.quantity

    // Sử dụng giá biến thể nếu có
    const itemPrice =
      item.options && item.options.variantPrice ? item.options.variantPrice : item.sale_price || item.price

    totalAmount += itemPrice * item.quantity
  })

  return { totalItems, totalAmount }
}

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    selectedItems: [], // Add state for selected items
    isLoading: false,
    error: null,
  },
  reducers: {
    resetCartError: (state) => {
      state.error = null
    },
    // Add reducer to handle item selection
    toggleSelectItem: (state, action) => {
      const itemId = action.payload
      if (state.selectedItems.includes(itemId)) {
        state.selectedItems = state.selectedItems.filter((id) => id !== itemId)
      } else {
        state.selectedItems.push(itemId)
      }
    },
    // Add reducer to handle select all
    selectAllItems: (state, action) => {
      const allSelected = action.payload
      if (allSelected) {
        state.selectedItems = state.items.map((item) => item.id)
      } else {
        state.selectedItems = []
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items

        const { totalItems, totalAmount } = calculateCartTotals(action.payload.items)
        state.totalItems = totalItems
        state.totalAmount = totalAmount

        // Reset selected items when cart is fetched
        state.selectedItems = action.payload.items.map((item) => item.id)
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items

        const { totalItems, totalAmount } = calculateCartTotals(action.payload.items)
        state.totalItems = totalItems
        state.totalAmount = totalAmount

        // Select newly added item
        const newItemIds = action.payload.items
          .filter((item) => !state.items.some((existingItem) => existingItem.id === item.id))
          .map((item) => item.id)

        state.selectedItems = [...state.selectedItems, ...newItemIds]
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items

        const { totalItems, totalAmount } = calculateCartTotals(action.payload.items)
        state.totalItems = totalItems
        state.totalAmount = totalAmount
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items

        // Remove deleted item from selected items
        const removedItemIds = state.selectedItems.filter((id) => !action.payload.items.some((item) => item.id === id))
        state.selectedItems = state.selectedItems.filter((id) => !removedItemIds.includes(id))

        const { totalItems, totalAmount } = calculateCartTotals(action.payload.items)
        state.totalItems = totalItems
        state.totalAmount = totalAmount
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false
        state.items = []
        state.totalItems = 0
        state.totalAmount = 0
        state.selectedItems = []
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { resetCartError, toggleSelectItem, selectAllItems } = cartSlice.actions

export default cartSlice.reducer
