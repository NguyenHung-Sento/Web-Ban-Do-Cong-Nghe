import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import CartService from "../../services/cart.service"
import { toast } from "react-toastify"

// Async thunk actions
export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const response = await CartService.getCart()
    return response.data.cart
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lấy giỏ hàng"
    return rejectWithValue(message)
  }
})

export const addToCart = createAsyncThunk("cart/addToCart", async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const response = await CartService.addItem(productId, quantity)
    toast.success("Đã thêm sản phẩm vào giỏ hàng")
    return response.data.cart
  } catch (error) {
    const message = error.response?.data?.message || "Không thể thêm vào giỏ hàng"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await CartService.updateItem(itemId, quantity)
      return response.data.cart
    } catch (error) {
      const message = error.response?.data?.message || "Không thể cập nhật giỏ hàng"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const removeFromCart = createAsyncThunk("cart/removeFromCart", async (itemId, { rejectWithValue }) => {
  try {
    const response = await CartService.removeItem(itemId)
    toast.info("Đã xóa sản phẩm khỏi giỏ hàng")
    return response.data.cart
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa khỏi giỏ hàng"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const clearCart = createAsyncThunk("cart/clearCart", async (_, { rejectWithValue }) => {
  try {
    const response = await CartService.clearCart()
    toast.info("Đã xóa toàn bộ giỏ hàng")
    return response.data.cart
  } catch (error) {
    const message = error.response?.data?.message || "Không thể xóa giỏ hàng"
    toast.error(message)
    return rejectWithValue(message)
  }
})

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    resetCartError: (state) => {
      state.error = null
    },
    calculateTotals: (state) => {
      let totalItems = 0
      let totalAmount = 0

      state.items.forEach((item) => {
        totalItems += item.quantity
        totalAmount += (item.sale_price || item.price) * item.quantity
      })

      state.totalItems = totalItems
      state.totalAmount = totalAmount
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
        state.totalItems = action.payload.items.reduce((total, item) => total + item.quantity, 0)
        state.totalAmount = action.payload.items.reduce(
          (total, item) => total + (item.sale_price || item.price) * item.quantity,
          0,
        )
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
        state.totalItems = action.payload.items.reduce((total, item) => total + item.quantity, 0)
        state.totalAmount = action.payload.items.reduce(
          (total, item) => total + (item.sale_price || item.price) * item.quantity,
          0,
        )
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
        state.totalItems = action.payload.items.reduce((total, item) => total + item.quantity, 0)
        state.totalAmount = action.payload.items.reduce(
          (total, item) => total + (item.sale_price || item.price) * item.quantity,
          0,
        )
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
        state.totalItems = action.payload.items.reduce((total, item) => total + item.quantity, 0)
        state.totalAmount = action.payload.items.reduce(
          (total, item) => total + (item.sale_price || item.price) * item.quantity,
          0,
        )
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
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { resetCartError, calculateTotals } = cartSlice.actions

export default cartSlice.reducer

