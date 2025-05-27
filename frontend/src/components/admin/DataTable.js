"use client"
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi"

const DataTable = ({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
  itemsPerPage = 10,
}) => {
  // Tính số thứ tự bắt đầu cho trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage

  // Tính tổng số trang
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handlePageChange = (page) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  // Tạo columns với STT
  const columnsWithSTT = [
    {
      header: "STT",
      accessor: "stt",
      render: (item, index) => startIndex + index + 1,
    },
    ...columns,
  ]

  // Thêm cột actions nếu có các handler
  if (onView || onEdit || onDelete) {
    columnsWithSTT.push({
      header: "Thao tác",
      accessor: "actions",
      render: (item) => (
        <div className="flex space-x-2">
          {onView && (
            <button onClick={() => onView(item)} className="text-blue-600 hover:text-blue-800" title="Xem chi tiết">
              <FiEye size={16} />
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(item)} className="text-green-600 hover:text-green-800" title="Chỉnh sửa">
              <FiEdit size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-800" title="Xóa">
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ),
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columnsWithSTT.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columnsWithSTT.length} className="px-6 py-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={item.id || rowIndex} className="hover:bg-gray-50">
                  {columnsWithSTT.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item, rowIndex) : item[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, totalItems)}</span> trong{" "}
                <span className="font-medium">{totalItems}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else {
                    const start = Math.max(1, currentPage - 2)
                    const end = Math.min(totalPages, start + 4)
                    page = start + i
                    if (page > end) return null
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? "z-10 bg-primary border-primary text-white"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
