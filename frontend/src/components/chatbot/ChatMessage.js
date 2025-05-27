import React from "react"
import { Link } from "react-router-dom"

// Product Card component for chatbot
const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="block border rounded-lg overflow-hidden mb-2 hover:shadow-md transition-shadow"
    >
      <div className="flex">
        <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
          <img
            src={product.image || `/placeholder.svg?height=80&width=80`}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-2 flex-1">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h4>
          <p className="text-red-600 font-bold text-sm mt-1">{Number(product.price).toLocaleString("vi-VN")}đ</p>
        </div>
      </div>
    </Link>
  )
}

const ChatMessage = ({ message }) => {
  const { text, sender, isError, products } = message

  // Check if the message contains product data
  const hasProducts = products && products.length > 0

  // Format the message text to preserve line breaks
  const formattedText = text.split("\n").map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < text.split("\n").length - 1 && <br />}
    </React.Fragment>
  ))

  if (sender === "bot") {
    return (
      <div className="flex mb-4">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center mr-2 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </div>
        <div className={`rounded-lg py-2 px-3 max-w-[80%] ${isError ? "bg-red-100 text-red-800" : "bg-gray-100"}`}>
          {isError ? (
            <div>
              <p className="font-semibold mb-1">Lỗi</p>
              {formattedText}
            </div>
          ) : (
            <div>
              {formattedText}

              {/* Display product cards if available */}
              {hasProducts && (
                <div className="mt-3 border-t pt-2">
                  <p className="text-sm font-medium mb-2">Sản phẩm gợi ý:</p>
                  <div className="space-y-2">
                    {products.map((product, index) => (
                      <ProductCard key={index} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  } else {
    return (
      <div className="flex mb-4 justify-end">
        <div className="rounded-lg py-2 px-3 bg-red-600 text-white max-w-[80%]">{formattedText}</div>
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-700"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    )
  }
}

export default ChatMessage
