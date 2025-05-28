"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import AdminService from "../../services/admin.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (searchTerm) params.search = searchTerm;
      if (dateRange.startDate) params.start_date = dateRange.startDate;
      if (dateRange.endDate) params.end_date = dateRange.endDate;

      const response = await AdminService.getOrders(params);
      if (response && response.data && response.data.data) {
        setOrders(response.data.data.orders || []);
        setTotalItems(
          response.data.data.total || response.data.data.pagination?.total || 0
        );
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [
    statusFilter,
    paymentStatusFilter,
    searchTerm,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  const handleViewOrder = (order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleUpdateStatus = async (order, newStatus) => {
    try {
      await AdminService.updateOrderStatus(order.id, { status: newStatus });
      toast.success(`Cập nhật trạng thái đơn hàng ${order.id} thành công`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  const orderColumns = [
    { header: "Mã đơn hàng", accessor: "id" },
    {
      header: "Khách hàng",
      accessor: "customer_name",
      render: (item) => (
        <div>
          <div className="font-medium">{item.user_name || "N/A"}</div>
          <div className="text-sm text-gray-500">
            {item.user_email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: "Ngày đặt",
      accessor: "created_at",
      render: (item) => new Date(item.created_at).toLocaleDateString("vi-VN"),
    },
    {
      header: "Tổng tiền",
      accessor: "total_amount",
      render: (item) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item.total_amount),
    },
    {
      header: "Thanh toán",
      accessor: "payment_method",
      render: (item) => (
        <div>
          <div className="font-medium">{item.payment_method || "N/A"}</div>
          <div className="text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.payment_status === "paid"
                  ? "bg-green-100 text-green-800"
                  : item.payment_status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {item.payment_status === "paid"
                ? "Đã thanh toán"
                : item.payment_status === "pending"
                ? "Chờ thanh toán"
                : "Chưa thanh toán"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Trạng thái đơn hàng",
      accessor: "status",
      render: (item) => {
        const statusMap = {
          pending: {
            label: "Chờ xử lý",
            class: "bg-yellow-100 text-yellow-800",
          },
          processing: {
            label: "Đang xử lý",
            class: "bg-blue-100 text-blue-800",
          },
          shipped: {
            label: "Đang giao",
            class: "bg-indigo-100 text-indigo-800",
          },
          delivered: { label: "Đã giao", class: "bg-green-100 text-green-800" },
          cancelled: { label: "Đã hủy", class: "bg-red-100 text-red-800" },
        };

        const status = statusMap[item.status] || {
          label: item.status,
          class: "bg-gray-100 text-gray-800",
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}
          >
            {status.label}
          </span>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Quản lý đơn hàng
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Trạng thái đơn hàng:
            </label>
            <select
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Trạng thái thanh toán:
            </label>
            <select
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm:
            </label>
            <input
              type="text"
              placeholder="Mã đơn, tên khách hàng..."
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Total Count */}
          <div className="flex flex-col justify-end">
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-700">Tổng số:</span>
              <span className="font-semibold ml-1">
                {orders.length} đơn hàng
              </span>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Từ ngày:</span>
            <input
              type="date"
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Đến ngày:</span>
            <input
              type="date"
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DataTable
          columns={orderColumns}
          data={orders}
          onView={handleViewOrder}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
        />
      )}
    </AdminLayout>
  );
};

export default OrdersPage;
