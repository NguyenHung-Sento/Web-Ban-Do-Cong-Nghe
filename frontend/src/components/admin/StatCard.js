import { FiArrowUp, FiArrowDown } from "react-icons/fi"

const StatCard = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="p-2 rounded-full bg-gray-100">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === "increase" ? (
                <FiArrowUp className="text-green-500 mr-1" />
              ) : (
                <FiArrowDown className="text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${changeType === "increase" ? "text-green-500" : "text-red-500"}`}>
                {change}%
              </span>
              <span className="text-xs text-gray-500 ml-1">so với tháng trước</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatCard
