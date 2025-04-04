import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import AuthService from "../../services/auth.service"
import { toast } from "react-toastify"

// Lấy thông tin người dùng từ localStorage
const user = JSON.parse(localStorage.getItem("user"))

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

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await AuthService.login(credentials)
    toast.success("Đăng nhập thành công!")
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Đăng nhập thất bại"
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

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: user || null,
    isLoggedIn: !!user,
    isLoading: false,
    error: null,
    registrationData: null,
    tokenRefreshing: false,
  },
  reducers: {
    resetError: (state) => {
      state.error = null
    },
    resetRegistrationData: (state) => {
      state.registrationData = null
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
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
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
        state.user = action.payload.user
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
      .addCase(updateProfile.fulfilled, (state) => {
        state.isLoading = false
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

export const { resetError, resetRegistrationData } = authSlice.actions

export default authSlice.reducer

