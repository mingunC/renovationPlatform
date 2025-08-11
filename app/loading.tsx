export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Main Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400 mx-auto opacity-30"></div>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading Renovate Platform
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Setting up your renovation project experience...
        </p>

        {/* Progress Dots */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Loading Tips */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border max-w-md mx-auto">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> While you wait, did you know that verified contractors 
            receive 3x more project opportunities?
          </p>
        </div>
      </div>
    </div>
  )
}
