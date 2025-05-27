import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
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
      config.headers["Authorization"] = `Bearer ${token}`
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
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/refresh-token`,
          {},
          { withCredentials: true },
        )

        // If refresh successful, update token and retry
        if (response.data.status === "success" && response.data.data && response.data.data.accessToken) {
          const newToken = response.data.data.accessToken
          localStorage.setItem("token", newToken)

          // Update the Authorization header
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`

          // Retry the original request
          return axios(originalRequest)
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError)

        // Clear auth data on refresh failure
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        // Redirect to login if in browser environment
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  },
)

export default api
