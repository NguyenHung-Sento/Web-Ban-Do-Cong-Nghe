import api from "./api"

const AuthService = {
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)
      return response.data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials)
      if (response.data.data && response.data.data.accessToken) {
        localStorage.setItem("token", response.data.data.accessToken)
        localStorage.setItem("user", JSON.stringify(response.data.data.user))
      }
      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh-token")
      if (response.data.data && response.data.data.accessToken) {
        localStorage.setItem("token", response.data.data.accessToken)
      }
      return response.data
    } catch (error) {
      console.error("Refresh token error:", error)
      throw error
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },

  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile")
      return response.data
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData)
      return response.data
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put("/auth/change-password", passwordData)
      return response.data
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  },

  // Email verification methods
  verifyEmail: async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-email", { email, otp })
      // We don't store tokens or user data here anymore
      return response.data
    } catch (error) {
      console.error("Verify email error:", error)
      throw error
    }
  },

  resendOtp: async (email) => {
    try {
      const response = await api.post("/auth/resend-otp", { email })
      return response.data
    } catch (error) {
      console.error("Resend OTP error:", error)
      throw error
    }
  },

  // Cancel registration
  cancelRegistration: async (email) => {
    try {
      const response = await api.post("/auth/cancel-registration", { email })
      return response.data
    } catch (error) {
      console.error("Cancel registration error:", error)
      throw error
    }
  },
}

export default AuthService

