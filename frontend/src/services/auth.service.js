import api from "./api"

const AuthService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData)
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials)
    if (response.data.data.token) {
      localStorage.setItem("token", response.data.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.data.user))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile")
    return response.data
  },

  updateProfile: async (userData) => {
    const response = await api.put("/auth/profile", userData)
    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await api.put("/auth/change-password", passwordData)
    return response.data
  },

  // New methods for email verification
  verifyEmail: async (email, otp) => {
    const response = await api.post("/auth/verify-email", { email, otp })
    return response.data
  },

  resendOtp: async (email) => {
    const response = await api.post("/auth/resend-otp", { email })
    return response.data
  },
}

export default AuthService

