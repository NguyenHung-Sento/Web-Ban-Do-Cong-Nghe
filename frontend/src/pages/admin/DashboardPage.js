"use client"

import { useEffect, useState } from "react"
import { FiShoppingBag, FiUsers, FiDollarSign, FiPackage } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import StatCard from "../../components/admin/StatCard"
import SimpleChart from "../../components/admin/SimpleChart"
import DataTable from "../../components/admin/DataTable"
import AdminService from "../../services/admin.service"
import { toast } from "react-toastify"

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [salesData, setSalesData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch all data in parallel
        const [productsResponse, usersResponse, ordersResponse] = await Promise.all([
          AdminService.getProducts({ limit: 1000 }),
          AdminService.getUsers({ limit: 1000 }),
          AdminService.getOrders({ limit: 1000 }),
        ])

        const products = productsResponse?.data?.data?.products || []
        const users = usersResponse?.data?.data?.users || []
        const orders = ordersResponse?.data?.data?.orders || []

        // Calculate total revenue from orders
        const totalRevenue = orders.reduce((sum, order) => {
          const amount = Number.parseFloat(order.total_amount) || 0
          return sum + amount
        }, 0)

        setStats({
          totalOrders: orders.length,
          totalUsers: users.length,
          totalRevenue: totalRevenue,
          totalProducts: products.length,
        })

        // Get recent orders (last 10)
        const recentOrdersData = orders
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
          .map((order) => ({
            id: order.id,
            customer: order.user_name || order.customer_name || "Khách hàng",
            date: order.created_at,
            amount: Number.parseFloat(order.total_amount) || 0,
            status: mapOrderStatus(order.status) || "Đang xử lý",
          }))

        setRecentOrders(recentOrdersData)

        // Generate sales data by month
        const monthlySales = generateMonthlySalesData(orders)
        setSalesData(monthlySales)

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Không thể tải dữ liệu tổng quan")
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper function to map order status to Vietnamese
  const mapOrderStatus = (status) => {
    const statusMap = {
      pending: "Đang xử lý",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
      paid: "Đã thanh toán",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
    }
    return statusMap[status] || status
  }

  // Helper function to generate monthly sales data
  const generateMonthlySalesData = (orders) => {
    const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()

    // Initialize monthly data with zeros
    const monthlyData = monthNames.map((month) => ({
      label: month,
      value: 0,
    }))

    // Aggregate order amounts by month
    orders.forEach((order) => {
      const orderDate = new Date(order.created_at)
      // Only include orders from the current year
      if (orderDate.getFullYear() === currentYear) {
        const month = orderDate.getMonth()
        const amount = Number.parseFloat(order.total_amount) || 0
        monthlyData[month].value += amount
      }
    })

    // Return the last 6 months of data
    const currentMonth = currentDate.getMonth()
    const last6Months = []

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      last6Months.push(monthlyData[monthIndex])
    }

    return last6Months
  }

  // Calculate order status distribution
  const calculateOrderStatusDistribution = () => {
    if (recentOrders.length === 0) return {}

    const statusCounts = recentOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})

    const total = recentOrders.length
    const distribution = {}

    for (const status in statusCounts) {
      distribution[status] = Math.round((statusCounts[status] / total) * 100)
    }

    return distribution
  }

  const orderStatusDistribution = calculateOrderStatusDistribution()

  const orderColumns = [
    { header: "Mã đơn hàng", accessor: "id" },
    { header: "Khách hàng", accessor: "customer" },
    {
      header: "Ngày đặt",
      accessor: "date",
      render: (item) => new Date(item.date).toLocaleDateString("vi-VN"),
    },
    {
      header: "Tổng tiền",
      accessor: "amount",
      render: (item) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.amount),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (item) => {
        const statusClasses = {
          "Đã giao": "bg-green-100 text-green-800",
          "Đang giao": "bg-blue-100 text-blue-800",
          "Đã thanh toán": "bg-yellow-100 text-yellow-800",
          "Đã hủy": "bg-red-100 text-red-800",
          "Đang xử lý": "bg-gray-100 text-gray-800",
          "Đã xác nhận": "bg-purple-100 text-purple-800",
          "Đang chuẩn bị": "bg-orange-100 text-orange-800",
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[item.status] || "bg-gray-100"}`}>
            {item.status}
          </span>
        )
      },
    },
  ]

  const handleViewOrder = (order) => {
    // Navigate to order detail page
    window.location.href = `/admin/orders/${order.id}`
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Tổng quan</h1>
        <p className="text-gray-600">Chào mừng trở lại, Admin!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Tổng đơn hàng"
          value={stats.totalOrders.toLocaleString()}
          icon={<FiShoppingBag size={24} className="text-blue-600" />}
          change=""
          changeType=""
        />
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          icon={<FiUsers size={24} className="text-green-600" />}
          change=""
          changeType=""
        />
        <StatCard
          title="Tổng doanh thu"
          value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(stats.totalRevenue)}
          icon={<FiDollarSign size={24} className="text-yellow-600" />}
          change=""
          changeType=""
        />
        <StatCard
          title="Tổng sản phẩm"
          value={stats.totalProducts.toLocaleString()}
          icon={<FiPackage size={24} className="text-purple-600" />}
          change=""
          changeType=""
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SimpleChart title="Doanh thu 6 tháng gần đây" data={salesData} />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân bố đơn hàng theo trạng thái</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(orderStatusDistribution).length > 0 ? (
              Object.entries(orderStatusDistribution).map(([status, percentage]) => {
                const statusClasses = {
                  "Đã giao": "bg-green-100 text-green-800",
                  "Đang giao": "bg-blue-100 text-blue-800",
                  "Đã thanh toán": "bg-yellow-100 text-yellow-800",
                  "Đã hủy": "bg-red-100 text-red-800",
                  "Đang xử lý": "bg-gray-100 text-gray-800",
                  "Đã xác nhận": "bg-purple-100 text-purple-800",
                  "Đang chuẩn bị": "bg-orange-100 text-orange-800",
                }

                return (
                  <div key={status} className={`${statusClasses[status] || "bg-gray-100"} rounded-lg p-4 text-center`}>
                    <p className="font-semibold text-lg">{percentage}%</p>
                    <p className="text-sm">{status}</p>
                  </div>
                )
              })
            ) : (
              <div className="col-span-2 text-center text-gray-500">Không có dữ liệu đơn hàng</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Đơn hàng gần đây</h2>
        {recentOrders.length > 0 ? (
          <DataTable
            columns={orderColumns}
            data={recentOrders}
            onView={handleViewOrder}
            itemsPerPage={10}
            searchable={false}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">Không có đơn hàng nào</div>
        )}
      </div>
    </AdminLayout>
  )
}

export default DashboardPage
