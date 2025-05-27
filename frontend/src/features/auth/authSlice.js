import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import AuthService from "../../services/auth.service"
import CartService from "../../services/cart.service"
import { fetchCart } from "../cart/cartSlice"
import { toast } from "react-toastify"

// Helper function to get guest cart from localStorage
const getGuestCartItems = () => {
  const guestCart = localStorage.getItem("guestCart")
  if (guestCart) {
    try {
      const parsedCart = JSON.parse(guestCart)
      return parsedCart.items || []
    } catch (error) {
      console.error("Error parsing guest cart:", error)
      return []
    }
  }
  return []
}

// Async thunk actions
export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await AuthService.register(userData)
    toast.success("Vui lòng kiểm tra email để xác thực tài khoản.")
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Đăng ký thất bại"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const login = createAsyncThunk("auth/login", async (userData, { dispatch, rejectWithValue }) => {
  try {
    const response = await AuthService.login(userData)

    // After successful login, check if there's a guest cart
    const guestCartItems = getGuestCartItems()

    if (guestCartItems.length > 0) {
      try {
        // Merge guest cart with user cart
        await CartService.mergeCart(guestCartItems)

        // Clear guest cart from localStorage
        localStorage.removeItem("guestCart")

        // Fetch the updated cart
        dispatch(fetchCart())

        toast.success("Giỏ hàng của bạn đã được cập nhật")
      } catch (error) {
        console.error("Error merging carts:", error)
        // Still continue with login even if cart merging fails
      }
    } else {
      // If no guest cart, just fetch the user's cart
      dispatch(fetchCart())
    }

    toast.success("Đăng nhập thành công!")
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Đăng nhập thất bại"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const socialLogin = createAsyncThunk("auth/socialLogin", async (userData, { dispatch, rejectWithValue }) => {
  try {
    // Process the social login data
    const { token, userId } = userData
    const response = await AuthService.processSocialLoginCallback(token, userId)

    // After successful login, check if there's a guest cart
    const guestCartItems = getGuestCartItems()

    if (guestCartItems.length > 0) {
      try {
        // Merge guest cart with user cart
        await CartService.mergeCart(guestCartItems)

        // Clear guest cart from localStorage
        localStorage.removeItem("guestCart")

        // Fetch the updated cart
        dispatch(fetchCart())

        toast.success("Giỏ hàng của bạn đã được cập nhật")
      } catch (error) {
        console.error("Error merging carts:", error)
        // Still continue with login even if cart merging fails
      }
    } else {
      // If no guest cart, just fetch the user's cart
      dispatch(fetchCart())
    }

    toast.success("Đăng nhập thành công!")
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Đăng nhập bằng mạng xã hội thất bại"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const logout = createAsyncThunk("auth/logout", async () => {
  await AuthService.logout()
  toast.info("Đã đăng xuất")
})

export const refreshToken = createAsyncThunk("auth/refreshToken", async (_, { rejectWithValue }) => {
  try {
    const response = await AuthService.refreshToken()
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Không thể làm mới token"
    return rejectWithValue(message)
  }
})

export const getProfile = createAsyncThunk("auth/getProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await AuthService.getProfile()
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lấy thông tin người dùng"
    return rejectWithValue(message)
  }
})

export const updateProfile = createAsyncThunk("auth/updateProfile", async (userData, { rejectWithValue }) => {
  try {
    const response = await AuthService.updateProfile(userData)
    toast.success("Cập nhật thông tin thành công!")
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Cập nhật thông tin thất bại"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const changePassword = createAsyncThunk("auth/changePassword", async (passwordData, { rejectWithValue }) => {
  try {
    const response = await AuthService.changePassword(passwordData)
    toast.success("Đổi mật khẩu thành công!")
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Đổi mật khẩu thất bại"
    toast.error(message)
    return rejectWithValue(message)
  }
})

// Get initial state from localStorage
const getInitialState = () => {
  try {
    const user = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    return {
      user: user ? JSON.parse(user) : null,
      isLoggedIn: !!(user && token),
      isLoading: false,
      error: null,
      registrationData: null,
      tokenRefreshing: false,
    }
  } catch (error) {
    console.error("Error parsing user from localStorage:", error)
    // Clear potentially corrupted data
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    return {
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
      registrationData: null,
      tokenRefreshing: false,
    }
  }
}

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    resetError: (state) => {
      state.error = null
    },
    resetRegistrationData: (state) => {
      state.registrationData = null
    },
    // Add a manual login action for direct state updates
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.isLoggedIn = true
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(user))
      if (token) {
        localStorage.setItem("token", token)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.registrationData = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.registrationData = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isLoggedIn = true
        if (action.payload && action.payload.user) {
          state.user = action.payload.user
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Social Login
      .addCase(socialLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.isLoggedIn = true
        if (action.payload && action.payload.user) {
          state.user = action.payload.user
        }
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isLoggedIn = false
        state.user = null
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.tokenRefreshing = true
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.tokenRefreshing = false
      })
      .addCase(refreshToken.rejected, (state) => {
        state.tokenRefreshing = false
        state.isLoggedIn = false
        state.user = null
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload && action.payload.data && action.payload.data.user) {
          state.user = action.payload.data.user
          // Update user in localStorage
          localStorage.setItem("user", JSON.stringify(action.payload.data.user))
        }
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        // Cập nhật thông tin user trong state
        if (action.payload && action.payload.user) {
          state.user = action.payload.user
          // Cập nhật localStorage với thông tin user mới
          localStorage.setItem("user", JSON.stringify(action.payload.user))
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { resetError, resetRegistrationData, setCredentials } = authSlice.actions

export default authSlice.reducer
