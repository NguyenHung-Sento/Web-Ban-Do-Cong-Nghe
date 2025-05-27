"use client"

import { useEffect, useRef } from "react"

const SimpleChart = ({ title, data }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const { width, height } = canvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Chart dimensions
    const padding = 60
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    // Find max value for scaling
    const maxValue = Math.max(...data.map((item) => item.value))
    const minValue = 0

    // If all values are 0, show a flat line
    const range = maxValue - minValue || 1

    // Draw background
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = "#e9ecef"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i < data.length; i++) {
      const x = padding + (chartWidth / (data.length - 1)) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Draw chart line
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3
    ctx.beginPath()

    data.forEach((item, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      const y = height - padding - ((item.value - minValue) / range) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw data points
    ctx.fillStyle = "#3b82f6"
    data.forEach((item, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      const y = height - padding - ((item.value - minValue) / range) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"

    // X-axis labels (months)
    data.forEach((item, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      ctx.fillText(item.label, x, height - padding + 20)
    })

    // Y-axis labels (values)
    ctx.textAlign = "right"
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (range / 5) * (5 - i)
      const y = padding + (chartHeight / 5) * i
      const formattedValue = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
      ctx.fillText(formattedValue, padding - 10, y + 4)
    }

    // Draw title
    ctx.fillStyle = "#374151"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText(title, width / 2, 30)
  }, [data, title])

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">Không có dữ liệu</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <canvas ref={canvasRef} width={500} height={300} className="w-full h-auto" />
    </div>
  )
}

export default SimpleChart
