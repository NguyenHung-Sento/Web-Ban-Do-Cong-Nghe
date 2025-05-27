"use client"

import { useState, useEffect, useRef } from "react"
import ChatbotService from "../../services/chatbot.service"
import ChatMessage from "./ChatMessage"
import SuggestedQuestions from "./SuggestedQuestions"

// Default suggested questions
const DEFAULT_SUGGESTED_QUESTIONS = [
  "Sản phẩm iPhone mới nhất?",
  "Chính sách bảo hành như thế nào?",
  "Cách thức thanh toán?",
  "Thời gian giao hàng?",
  "Làm thế nào để đổi trả sản phẩm?",
]

const ChatbotWindow = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState(DEFAULT_SUGGESTED_QUESTIONS)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem("chatMessages")
      const savedSessionId = localStorage.getItem("chatSessionId")

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages)

        // Only show suggestions if this is a new conversation or the last message is from the bot
        const lastMessage = parsedMessages[parsedMessages.length - 1]
        setShowSuggestions(!lastMessage || lastMessage.sender === "bot")
      } else {
        // Add welcome message if no history
        setMessages([
          {
            text: "Xin chào! Tôi là trợ lý AI của DigitalW. Tôi có thể giúp bạn tìm hiểu về sản phẩm, đơn hàng, chính sách của cửa hàng hoặc bất kỳ thắc mắc nào khác. Bạn cần hỗ trợ gì hôm nay?",
            sender: "bot",
            timestamp: new Date().toISOString(),
          },
        ])
        setShowSuggestions(true)
      }

      if (savedSessionId) {
        setSessionId(savedSessionId)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      // Reset if there's an error
      setMessages([
        {
          text: "Xin chào! Tôi là trợ lý AI của DigitalW. Tôi có thể giúp bạn tìm hiểu về sản phẩm, đơn hàng, chính sách của cửa hàng hoặc bất kỳ thắc mắc nào khác. Bạn cần hỗ trợ gì hôm nay?",
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ])
      setShowSuggestions(true)
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages))
    }

    if (sessionId) {
      localStorage.setItem("chatSessionId", sessionId)
    }
  }, [messages, sessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return

    // Add user message to chat
    const userMessage = {
      text: messageText,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setNewMessage("")
    setIsLoading(true)
    setError(null)
    setShowSuggestions(false)

    try {
      console.log(`Sending message: "${messageText}" with sessionId: ${sessionId}`)
      const response = await ChatbotService.sendMessage(messageText, sessionId)

      if (response.status === "success") {
        // Save session ID if it's new
        if (!sessionId && response.data.sessionId) {
          setSessionId(response.data.sessionId)
        }

        // Add bot response to chat
        const botMessage = {
          text: response.data.message,
          sender: "bot",
          timestamp: new Date().toISOString(),
          // Add products if available
          products: response.data.products || [],
        }

        setMessages((prevMessages) => [...prevMessages, botMessage])

        // Show suggestions again after bot response
        setShowSuggestions(true)

        // Update suggested questions based on context if available
        if (response.data.suggestedQuestions && response.data.suggestedQuestions.length > 0) {
          setSuggestedQuestions(response.data.suggestedQuestions)
        } else {
          setSuggestedQuestions(DEFAULT_SUGGESTED_QUESTIONS)
        }
      } else {
        throw new Error(response.message || "Đã xảy ra lỗi")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error.message || "Không thể kết nối với trợ lý AI")

      // Add error message to chat
      const errorMessage = {
        text: error.message || "Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.",
        sender: "bot",
        isError: true,
        timestamp: new Date().toISOString(),
      }

      setMessages((prevMessages) => [...prevMessages, errorMessage])
      setShowSuggestions(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSendMessage(newMessage)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(newMessage)
    }
  }

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question)
  }

  const resetChat = () => {
    localStorage.removeItem("chatMessages")
    localStorage.removeItem("chatSessionId")
    setSessionId(null)
    setMessages([
      {
        text: "Xin chào! Tôi là trợ lý AI của DigitalW. Tôi có thể giúp bạn tìm hiểu về sản phẩm, đơn hàng, chính sách của cửa hàng hoặc bất kỳ thắc mắc nào khác. Bạn cần hỗ trợ gì hôm nay?",
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ])
    setError(null)
    setShowSuggestions(true)
    setSuggestedQuestions(DEFAULT_SUGGESTED_QUESTIONS)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-20 right-4 md:right-8 w-[90%] md:w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-red-600 text-white rounded-t-lg">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <h3 className="font-semibold">Trợ lý DigitalW</h3>
        </div>
        <div className="flex">
          <button
            onClick={resetChat}
            className="text-white hover:text-gray-200 mr-2"
            title="Bắt đầu lại cuộc trò chuyện"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {/* Show suggested questions after bot messages */}
        {showSuggestions && messages.length > 0 && messages[messages.length - 1].sender === "bot" && !isLoading && (
          <SuggestedQuestions questions={suggestedQuestions} onSelectQuestion={handleSuggestedQuestion} />
        )}

        {isLoading && (
          <div className="flex items-center mt-2">
            <div className="flex space-x-1 ml-2">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows="2"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`bg-red-600 text-white p-2 rounded-r-lg h-full ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
            }`}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatbotWindow
