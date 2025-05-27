const { GoogleGenerativeAI } = require("@google/generative-ai")
const db = require("../config/db.config")
const dotenv = require("dotenv")

dotenv.config()

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables")
}

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Store chat history in memory (for production, consider using a database)
const chatSessions = new Map()

// Helper function to get product information
const getProductInfo = async () => {
  try {
    const [products] = await db.query(`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.description, 
        p.slug,
        c.name as category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LIMIT 20
    `)
    return products
  } catch (error) {
    console.error("Error fetching product info:", error)
    return []
  }
}

// Helper function to get FAQ information
const getFAQInfo = () => {
  return [
    {
      question: "Làm thế nào để đặt hàng?",
      answer:
        "Bạn có thể thêm sản phẩm vào giỏ hàng, sau đó tiến hành thanh toán. Hoặc bạn có thể sử dụng nút 'Mua ngay' để mua nhanh sản phẩm.",
    },
    {
      question: "Các phương thức thanh toán nào được chấp nhận?",
      answer:
        "Chúng tôi chấp nhận thanh toán COD (tiền mặt khi nhận hàng), chuyển khoản ngân hàng, Momo, VNPay và thẻ tín dụng.",
    },
    {
      question: "Thời gian giao hàng là bao lâu?",
      answer: "Thời gian giao hàng thông thường là 2-5 ngày làm việc tùy thuộc vào khu vực của bạn.",
    },
    {
      question: "Làm thế nào để theo dõi đơn hàng?",
      answer:
        "Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản và kiểm tra trong mục 'Đơn hàng của tôi'.",
    },
    {
      question: "Chính sách đổi trả như thế nào?",
      answer:
        "Chúng tôi chấp nhận đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên vẹn và có đầy đủ bao bì, phụ kiện.",
    },
  ]
}

// Generate system prompt with product and FAQ information
const generateSystemPrompt = async () => {
  try {
    const products = await getProductInfo()
    const faqs = getFAQInfo()

    let productInfo = ""
    if (products && products.length > 0) {
      productInfo = "Thông tin về một số sản phẩm của chúng tôi:\n"
      products.forEach((product) => {
        const description = product.description ? product.description.substring(0, 100) + "..." : "Không có mô tả"
        productInfo += `- ${product.name}: Giá ${product.price?.toLocaleString("vi-VN") || 0}đ, Danh mục: ${
          product.category || "Chưa phân loại"
        }, Mô tả: ${description}\n`
      })
    }

    let faqInfo = ""
    if (faqs && faqs.length > 0) {
      faqInfo = "Các câu hỏi thường gặp:\n"
      faqs.forEach((faq) => {
        faqInfo += `Q: ${faq.question}\nA: ${faq.answer}\n\n`
      })
    }

    return `Bạn là trợ lý AI của DigitalW, một cửa hàng bán điện thoại và thiết bị điện tử. 
Nhiệm vụ của bạn là hỗ trợ khách hàng với các câu hỏi về sản phẩm, đơn hàng, và chính sách của cửa hàng.
Hãy trả lời ngắn gọn, lịch sự và hữu ích. Nếu bạn không biết câu trả lời, hãy đề nghị khách hàng liên hệ với bộ phận chăm sóc khách hàng.
Luôn sử dụng tiếng Việt trong câu trả lời của bạn.

${productInfo}

${faqInfo}

Thông tin về cửa hàng:
- Tên: DigitalW
- Website: digitalw.com.vn
- Hotline: 1800.2097
- Email: cskh@digitalw.com.vn
- Giờ làm việc: 8h00 - 21h30 hàng ngày
`
  } catch (error) {
    console.error("Error generating system prompt:", error)
    return "Bạn là trợ lý AI của DigitalW, một cửa hàng bán điện thoại và thiết bị điện tử."
  }
}

// Simple text-only implementation without chat history
async function simpleTextGeneration(prompt) {
  try {
    console.log("Using simple text generation")
    // Use gemini-1.0-pro model instead of gemini-pro
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const systemPrompt = await generateSystemPrompt()
    const fullPrompt = `${systemPrompt}\n\nNgười dùng: ${prompt}\n\nTrợ lý:`

    const result = await model.generateContent(fullPrompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error("Error in simple text generation:", error)
    throw new Error(`Failed to generate text: ${error.message}`)
  }
}

// Get or create a chat session
const getChatSession = async (sessionId) => {
  try {
    if (!chatSessions.has(sessionId)) {
      console.log(`Creating new chat session: ${sessionId}`)

      // Initialize the model - use gemini-1.0-pro instead of gemini-pro
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

      // Generate the system prompt
      const systemPrompt = await generateSystemPrompt()
      console.log("System prompt generated successfully")

      // Start a chat session
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Tôi đã hiểu rõ vai trò của mình. Tôi sẽ hỗ trợ khách hàng với tư cách là trợ lý AI của DigitalW.",
              },
            ],
          },
          {
            role: "user",
            parts: [{ text: "Xin chào, bạn có thể giúp gì cho tôi?" }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Xin chào! Tôi là trợ lý AI của DigitalW. Tôi có thể giúp bạn tìm hiểu về sản phẩm, đơn hàng, chính sách của cửa hàng hoặc bất kỳ thắc mắc nào khác. Bạn cần hỗ trợ gì hôm nay?",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
      })

      chatSessions.set(sessionId, {
        chat,
        systemPrompt,
        lastActivity: Date.now(),
      })

      console.log(`Chat session ${sessionId} created successfully`)
    }

    // Update last activity time
    chatSessions.get(sessionId).lastActivity = Date.now()

    return chatSessions.get(sessionId)
  } catch (error) {
    console.error("Error in getChatSession:", error)
    throw new Error(`Failed to initialize chat session: ${error.message}`)
  }
}

// Clean up old chat sessions (run this periodically)
const cleanupChatSessions = () => {
  const now = Date.now()
  const timeout = 30 * 60 * 1000 // 30 minutes

  for (const [sessionId, session] of chatSessions.entries()) {
    if (now - session.lastActivity > timeout) {
      chatSessions.delete(sessionId)
      console.log(`Cleaned up inactive session: ${sessionId}`)
    }
  }
}

// Set up cleanup interval
setInterval(cleanupChatSessions, 5 * 60 * 1000) // Run every 5 minutes

module.exports = {
  async sendMessage(sessionId, message) {
    try {
      console.log(
        `Processing message for session ${sessionId}: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`,
      )

      if (!sessionId) {
        throw new Error("Session ID is required")
      }

      if (!message || message.trim() === "") {
        throw new Error("Message cannot be empty")
      }

      try {
        // First try with chat session
        const { chat } = await getChatSession(sessionId)
        console.log("Got chat session, sending message to Gemini...")

        const result = await chat.sendMessage(message)
        console.log("Received response from Gemini")

        const response = result.response
        return response.text()
      } catch (chatError) {
        console.error("Error with chat session, falling back to simple text generation:", chatError)

        // Fall back to simple text generation if chat fails
        return await simpleTextGeneration(message)
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error)

      // Check for specific error types
      if (error.message.includes("API key")) {
        throw new Error("Lỗi xác thực API. Vui lòng kiểm tra cấu hình API key.")
      }

      if (error.message.includes("quota")) {
        throw new Error("Đã vượt quá giới hạn sử dụng API. Vui lòng thử lại sau.")
      }

      throw new Error("Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.")
    }
  },
}
