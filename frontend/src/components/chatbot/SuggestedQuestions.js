"use client"

const SuggestedQuestions = ({ questions, onSelectQuestion }) => {
  if (!questions || questions.length === 0) return null

  return (
    <div className="mt-2 mb-4">
      <p className="text-sm text-gray-600 mb-2">Bạn có thể hỏi:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(question)}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-full transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SuggestedQuestions
