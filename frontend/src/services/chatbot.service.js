import api from "./api"

const ChatbotService = {
  sendMessage: async (message, sessionId = null) => {
    try {
      console.log(`Sending message to chatbot API: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`)

      const response = await api.post("/chatbot/send", {
        message,
        sessionId,
      })

      console.log("Received response from chatbot API")
      return response.data
    } catch (error) {
      console.error("Error in chatbot service:", error)

      // Extract the error message
      const errorMessage = error.response?.data?.message || "Không thể kết nối với trợ lý AI"

      throw {
        status: "error",
        message: errorMessage,
      }
    }
  },
}

export default ChatbotService
