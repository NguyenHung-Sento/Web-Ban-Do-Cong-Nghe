const geminiService = require("../services/gemini.service")
const db = require("../config/db.config")
const { v4: uuidv4 } = require("uuid")

// Helper function to search for products based on keywords
const searchProducts = async (keywords) => {
  if (!keywords || keywords.length === 0) return []

  try {
    // Create a search query with multiple keywords
    const searchTerms = keywords.map((keyword) => `%${keyword}%`)

    // Build the query with multiple OR conditions
    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.description, 
        p.slug,
        p.image,
        c.name as category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE `

    // Add conditions for each keyword
    const conditions = searchTerms.map(() => `(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`)
    query += conditions.join(" OR ")

    // Add limit
    query += " LIMIT 3"

    // Flatten parameters for multiple LIKE conditions
    const params = []
    searchTerms.forEach((term) => {
      params.push(term, term, term)
    })

    const [products] = await db.query(query, params)
    return products
  } catch (error) {
    console.error("Error searching products:", error)
    return []
  }
}

// Helper function to extract product keywords from message
const extractProductKeywords = (message) => {
  // List of common product types and brands
  const productTypes = [
    "điện thoại",
    "phone",
    "smartphone",
    "iphone",
    "samsung",
    "xiaomi",
    "oppo",
    "vivo",
    "laptop",
    "máy tính",
    "macbook",
    "asus",
    "acer",
    "dell",
    "hp",
    "lenovo",
    "tablet",
    "ipad",
    "máy tính bảng",
    "galaxy tab",
    "tai nghe",
    "headphone",
    "earbuds",
    "airpods",
    "đồng hồ",
    "watch",
    "apple watch",
    "galaxy watch",
    "sạc",
    "charger",
    "adapter",
    "cáp",
    "cable",
    "ốp lưng",
    "case",
    "bao da",
    "cover",
  ]

  // Convert message to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase()

  // Find all product types mentioned in the message
  const foundKeywords = productTypes.filter((type) => lowerMessage.includes(type))

  // Add any numbers that might be model numbers (e.g., iPhone 13, Galaxy S21)
  const modelNumbers = lowerMessage.match(/\d+/g) || []

  // Combine keywords and model numbers
  return [...foundKeywords, ...modelNumbers]
}

// Helper function to generate suggested questions based on context
const generateSuggestedQuestions = (message, botResponse) => {
  // Default questions
  const defaultQuestions = [
    "Sản phẩm iPhone mới nhất?",
    "Chính sách bảo hành như thế nào?",
    "Cách thức thanh toán?",
    "Thời gian giao hàng?",
    "Làm thế nào để đổi trả sản phẩm?",
  ]

  // If message contains product keywords, suggest product-related questions
  const lowerMessage = message.toLowerCase()
  const lowerResponse = botResponse.toLowerCase()

  if (lowerMessage.includes("iphone") || lowerResponse.includes("iphone")) {
    return [
      "So sánh iPhone 15 và iPhone 14?",
      "iPhone nào có pin tốt nhất?",
      "Giá iPhone 15 Pro Max?",
      "Chính sách bảo hành iPhone?",
      "iPhone có chống nước không?",
    ]
  }

  if (lowerMessage.includes("samsung") || lowerResponse.includes("samsung")) {
    return [
      "Galaxy S23 Ultra có gì mới?",
      "So sánh Samsung và iPhone?",
      "Giá Galaxy Z Fold?",
      "Samsung nào chụp ảnh tốt nhất?",
      "Chính sách bảo hành Samsung?",
    ]
  }

  if (lowerMessage.includes("laptop") || lowerResponse.includes("laptop")) {
    return [
      "Laptop nào phù hợp cho sinh viên?",
      "MacBook và laptop Windows khác nhau thế nào?",
      "Laptop gaming tốt nhất?",
      "Laptop nào có pin trâu nhất?",
      "Chính sách bảo hành laptop?",
    ]
  }

  if (
    lowerMessage.includes("đơn hàng") ||
    lowerResponse.includes("đơn hàng") ||
    lowerMessage.includes("giao hàng") ||
    lowerResponse.includes("giao hàng")
  ) {
    return [
      "Kiểm tra trạng thái đơn hàng?",
      "Thời gian giao hàng?",
      "Phí vận chuyển?",
      "Hủy đơn hàng?",
      "Thay đổi địa chỉ giao hàng?",
    ]
  }

  if (lowerMessage.includes("thanh toán") || lowerResponse.includes("thanh toán")) {
    return [
      "Các phương thức thanh toán?",
      "Thanh toán qua Momo?",
      "Thanh toán qua VNPay?",
      "Thanh toán khi nhận hàng?",
      "Trả góp 0%?",
    ]
  }

  // Default to general questions if no specific context is found
  return defaultQuestions
}

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body
    console.log(`Received message request:`, req.body)

    // Validate input
    if (!message) {
      return res.status(400).json({
        status: "error",
        message: "Tin nhắn không được để trống",
      })
    }

    // Generate or use existing session ID
    const chatSessionId = sessionId || uuidv4()
    console.log(`Using session ID: ${chatSessionId}`)

    // Send message to Gemini
    const botResponse = await geminiService.sendMessage(chatSessionId, message)

    // Extract product keywords from user message and bot response
    const messageKeywords = extractProductKeywords(message)
    const responseKeywords = extractProductKeywords(botResponse)
    const allKeywords = [...new Set([...messageKeywords, ...responseKeywords])]

    // Search for relevant products if keywords are found
    let products = []
    if (allKeywords.length > 0) {
      products = await searchProducts(allKeywords)
    }

    // Generate suggested follow-up questions
    const suggestedQuestions = generateSuggestedQuestions(message, botResponse)

    return res.status(200).json({
      status: "success",
      data: {
        message: botResponse,
        sessionId: chatSessionId,
        products,
        suggestedQuestions,
      },
    })
  } catch (error) {
    console.error("Error in chatbot controller:", error)
    return res.status(500).json({
      status: "error",
      message: error.message || "Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.",
    })
  }
}
