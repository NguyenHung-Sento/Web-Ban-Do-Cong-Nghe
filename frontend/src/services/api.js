import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token")

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If error is 401 (Unauthorized) and not already retrying
    if (error.response?.status === 401 && error.response?.data?.tokenExpired && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Call refresh token endpoint
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true })

        // If refresh successful, update token
        if (response.data.status === "success") {
          localStorage.setItem("token", response.data.data.accessToken)

          // Update Authorization header
          originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`

          // Retry original request
          return api(originalRequest)
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        // Redirect to login page
        window.location.href = "/login"

        return Promise.reject(refreshError)
      }
    }

    // Don't show the default "Không có token xác thực" message for 401 errors
    // Let the individual services handle these errors
    if (error.response?.status === 401 && error.response?.data?.message === "Không có token xác thực") {
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api

