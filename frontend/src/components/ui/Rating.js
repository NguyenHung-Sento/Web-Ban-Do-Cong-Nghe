import { FiStar } from "react-icons/fi"

const Rating = ({ value, text, color = "text-yellow-400" }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {value >= star ? (
            <FiStar className={`${color} fill-current`} />
          ) : value >= star - 0.5 ? (
            <FiStar className={`${color} fill-current`} style={{ clipPath: "inset(0 50% 0 0)" }} />
          ) : (
            <FiStar className="text-gray-300" />
          )}
        </span>
      ))}
      {text && <span className="ml-2 text-sm text-gray-dark">{text}</span>}
    </div>
  )
}

export default Rating
