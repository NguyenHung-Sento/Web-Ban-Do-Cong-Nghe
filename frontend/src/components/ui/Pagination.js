"use client"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = []

  // Generate page numbers
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  // Limit the number of page buttons shown
  let pagesToShow = []
  if (totalPages <= 5) {
    pagesToShow = pages
  } else {
    if (currentPage <= 3) {
      pagesToShow = [...pages.slice(0, 5), "...", totalPages]
    } else if (currentPage >= totalPages - 2) {
      pagesToShow = [1, "...", ...pages.slice(totalPages - 5)]
    } else {
      pagesToShow = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
    }
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-10 h-10 rounded-md ${
            currentPage === 1
              ? "text-gray-dark bg-gray-medium cursor-not-allowed"
              : "text-dark bg-white hover:bg-gray-medium"
          }`}
        >
          <FiChevronLeft size={20} />
        </button>

        {pagesToShow.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`flex items-center justify-center w-10 h-10 rounded-md ${
              page === currentPage
                ? "bg-primary text-white"
                : page === "..."
                  ? "text-gray-dark bg-white cursor-default"
                  : "text-dark bg-white hover:bg-gray-medium"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-10 h-10 rounded-md ${
            currentPage === totalPages
              ? "text-gray-dark bg-gray-medium cursor-not-allowed"
              : "text-dark bg-white hover:bg-gray-medium"
          }`}
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default Pagination

